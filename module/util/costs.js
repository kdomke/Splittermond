import {Cost} from "./costs/Cost.js";
import {parseCostString} from "./costs/costParser.js";

/**
 * @param spellData
 * @param {RawCosts[]} reductions
 * @return {Cost[]}
 */
export function getReductionsBySpell(spellData, reductions) {
    let skillId = spellData.skill.trim().toLowerCase();
    let spellType = spellData.spellType.toLowerCase().split(",").map(st => st.trim());
    return Object.keys(reductions).filter(key => {
        let group = key.split(".");
        return (group[0] === "*" || group[0] === skillId) & (group[1] === undefined || spellType.includes(group[1]));
    }).map(reductionItem => reductions[reductionItem]).map(fromRawCosts);
}

function fromRawCosts(rawCosts) {
    const nonConsumed = rawCosts.channeled + rawCosts.exhausted;
    return new Cost(nonConsumed, rawCosts.consumed, rawCosts.channeled > 0);
}

/**
 * @typedef {{channeled: number, exhausted: number, consumed: number}} RawCosts
 * @param {RawCosts[]} reductions
 * @param {string} costData
 * @return {string}
 */
export function calcSpellCostReduction(reductions, costData) {
    const reducedCosts = applyReduction(costData, reductions);
    const finalCosts = ensureMinimumCosts(reducedCosts, reducedCosts);
    return finalCosts.render();
}

/**
 * @typedef {{channeled: number, exhausted: number, consumed: number}} RawCosts
 * @param {RawCosts[]} reductions
 * @param {string} costData
 * @return {string}
 */
export function calcEnhancementCostReduction(reductions, costData) {
    const finalCosts = applyReduction(costData, reductions);
    return finalCosts.render();
}

/**
 * @param {any} costs
 * @param reductions
 * @return {Cost}
 */
function applyReduction(costs, reductions) {
    const initialCosts = parseCostString(costs);
    if (reductions?.length === 0) {
        return initialCosts;
    } else if (initialCosts.isZero()) {
        console.error("Cost data could not be parsed", costs);
        return initialCosts;
    }
    return reductions.reduce((costs, reduction) => costs.subtract(reduction), initialCosts);
}

function ensureMinimumCosts(cost) {
    return cost.isZero() ? cost.add(new Cost(1, 0, false)) : cost;
}
