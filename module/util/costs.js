import {Cost} from "./costs/Cost.js";
import {parseCostString as newCostParser} from "./costs/costParser.js";

/**
 * @typedef {{channeled: number, exhausted: number, consumed: number}} SpellCosts
 */

/**
 *  @param {Cost[]} reductions
 * @param {string} costData
 * @param {boolean} enhancementCosts
 * @return {string}
 */
export function calcSpellCostReduction(reductions, costData, enhancementCosts = false) {

    if (reductions?.length === 0) {
        return costData;
    }

    const initialCosts = newCostParser(costData);
    const reducedCosts = reductions.reduce((costs, reduction) => costs.subtract(reduction), initialCosts);
    const finalCosts = ensureMinimiumCosts(reducedCosts, enhancementCosts);
    return finalCosts.render();
}

function ensureMinimiumCosts(cost, isEnhancementCost) {
    return cost.isZero() && !isEnhancementCost ? cost.add(new Cost(1, 0, false)) : cost;
}

/**
 *
 * @param spellData
 * @param {SpellCosts[]} reductions
 * @return {Cost[]}
 */
export function getReductionsBySpell(spellData, reductions) {
    let skillId = spellData.skill.trim().toLowerCase();
    let spellType = spellData.spellType.toLowerCase().split(",").map(st => st.trim());
    return Object.keys(reductions).filter(key => {
        let group = key.split(".");
        return (group[0] === "*" || group[0] === skillId) & (group[1] === undefined || spellType.includes(group[1]));
    }).map(reductionItem => reductions[reductionItem])
        .map(red => new Cost(red.channeled + red.exhausted, red.consumed, red.channeled > 0));
}

/**
 * @param {any} str
 * @return {SpellCosts}
 */
export function parseCostsString(str) {
    if (!str || typeof str !== "string") {
        return zeroCosts;
    }
    let strParts = str?.split("/");
    if (strParts.length > 1) {
        return actuallyParseCosts(strParts[1]); //parsing Enhanced cost string
    } else {
        return actuallyParseCosts(strParts[0]);
    }
}

/**
 * @param {string} str
 * @return {SpellCosts}
 */
function actuallyParseCosts(str) {
    const costDataRaw = /^\s*([+-])?(k)?(0*[1-9][0-9]*)(?:v(0*[1-9][0-9]*))?\s*$/.exec(str.toLowerCase());
    if (!costDataRaw) {
        return zeroCosts;
    }
    const rawConsumed = parseInt(costDataRaw[4] || 0);
    const rawNonConsumed = parseInt(costDataRaw[3] || 0);
    if (rawConsumed > rawNonConsumed) {
        return zeroCosts;
    }
    const sign = costDataRaw && costDataRaw[1] === "-" ? -1 : 1;
    const isChanneled = costDataRaw[2] === "k";
    return {
        channeled: sign * (isChanneled ? rawNonConsumed - rawConsumed : 0),
        exhausted: sign * (!isChanneled ? rawNonConsumed - rawConsumed : 0),
        consumed: sign * rawConsumed
    };
}