import a from "../../foundryMocks.js";
import {expect} from 'chai';
import SplittermondSpellItem from "../../../../module/item/spell.js";
import {newSpellAvailabilityParser} from "../../../../module/item/availability/availabilityParser.js";

describe("Availability display", () => {
    const sampleSpell = new SplittermondSpellItem({}, {splittermond: {ready: true}}, newSpellAvailabilityParser({localize: (str) => str.split(".").pop()}, ["illusionmagic", "deathmagic"]));
    sampleSpell.system = {skill: "illusionmagic", skillLevel: 1, availableIn: ""};

    it("Sources spell school and level from data when availaility is not set", () => {
        const actual = sampleSpell.availableInList;

        expect(actual).to.deep.contain({label: "illusionmagic 1"});
    });

    it("Transforms single skill availability", () => {
        sampleSpell.system.availableIn = "illusionmagic 1";
        const actual = sampleSpell.availableInList;
        expect(actual.length).to.eq(1);
        expect(actual[0]).to.deep.equal({label: "illusionmagic 1"});
    });

    it("Transforms single skill availability formatted with colon", () => {
        sampleSpell.system.availableIn = "illusionmagic:1";
        const actual = sampleSpell.availableInList;
        expect(actual.length).to.eq(1);
        expect(actual[0]).to.deep.equal({label: "illusionmagic 1"});
    });
    it("Transforms several skill availabilities", () => {
        sampleSpell.system.availableIn = "illusionmagic 1, deathmagic 2";
        const actual = sampleSpell.availableInList;
        expect(actual[0]).to.deep.equal({label: "illusionmagic 1"});
        expect(actual[1]).to.deep.equal({label: "deathmagic 2"});
    });

    it("Filters out invalid availability from list", () => {
        sampleSpell.system.availableIn = "illusionmagic 1, deathmagic2";
        const actual = sampleSpell.availableInList;
        expect(actual).to.deep.contain({label: "illusionmagic 1"});
        expect(actual.length).to.equal(1);
    });

    it("Handles incorrectly formatted list", () => {
        sampleSpell.system.availableIn = "illusionmagic:1 deathmagic:2";
        const actual = sampleSpell.availableInList;
        expect(actual[0]).to.deep.contain({label: "illusionmagic 1"});
    });

    it("Uses default for null availability", () => {
        testWithInvalidAvailibility(null);
    });

    it("Uses default for single word availability", () => {
        testWithInvalidAvailibility("not a valid spell availability");
    });

    it("Uses default for wrong type availability", () => {
        testWithInvalidAvailibility(123);
    });


    function testWithInvalidAvailibility(availabilityValue) {
        sampleSpell.system.availableIn = availabilityValue;

        const actual = sampleSpell.availableInList;

        expect(actual.length).to.eq(1);
        expect(typeof actual[0]).to.equal("object");

    }
})
;