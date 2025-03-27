import {
    AddExpression,
    expressions,
    ReferenceExpression,
    RollExpression
} from "../../../../../module/actor/modifiers/expressions/definitions";
import {expect} from "chai";
import {evaluate} from "../../../../../module/actor/modifiers/expressions/evaluation";
import {condense} from "../../../../../module/actor/modifiers/expressions/condenser";
import {asString} from "../../../../../module/actor/modifiers/expressions/Stringifier";
import {createTestRoll} from "../../../RollMock";

const {of, plus, minus, times, dividedBy,abs} = expressions;

describe("Expressions", () => {

    ([
        [abs(of(-3)),3,of(3),"3"],
        [of(3), 3, of(3), "3"],
        [of(-3), -3, of(-3), "-3"],
        [plus(of(3), of(3)), 6, of(6), "3 + 3"],
        [minus(of(3), of(3)), 0, of(0), "3 - 3"],
        [times(of(3), of(3)), 9, of(9), "3 * 3"],
        [dividedBy(of(3), of(3)), 1, of(1), "3 / 3"],
    ] as const).forEach(([input, evaluated, condensed, stringRepresentation]) => {

        it(`simple expression ${stringRepresentation} should evaluate to ${evaluated}`, () => {
            expect(evaluate(input)).to.equal(evaluated);
        });

        it(`simple expression ${stringRepresentation} should condense to ${stringRepresentation}`, () => {
            expect(condense(input)).to.deep.equal(condensed);
        });

        it(`simple expression ${stringRepresentation} should be duly represented`, () => {
            expect(asString(input)).to.equal(stringRepresentation);
        });
    });

    ([
        [times(plus(of(3), of(3)), of(3)), 18, of(18), "(3 + 3) * 3"],
        [times(minus(of(4), of(3)), of(3)), 3, of(3), "(4 - 3) * 3"],
        [times(minus(of(3), of(4)), of(3)), -3, of(-3), "(3 - 4) * 3"],
        [times(abs(minus(of(3), of(4))), of(3)), 3, of(3), "|(3 - 4)| * 3"],
        [dividedBy(
            times(
                of(2),
                plus(of(1), of(2))
            ),
            times(
                of(3),
                minus(of(4), of(3))
            )
        ), 2, of(2), "(2 * (1 + 2)) / (3 * (4 - 3))"],

    ] as const).forEach(([input, evaluated, condensed, stringRepresentation]) => {

        it(`braced expression ${stringRepresentation} should evaluate to ${evaluated}`, () => {
            expect(evaluate(input)).to.equal(evaluated);
        });

        it(`braced expression ${stringRepresentation} should condense to ${stringRepresentation}`, () => {
            expect(condense(input)).to.deep.equal(condensed);
        });

        it(`braced expression ${stringRepresentation} should be duly represented`, () => {
            expect(asString(input)).to.equal(stringRepresentation);
        });
    });

    describe ("Roll Expressions", () => {
        it("should evaluate to the value of the property", () => {
            const property = new RollExpression(createTestRoll("1d6",[3]));
            expect(evaluate(property)).to.equal(3);
        });

        it("should not condense property ", () => {
            const property = plus(of(3),new RollExpression(createTestRoll("1d6",[3])));

            const result = condense(property);

            expect(result).to.be.instanceOf(AddExpression);
        });

        it("should stringify property to formula", () => {
            const property = new RollExpression(createTestRoll("1d6",[3]));
            expect(asString(property)).to.equal("1d6");
        });

    });

    describe("Reference Expressions", () => {
        it("should evaluate to the value of the property", () => {
            const property = new ReferenceExpression("value", {value: 3}, "value");
            expect(evaluate(property)).to.equal(3);
        });

        it("should omit properties of the wrong format when multiplying", () => {
            const property = new ReferenceExpression("value", {value: "splittermond"},"value");
            const expression = times(plus(of(3),property), minus(of(4),of(3)));
            expect(evaluate(expression)).to.deep.equal(3);
        });

        it("should omit properties of the wrong format when adding", () => {
            const property = new ReferenceExpression("value", {value: "splittermond"},"value");
            const expression = times(property, minus(of(4),of(3)));
            expect(evaluate(expression)).to.deep.equal(1);
        });

        it("should evaluate nested properties", () => {
            const property = new ReferenceExpression("first.second.third", {first: {second:{third:3}}},"first.second.third");
            expect(evaluate(property)).to.equal(3);
        });

        it("should not condense property ", () => {
            const property = new ReferenceExpression("value", {value: 3},"value");
            const expression = times(plus(of(3),property), minus(of(4),of(3)));
            expect(condense(expression)).to.deep.equal(times(plus(of(3),property), of(1)));
        });

        it("should stringify property ", () => {
            const property = new ReferenceExpression("value", {value: 3},"value");
            const expression = times(plus(of(3),property), minus(of(4),of(3)));
            expect(asString(expression)).to.equal("(3 + ${value}) * (4 - 3)");
        });
    });
});
