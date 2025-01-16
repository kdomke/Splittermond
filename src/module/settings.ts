import { foundryApi } from "./api/foundryApi";
import type {SettingsConfig, SettingTypeMapper, SettingTypes} from "./api/foundryTypes";

let gameInitialized = false;
const prematurelyRegisteredSettings: Promise<any>[] = [];

type PartialSettings<T extends SettingTypes> = Omit<SettingsConfig<T>, "type" | "name" | "hint">;
type SettingAccessor<T extends SettingTypes> = {
    get(): SettingTypeMapper<T>,
    set(value: SettingTypeMapper<T>): void
}

/**
 * Register a new setting
 */
async function registerSetting<T extends SettingTypes>(key: string, setting: Omit<SettingsConfig<T>, "name" | "hint">): Promise<SettingAccessor<T>> {
    const nameKey = `splittermond.settings.${key}.name`;
    const hintKey = `splittermond.settings.${key}.hint`;
    const action = () => {
        foundryApi.settings.register<T>("splittermond", key, { name: nameKey, hint: hintKey, ...setting });
        return {
            get() {
                return foundryApi.settings.get("splittermond", key);
            },
            set(value: SettingTypeMapper<T>) {
                return foundryApi.settings.set("splittermond", key, value);
            }
        }
    };
    const promise = delayAction(action);
    if (!gameInitialized) {
        prematurelyRegisteredSettings.push(promise);
    }
    return promise;
}

function delayAction(action: () => any): Promise<any> {
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
    return registerSetting(key, { ...setting, type: String, range: undefined });
}

async function registerNumberSetting(key: string, setting: PartialSettings<NumberConstructor>) {
    return registerSetting(key, { ...setting, type: Number });
}

async function registerBooleanSetting(key: string, setting: Omit<PartialSettings<BooleanConstructor>, "range">) {
    return registerSetting(key, { ...setting, type: Boolean, range: undefined });
}

export const settings = {
    registerString: registerStringSetting,
    registerNumber: registerNumberSetting,
    registerBoolean: registerBooleanSetting,
}

export const registerSystemSettings = async function (): Promise<void> {
    /**
     * Track the system version upon which point a migration was last applied
     */
    foundryApi.settings.register("splittermond", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    /**
     * Register resting variants
     */
    foundryApi.settings.register("splittermond", "HGMultiplier", {
        name: "SETTINGS.HGMultiplierN",
        hint: "SETTINGS.HGMultiplierL",
        scope: "world",
        config: true,
        type: Number,
        default: 1.0,
        range: {
            min: 0.5,
            max: 2.0,
            step: 0.25
        },
        onChange: (mult: number) => {
            console.log("HGMultiplier adjusted!");
            global.game.splittermond.heroLevel = global.CONFIG.splittermond.heroLevel.map(function (x: number) {
                return x * mult;
            });
            global.game.actors.forEach((actor: any) => {
                if (actor.system.type === "character") {
                    actor.prepareData();
                }
            });
        }
    });

    registerStringSetting("theme", {
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
    }).then((accessor) =>{
        document.body.setAttribute("data-theme", accessor.get());
    });

    prematurelyRegisteredSettings.push(registerBooleanSetting("showActionBar", {
        scope: "client",
        config: true,
        default: true,
        onChange: () => {
            setTimeout(() => {
                global.game.splittermond.tokenActionBar.update();
            }, 500);

        }
    }));

    prematurelyRegisteredSettings.push(registerBooleanSetting("showHotbarDuringActionBar", {
        scope: "client",
        config: true,
        default: true,
        onChange: () => {
            setTimeout(() => {
                global.game.splittermond.tokenActionBar.update();
            }, 500);

        }
    }));

    gameInitialized = true;
    await Promise.all(prematurelyRegisteredSettings);
}

declare namespace global {
    const game : {
        splittermond : {
            tokenActionBar: {update: () => void},
            heroLevel: number[]
        },
        actors: any,
    }
    const CONFIG: {splittermond: typeof game["splittermond"]};
}
