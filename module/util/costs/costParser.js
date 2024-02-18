import { Cost } from "./Cost.js";

/**
 * @param {string} cost
 * @return {Cost}
 */
export function parseCostString(cost) {
    const costString = formatCostInput(cost);
    if (!costString || typeof costString !== "string") {
        return new Cost(0, 0, false);
    }

    const costDataRaw = /^\s*([+-])?(k)?(0*[1-9][0-9]*)(?:v(0*[1-9][0-9]*))?\s*$/.exec(costString.toLowerCase());
    if (!costDataRaw) {
        return new Cost(0,0, false);
    }
    const rawConsumed = parseInt(costDataRaw[4] || 0);
    const rawNonConsumed = parseInt(costDataRaw[3] || 0);
    if (rawConsumed > rawNonConsumed) {
        return new Cost(0,0, false);
    }
    const isNegative = costDataRaw && costDataRaw[1] === "-";
    const isChanneled = costDataRaw[2] === "k";
    const costs = new Cost(rawNonConsumed - rawConsumed, rawConsumed, isChanneled);
    return isNegative ? costs.negate() : costs;
}

/** @return {string} */
function formatCostInput(str) {
    if (!str || typeof str !== "string") {
        return "";
    }
    let strParts = str?.split("/");
    if (strParts.length > 1) {
        return strParts[1] ; //parsing Enhanced cost string
    } else {
        return strParts[0];
    }
}

/**
 * @param {string} costString
 * @return {number} the degrees of success
 */
export function parseSpellEnhancementDegreesOfSuccess(costString){
    const enhancementCostString = /([1-9][0-9]*)*\s*[Ee][Gg]/.exec(costString);
    if (enhancementCostString) {
        return parseInt(enhancementCostString[1]);
    } else {
        return 0;
    }
}