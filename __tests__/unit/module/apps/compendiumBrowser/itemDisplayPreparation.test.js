import {describe, it} from "mocha";
import {expect} from "chai";
import {produceDisplayableItems} from "../../../../../module/apps/compendiumBrowser/itemDisplayPreparation.js";
import {identity} from "../../../foundryMocks.js";

global.CONFIG = {
    splittermond: {
        skillGroups: {
            magic: ["lightmagic", "shadowmagic"]
        }
    }
};

const masteryI18n = {
    localize: (str) => str === `splittermond.skillLabel.staffs` ? "Stangenwaffen" : "Klingenwaffen"
};

const spellI18n = {
    localize: (str) => str === `splittermond.skillLabel.lightmagic` ? "Lichtmagie" : "Schattenmagie"
};


/**@returns{ItemIndexEntity}*/
function getSampleSpellItem() {
    return {
        type: "spell",
        name: "Licht",
        system: {
            availableIn: "lightmagic 1, shadowmagic 3",
            skill: "lightmagic",
            features: "",
            skillLevel: 1
        }
    };
}

/**@returns {ItemIndexEntity}*/
function getSampleMasteryItem() {
    return {
        type: "mastery",
        name: "Rasende Untote",
        system: {
            availableIn: "deathamagic",
            skill: "deathmagic",
            features: "",
            skillLevel: 1
        }
    };
}

const sampleCompendiumData = {id: "world.discarded", label: "Ablage P"};

describe("spell item preparation for compendium browser", () => {
    game.i18n = spellI18n;
    it("should sort item types into separate arrays", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector).to.include.keys("spell");
        expect(collector.spell[0]).to.deep.contain(getSampleSpellItem());
        expect(collector.mastery[0]).to.deep.contain(getSampleMasteryItem());
    });

    it("should add metadata to spells", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector.spell[0]).to.deep.contain({compendium: {metadata: sampleCompendiumData}});
    });


    it("should throw an error if the item is not a spell", async () => {
        const malformedSpell = getSampleSpellItem();
        delete malformedSpell.system.skill;
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([malformedSpell, getSampleMasteryItem()]), {})
            .catch(err => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal(`Item '${malformedSpell.name}' is not a spell`);
            });
    });

    it("should produce spell tags", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector.spell[0].availableInList).to.deep.equal([{label:"Lichtmagie 1"},{label:"Schattenmagie 3"}]);
    });
});

describe("mastery item preparation for compendium browser", () => {
    //game.i18n = masteryI18n;
    it("should sort item types into separate arrays", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector).to.include.keys("mastery");
        expect(collector.mastery[0]).to.deep.contain(getSampleMasteryItem());
    });

    it("should add metadata to masteries", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector.mastery[0]).to.deep.contain({compendium: {metadata: sampleCompendiumData}});
    });

    it("should throw an error if the item is not a mastery", async () => {
        const malformedMastery = getSampleMasteryItem();
        delete malformedMastery.system.skill;
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([malformedMastery, getSampleMasteryItem()]), {})
            .catch(err => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal(`Item '${malformedMastery.name}' is not a mastery`);
            });
    });
});



