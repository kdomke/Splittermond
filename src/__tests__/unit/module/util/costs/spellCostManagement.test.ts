import {describe, it} from "mocha";
import {expect} from "chai";
import {initializeSpellCostManagement} from "../../../../../module/util/costs/spellCostManagement.js";
import {Cost} from "../../../../../module/util/costs/Cost.js";

describe("Spell cost Management initialization", () => {
    const management = initializeSpellCostManagement({});
    it("should have a spell cost reduction manager", () => {
        expect(management.spellCostReduction).to.not.be.undefined;
    });
    it("should have a spell enhanced cost reduction manager", () => {
        expect(management.spellEnhancedCostReduction).to.not.be.undefined;
    });
});
describe("Spell cost Management addition of reductions", () => {
    const management = initializeSpellCostManagement({});
    ([
        ["spellCostManger", management.spellCostReduction],
        ["enhancementCostManger", management.spellEnhancedCostReduction]
    ]as const).forEach(([title, reductionManager]) => {
        it(`should be able to add a global cost modifier for ${title}`, () => {
            reductionManager.addCostModifier("foreduction", "K2V1", null);
            const reductions = reductionManager.getCostModifiers("deathmagic", "conjuration");
            expect(reductions).to.deep.contain(new Cost(1, 1, true).asModifier());
        });

        it(`should be able to add a skill specific cost modifier for ${title}`, () => {
            reductionManager.addCostModifier("foreduction.deathmagic", "4V2", "deathmagic");
            const reductions = reductionManager.getCostModifiers("deathmagic", "conjuration");
            expect(reductions).to.deep.contain(new Cost(2, 2, false).asModifier());
        });

        it(`should be able to add a skill & type specific cost modifier for ${title}`, () => {
            reductionManager.addCostModifier("foreduction.deathmagic.conjuration", "6V3", "deathmagic");
            const reductions = reductionManager.getCostModifiers("deathmagic", "conjuration");
            expect(reductions).to.deep.contain(new Cost(3, 3, false).asModifier());
        });

        it(`should be use the skill as group if no group is given for ${title}`, () => {
            reductionManager.addCostModifier("foreduction", "8V4", "deathmagic");
            const reductions = reductionManager.getCostModifiers("deathmagic", "conjuration");
            expect(reductions).to.deep.contain(new Cost(4, 4, false).asModifier());
        });
    });
});

describe("Spell cost Management selection of reductions", () => {
    const deathmagicConjurationReduction = new Cost(1, 1, true).asModifier();
    const deathmagicSicknessReduction = new Cost(2, 2, false).asModifier();
    const lightmagicConjurationReduction = new Cost(3, 3, true).asModifier();
    const deathmagicReduction = new Cost(4, 4, false).asModifier();
    const lightmagicReduction = new Cost(5, 5, true).asModifier();
    const conjurationReduction = new Cost(6, 6, false).asModifier();
    const sicknessReduction = new Cost(7, 7, true).asModifier();
    const globalReduction = new Cost(8, 8, false).asModifier();
    const management = initializeSpellCostManagement({});
    [management.spellCostReduction, management.spellEnhancedCostReduction].forEach(
        reductionManager => {
            reductionManager.modifiers.put(deathmagicConjurationReduction, "deathmagic", "conjuration");
            reductionManager.modifiers.put(deathmagicSicknessReduction, "deathmagic", "sickness");
            reductionManager.modifiers.put(lightmagicConjurationReduction, "lightmagic", "conjuration");
            reductionManager.modifiers.put(sicknessReduction, null, "sickness");
            reductionManager.modifiers.put(conjurationReduction, null, "conjuration");
            reductionManager.modifiers.put(deathmagicReduction, "deathmagic", null);
            reductionManager.modifiers.put(lightmagicReduction, "lightmagic", null);
            reductionManager.modifiers.put(globalReduction, null, null);
        });

    ([management.spellCostReduction, management.spellEnhancedCostReduction]as const).forEach(
        reductionManager => {
            it("should return only the global reduction if no skill or type is given", () => {
                const reductions = reductionManager.getCostModifiers("", "")
                expect(reductions).to.have.length(1);
                expect(reductions).to.contain(globalReduction);
            });

            it("should return skill specific and global reductions if only a skill is given", () => {
                const reductions = reductionManager.getCostModifiers("deathmagic", "");
                expect(reductions).to.have.length(2);
                expect(reductions).to.contain.all.members([deathmagicReduction, globalReduction]);
            });

            it("should return type specific and global reductions if only a type is given", () => {
                const reductions = reductionManager.getCostModifiers("", "conjuration");
                expect(reductions).to.have.length(2);
                expect(reductions).to.contain.all.members([conjurationReduction, globalReduction]);
            });

            it("should return skill and type specific and global reductions if both are given", () => {
                const reductions = reductionManager.getCostModifiers("deathmagic", "conjuration");
                expect(reductions).to.have.length(4);
                expect(reductions).to.contain.all.members([deathmagicConjurationReduction, conjurationReduction, deathmagicReduction, globalReduction]);
            });

            it("should return the global reduction if wrong skill and no type is given", () => {
                const reductions = reductionManager.getCostModifiers("illusionmagic", "");
                expect(reductions).to.have.length(1);
                expect(reductions).to.contain(globalReduction);
            });

            it("should return the global reduction if wrong type and no skill is given", () => {
                const reductions = reductionManager.getCostModifiers("", "spirit");
                expect(reductions).to.have.length(1);
                expect(reductions).to.contain(globalReduction);
            });

            it("should return skill specific reduction if wrong type is given", () => {
                const reductions = reductionManager.getCostModifiers("deathmagic", "spirit");
                expect(reductions).to.have.length(2);
                expect(reductions).to.contain.all.members([deathmagicReduction,globalReduction]);

            });

            it("should return type specific reduction if wrong skill is given", () => {
                const reductions = reductionManager.getCostModifiers("illusionmagic", "conjuration");
                expect(reductions).to.have.length(2);
                expect(reductions).to.contain.all.members([conjurationReduction,globalReduction]);
            });
        });

});