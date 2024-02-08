import {calcEnhancementCostReduction, calcSpellCostReduction} from '../../../../module/util/costs.js';
import {parseCostString} from "../../../../module/util/costs/costParser.js";
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {Cost} from "../../../../module/util/costs/Cost.js";

describe("Spell cost reduction", () => {
    const originalAndReducedCosts = [
        ["K2", "2V1", "K1"],
        ["K2V1", "2V1", "K1"],
        ["K2V2", "2V1", "K1V1"],
        ["K4V1", "2V2", "K2"],
        ["8V2", "2V2", "6"],
        ["8V2", "K2", "6V2"],
        ["2", "K2", "1"],
        ["K2", "2", "K1"],
        ["2", "K2V2", "1"],
    ];
    originalAndReducedCosts.forEach(([originalCosts, reductionCosts, expectedCosts]) => {
        it(`should apply reduction ${reductionCosts} correctly to ${originalCosts}`, ()=>{
            const reduction = parseCostString(reductionCosts);
            const actualCosts = calcSpellCostReduction([reduction], originalCosts);
          expect(actualCosts).to.equal(expectedCosts);
        });
    });

    it ( "enhancement costs can be reduced to zero", () =>{
        const reduction = [new Cost(0,2, false)];
        const orginalCosts = "K2V2";
        const reducedCosts = calcEnhancementCostReduction(reduction, orginalCosts);
        expect(reducedCosts).to.deep.equal("0");
    });

    it ("can handle the actual enhancement string", () => {
        const reductions = [new Cost(0, 2, false)];
        const reducedCosts = calcEnhancementCostReduction(reductions, "1 EG/+K12V3");
        expect(reducedCosts).to.deep.equal("K10V1");
    });

    it ("exhausted reductions affect channeled costs", () => {
        const reductions = [new Cost(2,  1, false)];
        const orginalCosts = "K4V2";
        const reducedCosts = calcSpellCostReduction(reductions, orginalCosts);
        expect(reducedCosts).to.deep.equal("K1V1");
    });

    it("channeled reductions affect exhausted costs", () => {
        const reductions = [new Cost( 2,  1, true)];
        const orginalCosts = "4V2";
        const reducedCosts = calcSpellCostReduction(reductions, orginalCosts);
        expect(reducedCosts).to.deep.equal("1V1");
    });

    it("spell costs are reduced if there is a reduction", () => {
        const reductions = [new Cost (2,  1,true)];
        const orginalCosts = "4V2";
        const reducedCosts = calcSpellCostReduction(reductions, orginalCosts);
        expect(reducedCosts).to.deep.equal("1V1");
    });
});