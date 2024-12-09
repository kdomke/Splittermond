import {foundryApi} from "../../module/api/foundryApi.ts";
import {DamageRoll} from "../../module/util/damage/DamageRoll.js";

export function DamageRollTest(context) {
    const {describe, it, expect} = context;

    describe("test API", () => {
        it("should fail if 1000 dice or more are requested", async () => {
            foundryApi.roll("1000d6").evaluate()
                .then(() => assert.fail("Expected test to throw an error"));
        });
        it("should return a roll object", async () => {
            const rollResult = await foundryApi.roll("2d6+1").evaluate()

            expect(rollResult).to.have.property("terms");
            expect(rollResult).to.have.property("_total");
            expect(rollResult).to.have.property("total");

            expect(rollResult.terms).to.be.instanceOf(Array);
            expect(rollResult.terms).to.have.length(3);
            expect(rollResult.terms[0]).to.have.property("results");
            expect(rollResult.terms[0].results).to.be.instanceOf(Array);
            expect(rollResult.terms[0].faces).to.equal(6);

            expect(rollResult.terms[0]).to.be.instanceOf(Die);
            expect(rollResult.terms[0].results).to.have.length(2);
            expect(rollResult.terms[0].results[0]).to.have.property("active");
            expect(rollResult.terms[0].results[0]).to.have.property("result");
            expect(rollResult.terms[0].results[0].result).to.be.below(7).and.above(0);
            expect(rollResult.terms[0].results[0].active).to.be.true;

            expect(rollResult.terms[1]).to.be.instanceOf(OperatorTerm);
            expect(rollResult.terms[1].operator).to.equal("+");

            expect(rollResult.terms[2]).to.be.instanceOf(NumericTerm);
            expect(rollResult.terms[2].number).to.equal(1);

        });

        it("should evaluate a roll synchronously",async () => {
            const rollResult = await foundryApi.roll("2d6+1").evaluate({async: false})

            expect(rollResult).to.be.instanceOf(Roll);
        });

        it("should not fail for a zero dice formula",async () => {
            const rollResult = await foundryApi.roll("0d0").evaluate({async: false})

            expect(rollResult.total).to.equal(0);
        });
    });

    describe("Damage Roll evaluation", () => {
        it("Exact should modify roll in a way that the highest dice is kept", async () => {
            const roll = await DamageRoll.parse("2d6", "Exakt 1").evaluate();

            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect(roll.terms[0].results).to.have.length(3);

            const sortedResults = roll.terms[0].results.sort((a, b) => a.result - b.result);
            expect(sortedResults[0].active).to.be.false;
        });

        it("Scharf should modify roll in a way that the lowest dice are increased", async () => {
            const roll = await DamageRoll.parse("1d6", "Scharf 6").evaluate();

            expect(roll.total).to.equal(6);
            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect(roll.terms[0].results).to.have.length(1);
            expect(roll.terms[0].results[0].result).not.to.equal(roll.total);
        });

        it("Kritisch should modify roll in a way that the highest dice are increased", async () => {
            const roll = await DamageRoll.parse("999d6", "Kritisch 1").evaluate();

            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect(roll.total).not.to.equal(roll.terms.reduce((former,latter)=> former += latter.result,0))
        });

    });
}