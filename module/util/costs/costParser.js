import { Cost } from "./Cost.js";

/**
 * @param {string} costString
 * @return {Cost}
 */
export function parseCostString(costString) {
    if (!costString || typeof costString !== "string") {
        return new Cost(0, 0, false);
    }

    const costDataRaw = /^\s*(-)?(k)?(0*[1-9][0-9]*)(?:v(0*[1-9][0-9]*))?\s*$/.exec(costString.toLowerCase());
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