import {parseCostString} from "./costParser.js";
import {Cost} from "./Cost.js";
import {PrimaryCost} from "./PrimaryCost.js";

/**
 * @param {SplittermondSpellData} spellData
 * @param {SpellCostReductionManager} spellCostReductionManager
 * @return {string}
 */
export function calculateReducedSpellCosts(spellData, spellCostReductionManager) {
    const reductions = getApplicableReductions(spellData, spellCostReductionManager);
    const parsedCosts = (parseCostString(spellData.costs)).asPrimaryCost();
    const reducedCosts = applyReductions(parsedCosts, reductions);
    return ensureMinimumCosts(reducedCosts).render();
}

/**
 * @param {SplittermondSpellData} spellData
 * @param {SpellCostReductionManager} spellCostReductionManager
 * @return {string}
 */
export function calculateReducedEnhancementCosts(spellData, spellCostReductionManager) {
    const reductions = getApplicableReductions(spellData, spellCostReductionManager);
    const parsedCosts = parseCostString(spellData.enhancementCosts).asPrimaryCost();
    return applyReductions(parsedCosts, reductions).render()
}

/**
 * @param {SplittermondSpellData} spellData
 * @param {SpellCostReductionManager}spellCostReductionManager
 * @return {CostModifier[]}
 */
function getApplicableReductions(spellData, spellCostReductionManager) {
    let skillId = spellData.skill?.trim().toLowerCase() ?? null;
    let spellType = spellData.spellType?.toLowerCase().split(",").map(st => st.trim()) ?? [null];
    return spellType
        .map(type => spellCostReductionManager.getCostModifiers(skillId, type))
        .flatMap(red => red)
}

/**
 * @param {PrimaryCost} costs
 * @param {CostModifier[]} reductions
 * @return {PrimaryCost}
 */
function applyReductions(costs, reductions) {
    const initial = new Cost(0,0,false).asModifier();
    const consolidatedReductions = reductions.reduce(
        (costs,reduction) => costs.add(reduction), initial);
    return costs.subtract(consolidatedReductions)
}

/**
 * @param {PrimaryCost} cost
 * @return {PrimaryCost}
 */
function ensureMinimumCosts(cost) {
    return cost.isZero() ? cost.add(new Cost(1, 0, false).asModifier()) : cost;
}