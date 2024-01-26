
export function compendiumBrowserTest(context) {
    const { describe, it, beforeEach, expect } = context;

    describe("basic display",() =>{
        it("displays the compendium browser", async () => {
            const start = performance.now();
            await game.splittermond.compendiumBrowser.render(true);
            expect(performance.now() - start, "Render time in ms").to.be.lessThanOrEqual(3000);
        });
    });
}