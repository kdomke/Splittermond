import {foundryApi} from "./api/foundryApi";

let gameInitialized = false;

/**
 * Register a new setting
 * @param {string} key
 * @param {Omit<SettingsConfig, "name"|"hint">}setting
 * @returns {Promise<{get(): number | boolean | string, set(value: number | boolean | string): void}>}
 */
async function registerSetting(key, setting) {
    const nameKey = `splittermond.settings.${key}.name`;
    const hintKey = `splittermond.settings.${key}.hint`;
    const action = () => {
        foundryApi.settings.register("splittermond", key, {name: nameKey, hint: hintKey, ...setting});
        return {
            get() {
                return foundryApi.settings.get("splittermond", key);
            },
            set(value) {
                return foundryApi.settings.set("splittermond", key, value);
            }
        }
    };
    return new Promise((resolve, reject) => {
        const checkInitialized = (invocation) => {
            if (invocation > 20) {
                return reject("Game not initialized after 2 seconds");
            } else if (gameInitialized) {
                return resolve(action())
            } else {
                setTimeout(() => checkInitialized(invocation++), 100);
            }
        }
        checkInitialized(0);
    });
}

/**
 * @param {string} key
 * @param {Omit<SettingsConfig,"type"|"name","hint">}setting
 * @returns {Promise<{get(): string, set(value: string): void}>}
 */
async function registerStringSetting(key, setting) {
    return registerSetting(key, {...setting, type: String, range: undefined});
}

/**
 * @param {string} key
 * @param {Omit<SettingsConfig,"type"|"name","hint">}setting
 * @returns {Promise<{get(): number, set(value: number): void}>}
 */
async function registerNumberSetting(key, setting) {
    return registerSetting(key, {...setting, type: Number,});
}

/**
 * @param {string} key
 * @param {Omit<SettingsConfig,"type"|"name"|"hint"|"range">}setting
 * @returns {Promise<{get(): boolean, set(value: boolean): void}>}
 */
async function registerBooleanSetting(key, setting) {
    return registerSetting(key, {...setting, type: Boolean, range: undefined});
}

export const settings = {
    registerString: registerStringSetting,
    registerNumber: registerNumberSetting,
    registerBoolean: registerBooleanSetting,
}

export const registerSystemSettings = function () {
    gameInitialized = true;
    /**
     * Track the system version upon which point a migration was last applied
     */
    game.settings.register("splittermond", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

    /**
     * Register resting variants
     */
    game.settings.register("splittermond", "HGMultiplier", {
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
        onChange: mult => {
            console.log("HGMultiplier adjusted!");
            game.splittermond.heroLevel = CONFIG.splittermond.heroLevel.map(function (x) {
                return x * mult;
            });
            game.actors.forEach(actor => {
                if (actor.system.type == "character") {
                    actor.prepareData();
                }
            });
        }
    });

    game.settings.register("splittermond", "theme", {
        name: "splittermond.settings.theme.name",
        hint: "splittermond.settings.theme.hint",
        scope: "client",
        config: true,
        type: String,
        choices: {           // If choices are defined, the resulting setting will be a select menu
            "default": "splittermond.settings.theme.options.default",
            "dark": "splittermond.settings.theme.options.dark",
            "splittermond-blue": "splittermond.settings.theme.options.splittermond_blue",
        },
        default: "default",
        onChange: theme => {
            document.body.setAttribute("data-theme", theme);
        }
    });

    game.settings.register("splittermond", "showActionBar", {
        name: "splittermond.settings.showActionBar.name",
        hint: "splittermond.settings.showActionBar.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: useActionBar => {
            setTimeout(() => {
                game.splittermond.tokenActionBar.update();
            }, 500);

        }
    });

    game.settings.register("splittermond", "showHotbarDuringActionBar", {
        name: "splittermond.settings.showHotbarDuringActionBar.name",
        hint: "splittermond.settings.showHotbarDuringActionBar.hint",
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: useActionBar => {
            setTimeout(() => {
                game.splittermond.tokenActionBar.update();
            }, 500);

        }
    });


    document.body.setAttribute("data-theme", game.settings.get("splittermond", "theme"));

}