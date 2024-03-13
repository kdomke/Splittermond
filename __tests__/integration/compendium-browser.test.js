import {simplePropertyResolver} from "../util.js";

export function compendiumBrowserTest(context) {
    const {describe, it, expect} = context;

    describe("foundry API compatibility", () => {
        it("receives an index with objects that have the expected properties", async () => {
            if (game.packs.length === 0) {
                this.skip()
            }
            const searchParam = {fields: ["system.skill", "name"]}
            const firstCompendiumKey = game.packs.keys().next().value;
            const index = await game.packs.get(firstCompendiumKey).getIndex(searchParam);
            expect(index).to.be.instanceOf(Collection).and.to.have.length.greaterThan(0);
            const indexKey = index.keys().next().value
            searchParam.fields.forEach(expectedProperty => {
                expect(simplePropertyResolver(index.get(indexKey), expectedProperty), `Property ${expectedProperty}`)
                    .not.to.be.undefined;
            });
        });

        it("i18n contains a localize function that translates the given string", async () => {
            expect(game.i18n).to.have.property("localize");
            expect(game.i18n.localize("splittermond.skillLabel.deathmagic")).to.equal("Todesmagie");
        });
    });
}