import {compendiumBrowserTest} from "./compendium-browser.test.js";
import {itemTest} from "./item.js";
import {chatActionFeature} from "./chatActionFeature.js";


function registerQuenchTests(quench) {
    quench.registerBatch("compendium-browser", compendiumBrowserTest);
    quench.registerBatch("item", itemTest);
    quench.registerBatch("chatSystem", chatActionFeature);
}

export function init() {
    // Use Quench's ready hook to add our tests. This hook will never be triggered if Quench isn't loaded.
    Hooks.on("quenchReady", registerQuenchTests);
}