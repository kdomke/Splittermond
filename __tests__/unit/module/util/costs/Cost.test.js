import {describe, it} from "mocha";
import {expect} from "chai";
import {Cost} from "../../../../../module/util/costs/Cost.js";

describe("Cost object edge cases", () => {
    it("isZero should return true for a zero cost object", () => {
        expect(new Cost(0, 0, false).isZero()).to.be.true; //jshint ignore:line
    });

    it("isZero should return false for a non-zero cost object", () => {
        expect(new Cost(1, 0, false).isZero()).to.be.false; //jshint ignore:line
    });

    it("should return zero costs when adding two zero cost objects", () => {
        const costs = new Cost(0, 0, false);
        const result = costs.add(new Cost(0, 0, false));
        expect(result).to.deep.equal(new Cost(0, 0, false));
    });

    it("should return zero costs when subtracting two zero cost objects", () => {
        const costs = new Cost(0, 0, false);
        const result = costs.subtract(new Cost(0, 0, false));
        expect(result).to.deep.equal(new Cost(0, 0, false));
    });

    it("should allow negative starting input", () => {
        const costs = new Cost(-1, -1, false);
        expect(costs.toString()).to.equal("-2V1");
    });

    it("should not produce negative costs", () => {
        const costs = new Cost(1, 0, false);
        const result = costs.subtract(new Cost(2, 0, false));
        expect(result).to.deep.equal(new Cost(0, 0, false));
    });

    it("should ignore the channeled property for the purpose of addition", () => {
        const costs = new Cost(1, 0, true);
        const result = costs.add(new Cost(2, 0, false));
        expect(result).to.deep.equal(new Cost(3, 0, true));
    });

    it("should ignore garbage input", () => {
        const costs = new Cost("a", true, "kanalisiert");
        expect(costs).to.deep.equal(new Cost(0, 0, true));
    });
});

describe("Cost object operation", () => {
    [
        [new Cost(3, 1, false), new Cost(4, 2, false), new Cost(7, 3, false)],
        [new Cost(0, 5, false), new Cost(4, 0, false), new Cost(4, 5, false)],
        [new Cost(0, 1, true), new Cost(0, 1, false), new Cost(0, 2, true)],
        [new Cost(0, 1, false), new Cost(0, 1, true), new Cost(0, 2, false)],
        [new Cost(3, 1, false), new Cost(0, 0, true), new Cost(3, 1, false)],
        [new Cost(0, 0, false), new Cost(3, 0, true), new Cost(3, 0, false)],
        [new Cost(0, 3, false), new Cost(0, 3, true), new Cost(0, 6, false)],
        [new Cost(100, 3000, false), new Cost(0, 1, true), new Cost(100, 3001, false)],
    ].forEach(
        ([costs1, costs2, expected]) => it(`should add ${costs1} and ${costs2} to ${expected}`, () => {
            const result = costs1.add(costs2);
            expect(result).to.deep.equal(expected);
        }));

    [
        [new Cost(4, 2, false), new Cost(3, 1, false), new Cost(1, 1, false)],
        [new Cost(0, 5, false), new Cost(4, 0, false), new Cost(0, 5, false)],
        [new Cost(0, 1, true), new Cost(0, 1, false), new Cost(0, 0, true)],
        [new Cost(3, 1, false), new Cost(0, 2, true), new Cost(2, 0, false)],
        [new Cost(0, 0, false), new Cost(3, 0, true), new Cost(0, 0, false)],
        [new Cost(5, 3, false), new Cost(0, 3, true), new Cost(5, 0, false)],
    ].forEach(
        ([costs1, costs2, expected]) => it(`substracting ${costs2} from ${costs1} yields ${expected}`, () => {
            const result = costs1.subtract(costs2);
            expect(result).to.deep.equal(expected);
        }));
    [
        [new Cost(4, 2, false), new Cost(-4, -2, false)],
        [new Cost(0, 5, true), new Cost(0, -5, true)],
    ].forEach(([costs, expected]) => it(`should negate ${costs} to ${expected}`, () => {
        const result = costs.negate();
        expect(result).to.deep.equal(expected);
    }));
});

describe("Cost object rendering", () => {
    [
        [new Cost(0, 0, false), "0"],
        [new Cost(0, 0, true), "0"],
        [new Cost(0, 3, false), "3V3"],
        [new Cost(4, 3, true), "K7V3"],
        [new Cost(4, 3, false), "7V3"],
        [new Cost(4, 0, true), "K4"],
        [new Cost(-4, -4, false), "0"],
        [new Cost(-4, 0, true), "0"]
    ].forEach(
        ([costs, expected]) => it(`should render ${costs} as ${expected}`, () => {
            const result = costs.render();
            expect(result).to.equal(expected);
        }));

    [
        [new Cost(0, 0, false), "0"],
        [new Cost(0, 0, true), "0"],
        [new Cost(0, 3, false), "3V3"],
        [new Cost(4, 3, true), "K7V3"],
        [new Cost(4, 3, false), "7V3"],
        [new Cost(4, 0, true), "K4"],
        [new Cost(-3, -4, false), "-7V4"],
        [new Cost(-4, -4, true), "-K8V4"],
        [new Cost(-4, 0, true), "-K4"],
        [new Cost(-4, 0, false), "-4"]
    ].forEach(
        ([costs, expected]) => it(`should stringify ${costs} as ${expected}`, () => {
            const result = costs.toString();
            expect(result).to.equal(expected);
        }));
});

describe("Strict cost objects", () => {
    it("should not subtract channeled costs from exhausted costs", () => {
        const costs = new Cost(2, 1, false, true);
        const result = costs.subtract(new Cost(1, 1, true));
        expect(result).to.deep.equal(costs);
    });

    it("should not add exhausted costs to channeled costs", () => {
        const costs = new Cost(2, 1, false, true);
        const result = costs.add(new Cost(1, 1, false));
        expect(result).to.deep.equal(costs);
    });

    it("should respect strictness of both operands", () => {
        const costs = new Cost(2, 1, false, false);
        const result = costs.add(new Cost(1, 1, false, true));
        expect(result).to.deep.equal(costs);
    });

    it("should add channeled costs to channeled costs", () => {
        const costs = new Cost(2, 1, true, true);
        const result = costs.add(new Cost(1, 1, true, true));
        expect(result).to.deep.equal(new Cost(3, 2, true, true));
    });

    it("should subtract exhausted costs from exhausted costs", () => {
        const costs = new Cost(2, 1, false, true);
        const result = costs.subtract(new Cost(1, 1, false, true));
        expect(result).to.deep.equal(new Cost(1, 0, false, true));
    });
});
