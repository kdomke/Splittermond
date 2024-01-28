import {parseCostsString} from '../../../../module/util/costs.js';
import {describe, it} from 'mocha';
import {expect} from 'chai';

describe("Parses costs correctly", () => {
    describe("Unparseable strings", ()=>{
        ["-","", undefined, null, "Alle meine Entchen", [], 0].forEach((unparseableString) => {
            it("and empty string returns a zero cost object", () => {
                expect(parseCostsString(unparseableString)).to.deep.equal({
                    channeled: 0,
                    exhausted: 0,
                    consumed: 0
                });
            });
        });
    });
    describe("Actual costs", () => {
        const validCosts = {
            K2: {channeled: 2, exhausted: 0, consumed: 0},
            K2V1: {channeled: 1, exhausted: 0, consumed: 1},
            K2V2: {channeled: 0, exhausted: 0, consumed: 2},
            "20V10": {channeled: 0, exhausted: 10, consumed: 10},
            "5000V100": {channeled: 0, exhausted: 4900, consumed: 100},
            "K1000V300": {channeled: 700, exhausted: 0, consumed: 300},
            "1V1": {channeled: 0, exhausted: 0, consumed: 1},
            "1": {channeled: 0, exhausted: 1, consumed: 0},
        };
        Object.entries(validCosts).forEach(([costString, costObject]) => {
            it(`Parses ${costString} correctly`, () => {
                expect(parseCostsString(costString)).to.deep.equal(costObject);
            });
        });
    });
    describe("Negative costs", () => {
        const validCosts = {
            "-K2": {channeled: -2, exhausted: 0, consumed: 0},
            "-K2V1": {channeled: -1, exhausted: 0, consumed: -1},
            "-K2V2": {channeled: 0, exhausted: 0, consumed: -2},
            "-20V10": {channeled: 0, exhausted: -10, consumed: -10},
            "-5000V100": {channeled: 0, exhausted: -4900, consumed: -100},
            "-K1000V300": {channeled: -700, exhausted: 0, consumed: -300},
            "-1V1": {channeled: 0, exhausted: 0, consumed: -1},
            "-1": {channeled: 0, exhausted: -1, consumed: 0},
        };
        Object.entries(validCosts).forEach(([costString, costObject]) => {
            it(`Parses ${costString} correctly`, () => {
                //JS apparently has problems comparing -0 and 0 when inside an object
                const actual = parseCostsString(costString);
                expect(actual.channeled, "channeled").to.equal(costObject.channeled);
                expect(actual.exhausted,"exhausted").to.equal(costObject.exhausted);
                expect(actual.consumed, "consumed").to.equal(costObject.consumed);
            });
        });
    });

    describe("Invalid costs", () => {
        ["K2V3", "K2V-1", "K2V", "K1V0", "3V5", "V5"].forEach((invalidCost) => {
            it(`Returns a zero cost object for ${invalidCost}`, () => {
                expect(parseCostsString(invalidCost)).to.deep.equal({channeled: 0, exhausted: 0, consumed: 0});
            });
        });
    });
});