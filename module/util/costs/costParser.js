import { Costs } from "./Cost.js";

/**
 * @param {string} costString
 * @return {Costs}
 */
export function parseCostString(costString) {
    const costDataRaw = /^\s*(-)?(k)?(0*[1-9][0-9]*)(?:v(0*[1-9][0-9]*))?\s*$/.exec(str.toLowerCase());
    if (!costDataRaw) {
        return new Costs(0,0, false);
    }
    const rawConsumed = parseInt(costDataRaw[4] || 0);
    const rawNonConsumed = parseInt(costDataRaw[3] || 0);
    if (rawConsumed > rawNonConsumed) {
        return new Costs(0,0, false);
    }
    const isNegative = costDataRaw && costDataRaw[1] === "-";
    const isChanneled = costDataRaw[2] === "k";
    const costs = new Costs(rawNonConsumed - rawConsumed, rawConsumed, isChanneled);
    return isNegative ? costs.negate() : costs;
}