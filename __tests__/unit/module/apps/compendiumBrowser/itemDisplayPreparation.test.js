import {describe, it} from "mocha";
import {expect} from "chai";
import {initializeDisplayPreparation} from "../../../../../module/apps/compendiumBrowser/itemDisplayPreparation.js";
import {identity} from "../../../foundryMocks.js";

const defautItem = {
    folder: "",
    sort: 0,
    img: "",
    uuid: "",
    _id: "",
};
/**@returns{ItemIndexEntity}*/
function getSampleSpellItem() {
    return {
        ...defautItem,
        type: "spell",
        name: "Licht",
        system: {
            level: "",
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
        ...defautItem,
        type: "mastery",
        name: "Abdrängen",
        system: {
            level: "1",
            availableIn: "staffs",
            skill: "staffs",
            features: "",
            skillLevel: 0,
        }
    };
}

function getSampleWeaponItem() {
    return {
        ...defautItem,
        type: "weapon",
        name: "Schwert",
        system: {
            level: "",
            availableIn: "",
            skill: "swords",
            features: "Scharf 2",
            skillLevel: 0
        }
    };
}

const sampleCompendiumData = {id: "world.discarded", label: "Ablage P"};
const getAllItemData = () => [getSampleSpellItem(), getSampleMasteryItem(), getSampleWeaponItem()];

describe("spell item preparation for compendium browser", () => {
    /** @type {{localize: (x:string)=>string}} */
    const spellI18n = {
        localize: /**@param {string} str*/(str) => str === `splittermond.skillLabel.lightmagic` ? "Lichtmagie" : "Schattenmagie"
    };
    const produceDisplayableItems =initializeDisplayPreparation(spellI18n, ["lightmagic", "shadowmagic"], []);
    it("should sort item types into separate arrays", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector).to.include.keys("spell");
        expect(collector.spell[0]).to.deep.contain(withoutSystemProperties(getSampleSpellItem(), "level","features"));
    });

    it("should add metadata to spells", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
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
        expect(collector.spell[0].availableInList).to.deep.equal([{label: "Lichtmagie 1"}, {label: "Schattenmagie 3"}]);
    });

    it("should not have features, nor level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleSpellItem(), getSampleMasteryItem()]), collector);
        expect(collector.spell[0].level).to.be.undefined; //jshint ignore:line
        expect(collector.spell[0].features).to.be.undefined; //jshint ignore:line
    });
    it("should have skill, and skill level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.spell[0].system.skillLevel).not.to.be.undefined; //jshint ignore:line
        expect(collector.spell[0].system.skill).not.to.be.undefined; //jshint ignore:line
    });
});

describe("mastery item preparation for compendium browser", () => {
    /** @type {{localize: (x:string)=>string}} */
    const masteryI18n = {
        localize: /*@param {string} str*/(str) => str === `splittermond.skillLabel.staffs` ? "Stangenwaffen" : "Klingenwaffen"
    };
    const produceDisplayableItems = initializeDisplayPreparation(masteryI18n, [], ["swords", "staffs"]);
    it("should sort item types into separate arrays", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector).to.include.keys("mastery");
        expect(collector.mastery[0]).to.deep.contain(withoutSystemProperties(getSampleMasteryItem(), "features","skillLevel"));
    });

    it("should add metadata to masteries", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
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

    it("should produce mastery tags", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve([getSampleMasteryItem()]), collector);
        expect(collector.mastery[0].availableInList).to.deep.equal([{label: "Stangenwaffen"}]);
    });

    it("should not have features, nor skill, nor skill level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.mastery[0].skillLevel).to.be.undefined; //jshint ignore:line
        expect(collector.mastery[0].features).to.be.undefined; //jshint ignore:line
    });

    it("should have skill, and skill level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.mastery[0].system.level).not.to.be.undefined; //jshint ignore:line
        expect(collector.mastery[0].system.skill).not.to.be.undefined; //jshint ignore:line
    });
});

describe("weapon item preparation for compendium browser", () => {
    const produceDisplayableItems = initializeDisplayPreparation({localize: identity}, [], []);
    it("should sort item types into separate arrays", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector).to.include.keys("weapon");
        expect(collector.weapon[0]).to.deep
            .contain(withoutSystemProperties(getSampleWeaponItem() , "skillLevel","level"));
    });
    it("should throw an error if the item is not a weapon", async () => {
        const malformedWeapon = getSampleWeaponItem();
        delete malformedWeapon.system.features;
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()),{})
            .catch(err => {
                expect(err).to.be.an.instanceOf(Error);
                expect(err.message).to.equal(`Item '${malformedWeapon.name}' is not a weapon`);
            });
    });

    it("should produce weapon tags", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.weapon[0].featuresList).to.deep.equal(["Scharf 2"]);
    });

    it("should neither have skill, nor skill level, nor level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.weapon[0].system.skillLevel).to.be.undefined; //jshint ignore:line
        expect(collector.weapon[0].system.level).to.be.undefined; //jshint ignore:line
    });

    it("should have features, and skill level", async () => {
        const collector = {};
        await produceDisplayableItems(sampleCompendiumData, Promise.resolve(getAllItemData()), collector);
        expect(collector.weapon[0].system.features).not.to.be.undefined; //jshint ignore:line
        expect(collector.weapon[0].system.skill).not.to.be.undefined; //jshint ignore:line
    });
});

/**
 * @template T
 * @param {T} obj
 * @param {string[]} properties
 * @returns {T & {[x:property]:never}}
 */
function withoutSystemProperties(obj, ...properties) {
    properties.forEach(prop => delete obj.system[prop]);
    return obj;
}

