import {newSpellAvailabilityParser} from "../../../../module/item/availabilityParser.js";
import {expect} from 'chai';

const magicSkills = [
    "fatemagic",
    "deathmagic",
];

const i18n = {
    localize: (str) => (str === `splittermond.skillLabel.${magicSkills[0]}` ? "Schicksalsmagie" : "Todesmagie")
};
describe("spell availabilty display transformation", () => {
    it("should return the input if no transformation is set", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        const input = "Maggie";
        expect(parser.toDisplayRepresentation(input)).to.equal(input);
    });

    it("should localize all the availabilities", () => {
        const expectedString = `Schicksalsmagie 1, Todesmagie 2`;
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toDisplayRepresentation(`${magicSkills[0]} 1, ${magicSkills[1]}:2`)).to.equal(expectedString);
    });

    it("should handle null input", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toDisplayRepresentation(null)).to.equal(null);
    });

    it("should handle typing errors", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toDisplayRepresentation("FateMagic 2, deaThmagic:1"))
            .to.equal("Schicksalsmagie 2, Todesmagie 1");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toDisplayRepresentation("Cederion2, deaThmagic:1, GRW 234"))
            .to.equal("Cederion2, Todesmagie 1, GRW 234");
    });
});

describe("spell availabilty internal transformation", () => {
    it("should return the input if no transformation is set", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        const input = "Maggie";
        expect(parser.toInternalRepresentation(input)).to.equal(input);
    });

    it("should translate localized availabilities", () => {
        const expectedString = `${magicSkills[0]} 1, ${magicSkills[1]} 2`;
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toInternalRepresentation(`Schicksalsmagie 1, Todesmagie:2`)).to.equal(expectedString);
    });

    it("should handle null input", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toInternalRepresentation(null)).to.equal(null);
    });

    it("should handle typing errors", () => {
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toInternalRepresentation("schiCksalsMagie 1, deaThmagic:2"))
            .to.equal("fatemagic 1, deaThmagic 2");
    });

    it("should pass on illegal values inbetween legal values",()=>{
        const parser = newSpellAvailabilityParser(i18n, magicSkills);
        expect(parser.toInternalRepresentation("Cederion2, todesmagie:1, GRW 234"))
            .to.equal("Cederion2, deathmagic 1, GRW 234");
    });
});