import {parseCostString} from "./costParser.js";
import {Cost} from "./Cost.js";

/**
 * @typedef {{skill:string, type:string, costs:string, enhancementCosts:string}} SpellDataForCostCalculation
 */

/**
 * @param {SpellDataForCostCalculation} spellData
 * @param {SpellCostReductionManager} spellCostReductionManager
 * @return {string}
 */
export function calculateReducedSpellCosts(spellData, spellCostReductionManager) {
    const reductions = getApplicableReductions(spellData, spellCostReductionManager);
    const parsedCosts = parseCostString(spellData.costs);
    const reducedCosts = applyReductions(parsedCosts, reductions);
    return ensureMinimumCosts(reducedCosts).render();
}

/**
 * @param {SpellDataForCostCalculation} spellData
 * @param {SpellCostReductionManager} spellCostReductionManager
 * @return {string}
 */
export function calculateReducedEnhancementCosts(spellData, spellCostReductionManager) {
    const reductions = getApplicableReductions(spellData, spellCostReductionManager);
    const parsedCosts = parseCostString(spellData.enhancementCosts);
    return applyReductions(parsedCosts, reductions).render()
}

/**
 * @param {SpellDataForCostCalculation} spellData
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
 * @param {any} costs
 * @param {Cost[]} reductions
 * @return {Cost}
 */
function applyReductions(costs, reductions) {
    return reductions.reduce((costs, reduction) => costs.subtract(reduction), costs);
}

/**
 * @param {Cost} cost
 * @return {Cost}
 */
function ensureMinimumCosts(cost) {
    return cost.isZero() ? cost.add(new Cost(1, 0, false)) : cost;
}