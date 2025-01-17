import {foundryApi} from "./api/foundryApi";
import type {SettingsConfig, SettingTypeMapper, SettingTypes} from "./api/foundryTypes";

let gameInitialized = false;
const settingsQueue: { position: number | null, action: Function }[] = [];

type PartialSettings<T extends SettingTypes> = Omit<SettingsConfig<T>, "type" | "name" | "hint"> & {
    position?: number
};
type SettingAccessor<T extends SettingTypes> = {
    get(): SettingTypeMapper<T>,
    set(value: SettingTypeMapper<T>): void
}

/**
 * Register a new setting
 */
async function registerSetting<T extends SettingTypes>(key: string, setting: PartialSettings<T> & {
    type: T
}): Promise<SettingAccessor<T>> {
    const action = () => {
        const nameKey = `splittermond.settings.${key}.name`;
        const hintKey = `splittermond.settings.${key}.hint`;
        foundryApi.settings.register<T>("splittermond", key, {name: nameKey, hint: hintKey, ...setting});
    }
    const accessors = {
        get() {
            return foundryApi.settings.get("splittermond", key);
        },
        set(value: SettingTypeMapper<T>) {
            return foundryApi.settings.set("splittermond", key, value);
        }
    };
    if (!gameInitialized) {
        console.log(`Game not initialized, adding ${key} to queue`);
        addToRegisterQueue(action, setting.position ?? null);
        return delayAccessors(() => accessors);
    }
    return delayAccessors(() => {
        action();
        return accessors;
    });
}

function addToRegisterQueue(action: Function, position: number | null) {
    console.log("Before", [...settingsQueue]);
    if (position === null) {
        settingsQueue.push({position, action});
    } else {
        const insertAt=settingsQueue.findIndex(({position: p}) => p===null || p > position);
        settingsQueue.splice(insertAt, 0, {position, action});
    }
    console.log("After", [...settingsQueue]);
}

function delayAccessors(action: () => any): Promise<any> {
    return new Promise((resolve, reject) => {
        const checkInitialized = (invocation: number) => {
            if (invocation > 20) {
                return reject(`Game not initialized after 2 seconds`);
            } else if (gameInitialized) {
                return resolve(action())
            } else {
                return setTimeout(() => checkInitialized(++invocation), 100);
            }
        }
        checkInitialized(0);
    });
}

async function registerStringSetting(key: string, setting: PartialSettings<StringConstructor>) {
    return registerSetting(key, {...setting, type: String, range: undefined});
}

async function registerNumberSetting(key: string, setting: PartialSettings<NumberConstructor>) {
    return registerSetting(key, {...setting, type: Number});
}

async function registerBooleanSetting(key: string, setting: Omit<PartialSettings<BooleanConstructor>, "range">) {
    return registerSetting(key, {...setting, type: Boolean, range: undefined});
}

export const settings = {
    registerString: registerStringSetting,
    registerNumber: registerNumberSetting,
    registerBoolean: registerBooleanSetting,
}

export const registerSystemSettings = async function (): Promise<void> {
    registerStringSetting("theme", {
        position: 2,
        scope: "client",
        config: true,
        choices: {// If choices are defined, the resulting setting will be a select menu
            "default": "splittermond.settings.theme.options.default",
            "dark": "splittermond.settings.theme.options.dark",
            "splittermond-blue": "splittermond.settings.theme.options.splittermond_blue",
        },
        default: "default",
        onChange: (theme: string) => {
            document.body.setAttribute("data-theme", theme);
        }
    }).then((accessor) => {
        document.body.setAttribute("data-theme", accessor.get());
    });

    registerBooleanSetting("showHotbarDuringActionBar", {
        position: 4,
        scope: "client",
        config: true,
        default: true,
        onChange: () => {
            setTimeout(() => {
                global.game.splittermond.tokenActionBar.update();
            }, 500);

        }
    });
    registerBooleanSetting("showActionBar", {
        position: 3,
        scope: "client",
        config: true,
        default: true,
        onChange: () => {
            setTimeout(() => {
                global.game.splittermond.tokenActionBar.update();
            }, 500);

        }
    });


    settingsQueue.forEach(({action}) => action());
    gameInitialized = true;
}

declare namespace global {
    const game: {
        splittermond: {
            tokenActionBar: { update: () => void },
        },
    }
}
