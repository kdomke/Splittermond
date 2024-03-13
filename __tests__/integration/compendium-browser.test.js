import {simplePropertyResolver} from "../util.js";

export function compendiumBrowserTest(context) {
    const {describe, it, expect} = context;

    describe("foundry API compatibility", () => {
        it("game.packs can be sorted by documentName", () => {
            expect(game.packs.filter).to.be.a("function");
            expect(game.packs.filter(pack => pack.documentName === "Item")).to.have.length.greaterThan(0);
            expect(game.packs.filter(pack => pack.documentName === "Item")).and.to.have.length.lessThan(game.packs.size);
        });

        it("receives an index with objects that have the expected properties", async () => {
            if (game.packs.length === 0) {
                this.skip();
            }
            const searchParam = {fields: ["system.skill", "name"]};
            const firstCompendiumKey = game.packs.keys().next().value;
            const index = await game.packs.get(firstCompendiumKey).getIndex(searchParam);
            expect(index).to.be.instanceOf(Collection).and.to.have.length.greaterThan(0);
            const indexKey = index.keys().next().value;
            searchParam.fields.forEach(expectedProperty => {
                expect(simplePropertyResolver(index.get(indexKey), expectedProperty), `Property ${expectedProperty}`)
                    .not.to.be.undefined; //jshint ignore:line
            });
        });

        it("i18n contains a localize function that translates the given string", async () => {
            expect(game.i18n).to.have.property("localize");
            expect(game.i18n.localize("splittermond.skillLabel.deathmagic")).to.equal("Todesmagie");
        });

        it("deepClone clones deeply", () => {
            const probe = {
               topLevel :{secondLevel: "value2", deleteMe:""},
               next: "value",
            };
            const clone = deepClone(probe);
            delete clone.topLevel.deleteMe;
            expect(probe.topLevel).to.have.property("deleteMe");
        });
    });

    describe("getData", () => {
        it("should return an object with the expected properties", async () => {
            if(game.packs.length === 0) {
                this.skip();
            }
            const data = await game.splittermond.compendiumBrowser.getData();
            expect(data).to.have.property("items");
            expect(data.items).to.have.property("mastery");
            expect(data.items).to.have.property("spell");
            expect(data.items).to.have.property("weapon");
        });

    });
}