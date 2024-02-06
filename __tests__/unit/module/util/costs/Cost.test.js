import {describe, it} from "mocha";
import {expect} from "chai";
import {Costs} from "../../../../../module/util/costs/Cost.js";

describe("Cost object edge cases", () => {

    it("should return zero costs when adding two zero cost objects", () => {
        const costs = new Costs(0, 0, false);
        const result = costs.add(new Costs(0, 0, false));
        expect(result).to.deep.equal(new Costs(0, 0, false));
    });

    it("should return zero costs when subtracting two zero cost objects", () => {
        const costs = new Costs(0, 0, false);
        const result = costs.subtract(new Costs(0, 0, false));
        expect(result).to.deep.equal(new Costs(0, 0, false));
    });

    it("should allow negative starting input",()=>{
        const costs = new Costs(-1, -1, false);
        expect(costs.toString()).to.equal("-2V1");
    });

    it("should not produce negative costs", () => {
        const costs = new Costs(1, 0, false);
        const result = costs.subtract(new Costs(2, 0, false));
        expect(result).to.deep.equal(new Costs(0, 0, false));
    });

    it("should ignore the channeled property for the purpose of addition", () => {
        const costs = new Costs(1, 0, true);
        const result = costs.add(new Costs(2, 0, false));
        expect(result).to.deep.equal(new Costs(3, 0, true));
    });

    it("should ignore garbage input", () => {
        const costs = new Costs("a", true, "kanalisiert");
        expect(costs).to.deep.equal(new Costs(0, 0, true));
    });
});

describe("Cost object operation", () => {
    [
        [new Costs(3, 1, false), new Costs(4, 2, false), new Costs(7, 3, false)],
        [new Costs(0, 5, false), new Costs(4, 0, false), new Costs(4, 5, false)],
        [new Costs(0, 1, true), new Costs(0, 1, false), new Costs(0, 2, true)],
        [new Costs(0, 1, false), new Costs(0, 1, true), new Costs(0, 2, false)],
        [new Costs(3, 1, false), new Costs(0, 0, true), new Costs(3, 1, false)],
        [new Costs(0, 0, false), new Costs(3, 0, true), new Costs(3, 0, false)],
        [new Costs(0, 3, false), new Costs(0, 3, true), new Costs(0, 6, false)],
        [new Costs(100, 3000, false), new Costs(0, 1, true), new Costs(100, 3001, false)],
    ].forEach(
        ([costs1, costs2, expected]) => it(`should add ${costs1} and ${costs2} to ${expected}`, () => {
            const result = costs1.add(costs2);
            expect(result).to.deep.equal(expected);
        }));

    [
        [new Costs(4, 2, false), new Costs(3, 1, false), new Costs(1, 1, false)],
        [new Costs(0, 5, false), new Costs(4, 0, false), new Costs(0, 5, false)],
        [new Costs(0, 1, true), new Costs(0, 1, false), new Costs(0, 0, true)],
        [new Costs(3, 1, false), new Costs(0, 2, true), new Costs(2, 0, false)],
        [new Costs(0, 0, false), new Costs(3, 0, true), new Costs(0, 0, false)],
        [new Costs(5, 3, false), new Costs(0, 3, true), new Costs(5, 0, false)],
    ].forEach(
        ([costs1, costs2, expected]) => it(`substracting ${costs2} from ${costs1} yields ${expected}`, () => {
            const result = costs1.subtract(costs2);
            expect(result).to.deep.equal(expected);
        }));
    [
        [new Costs(4, 2, false), new Costs(-4, -2, false)],
        [new Costs(0, 5, true), new Costs(0, -5, true)],
    ].forEach(([costs, expected]) => it(`should negate ${costs} to ${expected}`, () => {
        const result = costs.negate();
        expect(result).to.deep.equal(expected);
    }));
});

describe("Cost object rendering", () => {
    [
        [new Costs(0, 0, false), "1"],
        [new Costs(0, 0, true), "K1"],
        [new Costs(0, 3, false), "3V3"],
        [new Costs(4, 3, true), "K7V3"],
        [new Costs(4, 3, false), "7V3"],
        [new Costs(4, 0, true), "K4"],
        [new Costs(-4, -4, false), "1"],
        [new Costs(-4, 0, true), "K1"]
    ].forEach(
        ([costs, expected]) => it(`should render ${costs} as ${expected}`, () => {
            const result = costs.render();
            expect(result).to.equal(expected);
        }));

    [
        [new Costs(0, 0, false), "0"],
        [new Costs(0, 0, true), "0"],
        [new Costs(0, 3, false), "3V3"],
        [new Costs(4, 3, true), "K7V3"],
        [new Costs(4, 3, false), "7V3"],
        [new Costs(4, 0, true), "K4"],
        [new Costs(-3, -4, false), "-7V4"],
        [new Costs(-4, -4, true), "-K8V4"],
            [new Costs(-4, 0, true), "-K4"],
                [new Costs(-4, 0, false), "-4"]
    ].forEach(
        ([costs, expected]) => it(`should stringify ${costs} as ${expected}`, () => {
            const result = costs.toString();
            expect(result).to.equal(expected);
        }));
});
