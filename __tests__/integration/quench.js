import {compendiumBrowserTest} from "./compendium-browser.test.js";
import {itemTest} from "./item.test.js";
import {chatActionFeatureTest} from "./chatActionFeature.test.js";
import {dataModelTest} from "./dataModel.test.ts.js";
import {DamageRollTest} from "./DamageRoll.test.js";


function registerQuenchTests(quench) {
    quench.registerBatch("compendium-browser", compendiumBrowserTest);
    quench.registerBatch("item", itemTest);
    quench.registerBatch("chatSystem", chatActionFeatureTest);
    quench.registerBatch("dataModel", dataModelTest);
    quench.registerBatch("damageRoll", DamageRollTest);
}

export function init() {
    // Use Quench's ready hook to add our tests. This hook will never be triggered if Quench isn't loaded.
    Hooks.on("quenchReady", registerQuenchTests);
}