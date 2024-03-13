import {compendiumBrowserTest} from "./compendium-browser.test.js";
import {itemTest} from "./item.js";


function registerQuenchTests(quench) {
    quench.registerBatch("compendium-browser", compendiumBrowserTest);
    quench.registerBatch("item", itemTest);
}

export function init() {
    // Use Quench's ready hook to add our tests. This hook will never be triggered if Quench isn't loaded.
    Hooks.on("quenchReady", registerQuenchTests);
}