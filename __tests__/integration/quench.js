import {compendiumBrowserTest} from "./compendium-browser.test.js";


function registerQuenchTests(quench) {
    quench.registerBatch("compendium-browser", compendiumBrowserTest);
}

export function init() {
    // Use Quench's ready hook to add our tests. This hook will never be triggered if Quench isn't loaded.
    Hooks.on("quenchReady", registerQuenchTests);
}