import {newMasteryAvailabilityParser, newSpellAvailabilityParser} from "../../../../module/item/availabilityParser.js";
import {describe, it} from 'mocha';
import {expect} from 'chai';

const magicSkills = [
    "fatemagic",
    "deathmagic",
];

const masterySkills = [
    "staffs",
    "swords"
];

const masteryI18n = {
    localize: (str) => str === `splittermond.skillLabel.${masterySkills[0]}` ? "Stangenwaffen" : "Klingenwaffen"
};

const spellI18n = {
    localize: (str) => str === `splittermond.skillLabel.${magicSkills[0]}` ? "Schicksalsmagie" : "Todesmagie"
};
describe("spell availabilty display transformation", () => {
    'use strict';
    const parser = newSpellAvailabilityParser(spellI18n, magicSkills);
    it("should return the input if no transformation is set", () => {
        const input = "Maggie";
        expect(parser.toDisplayRepresentation(input)).to.equal(input);
    });

    it("should localize all the availabilities", () => {
        const expectedString = `Schicksalsmagie 1, Todesmagie 2`;
        expect(parser.toDisplayRepresentation(`${magicSkills[0]} 1, ${magicSkills[1]}:2`)).to.equal(expectedString);
    });

    it("should handle null input", () => {
        expect(parser.toDisplayRepresentation(null)).to.equal(null);
    });

    it("should handle typing errors", () => {
        expect(parser.toDisplayRepresentation("FateMagic 2, deaThmagic:1"))
            .to.equal("Schicksalsmagie 2, Todesmagie 1");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        expect(parser.toDisplayRepresentation("Cederion2, deaThmagic:1, GRW 234"))
            .to.equal("Cederion2, Todesmagie 1, GRW 234");
    });
});

describe("spell availabilty internal transformation", () => {
    'use strict';
    const parser = newSpellAvailabilityParser(spellI18n, magicSkills);
    it("should return the input if no transformation is set", () => {
        const input = "Maggie";
        expect(parser.toInternalRepresentation(input)).to.equal(input);
    });

    it("should translate localized availabilities", () => {
        const expectedString = `${magicSkills[0]} 1, ${magicSkills[1]} 2`;
        expect(parser.toInternalRepresentation(`Schicksalsmagie 1, Todesmagie:2`)).to.equal(expectedString);
    });

    it("should handle null input", () => {
        expect(parser.toInternalRepresentation(/**@type {string}*/null )).to.equal(null);
    });
    it("should handle empty input", () => {
        expect(parser.toInternalRepresentation("")).to.equal("");
    });

    it("should handle typing errors", () => {
        expect(parser.toInternalRepresentation("schiCksalsMagie 1, deaThmagic:2"))
            .to.equal("fatemagic 1, deaThmagic 2");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        expect(parser.toInternalRepresentation("Cederion2, todesmagie:1, GRW 234"))
            .to.equal("Cederion2, deathmagic 1, GRW 234");
    });

    it("should remove superfluous whitespace",()=>{
        expect(parser.toInternalRepresentation("  Cederion2    ,    todesmagie    1, "))
            .to.equal("Cederion2, deathmagic 1");
    });

});
describe("mastery availability display transformation", () => {
    'use strict';
    const parser = newMasteryAvailabilityParser(masteryI18n, masterySkills);
    it("should return the input if no transformation is set", () => {
        const input = "Maggie";
        expect(parser.toDisplayRepresentation(input)).to.equal(input);
    });

    it("should localize all the availabilities", () => {
        const expectedString = `Stangenwaffen, Klingenwaffen`;
        expect(parser.toDisplayRepresentation(masterySkills.join(", "))).to.equal(expectedString);
    });

    it("should handle null input", () => {
        expect(parser.toDisplayRepresentation(null)).to.equal(null);
    });

    it("should handle typing errors", () => {
        expect(parser.toDisplayRepresentation("sTaFFs, sWOrds"))
            .to.equal("Stangenwaffen, Klingenwaffen");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        expect(parser.toDisplayRepresentation("Cederion2, swoRDs, GRW 234"))
            .to.equal("Cederion2, Klingenwaffen, GRW 234");
    });
});


describe("mastery availabilty internal transformation", () => {
    'use strict';
    const parser = newMasteryAvailabilityParser(masteryI18n, masterySkills);
    it("should return the input if no transformation is set", () => {
        const input = "Maggie";
        expect(parser.toInternalRepresentation(input)).to.equal(input);
    });

    it("should translate localized availabilities", () => {
        const expectedString = "staffs, swords";
        expect(parser.toInternalRepresentation(`Stangenwaffen, Klingenwaffen`)).to.equal(expectedString);
    });

    it("should handle null input", () => {
        expect(parser.toInternalRepresentation(/**@type string*/null)).to.equal(null);
    });

    it("should handle typing errors", () => {
        expect(parser.toInternalRepresentation("stAnGenWAffen, kLInGenWafFen"))
            .to.equal("staffs, swords");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        expect(parser.toInternalRepresentation("Cederion2, sTANGenWAffeN, GRW 234"))
            .to.equal("Cederion2, staffs, GRW 234");
    });

    it("should remove superfluous whitespace",()=>{
        expect(parser.toInternalRepresentation("  Cederion2    ,    stAnGenWAffen   , "))
            .to.equal("Cederion2, staffs");
    });

});
