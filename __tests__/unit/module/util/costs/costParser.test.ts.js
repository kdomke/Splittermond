import {describe, it} from "mocha";
import {expect} from "chai";
import {parseCostString} from "../../../../../module/util/costs/costParser.js";
import {Cost} from "../../../../../module/util/costs/Cost.js";

describe("Parses costs correctly", () => {
    describe("Unparseable strings", () => {
        ["-", "", undefined, null, "Alle meine Entchen", [], 0].forEach((unparseableString) => {
            it(`the invalid string '${unparseableString}' returns a zero cost object`, () => {
                expect(parseCostString(unparseableString)).to.deep.equal(new Cost(0, 0, false));
            });
        });
    });
    describe("Actual costs", () => {
        const validCosts = {
            K2: new Cost(2, 0, true),
            K2V1: new Cost(1, 1, true),
            K2V2: new Cost(0, 2, true),
            "20V10": new Cost(10, 10, false),
            "5000V100": new Cost(4900, 100, false),
            "K1000V300": new Cost(700, 300, true),
            "1V1": new Cost(0, 1, false),
            "1": new Cost(1, 0, false),
        };
        Object.entries(validCosts).forEach(([costString, costObject]) => {
            it(`Parses ${costString} correctly`, () => {
                expect(parseCostString(costString)).to.deep.equal(costObject);
            });
        });
    });
    describe("Negative costs", () => {
        const validCosts = {
            "-K2": new Cost( -2, 0, true),
            "-K2V1": new Cost( -1, -1, true),
            "-K2V2": new Cost( -0, -2, true),
            "-20V10": new Cost( -10, -10, false),
            "-5000V100": new Cost( -4900, -100, false),
            "-K1000V300": new Cost( -700,  -300, true),
            "-1V1": new Cost( -0, -1, false),
            "-1": new Cost( -1, 0, false),
        };
        Object.entries(validCosts).forEach(([costString, costObject]) => {
            it(`Parses ${costString} correctly`, () => {
                //JS apparently has problems comparing -0 and 0 when inside an object
                const actual = parseCostString(costString);
                expect(actual.channeled, "channeled").to.equal(costObject.channeled);
                expect(actual.exhausted, "exhausted").to.equal(costObject.exhausted);
                expect(actual.consumed, "consumed").to.equal(costObject.consumed);
            });
        });
    });

    describe("Invalid costs", () => {
        ["K2V3", "K2V-1", "K2V", "K1V0", "3V5", "V5"].forEach((invalidCost) => {
            it(`Returns a zero cost object for ${invalidCost}`, () => {
                expect(parseCostString(invalidCost)).to.deep.equal(new Cost(0, 0, false));
            });
        });
    });
});