import {parseCostString} from "./costParser.js";
import {Cost} from "./Cost.js";
import {BaseCost} from "./BaseCost.js";

/**
 * @param {SplittermondSpellData} spellData
 * @param {SpellCostReductionManager} spellCostReductionManager
 * @return {string}
 */
export function calculateReducedSpellCosts(spellData, spellCostReductionManager) {
    const reductions = getApplicableReductions(spellData, spellCostReductionManager);
    const parsedCosts = BaseCost.fromCost(parseCostString(spellData.costs));
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
    const parsedCosts = parseCostString(spellData.enhancementCosts);
    return applyReductions(parsedCosts, reductions).render()
}

/**
 * @param {SplittermondSpellData} spellData
 * @param {SpellCostReductionManager}spellCostReductionManager
 * @return {Cost[]}
 */
function getApplicableReductions(spellData, spellCostReductionManager) {
    let skillId = spellData.skill?.trim().toLowerCase() ?? null;
    let spellType = spellData.spellType?.toLowerCase().split(",").map(st => st.trim()) ?? [null];
    return spellType
        .map(type => spellCostReductionManager.getCostModifiers(skillId, type))
        .flatMap(red => red)
}

/**
 * @param {BaseCost} costs
 * @param {Cost[]} reductions
 * @return {Cost}
 */
function applyReductions(costs, reductions) {
    return reductions.reduce((costs, reduction) => costs.subtract(reduction), costs);
}

/**
 * @param {BaseCost} cost
 * @return {BaseCost}
 */
function ensureMinimumCosts(cost) {
    return cost.isZero() ? cost.add(new Cost(1, 0, false)) : cost;
}