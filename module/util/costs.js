const zeroCosts = {channeled: 0, exhausted: 0, consumed: 0};

export function calcSpellCostReduction(reductions, costData, enhancementCosts = false) {
    if (reductions?.length == 0) return costData;

    let maxValue = enhancementCosts ? 0 : 1;

    var costs = parseCostsString(costData);
    var oldCosts = JSON.parse(JSON.stringify(costs));
    reductions.forEach(reduction => {
        if (reduction.channeled > 0 && costs.channeled > 0) {
            costs.channeled = Math.max(maxValue, costs.channeled - reduction.channeled);
        }

        if (reduction.consumed > 0 && costs.consumed > 0) {
            costs.consumed = Math.max(0, costs.consumed - reduction.consumed);
        }

        if (reduction.exhausted > 0 && costs.exhausted > 0) {
            costs.exhausted = Math.max(maxValue, costs.exhausted - reduction.exhausted);
        }
    });


    return formatCosts(costs);
}

export function getReductionsBySpell(spellData, reductions) {
    let skillId = spellData.skill.trim().toLowerCase();
    let spellType = spellData.spellType.toLowerCase().split(",").map(st => st.trim());
    return Object.keys(reductions).filter(key => {
        let group = key.split(".");
        return (group[0] === "*" || group[0] === skillId) & (group[1] === undefined || spellType.includes(group[1]));
    }).map(reductionItem => reductions[reductionItem]);
}

export function formatCosts(spellCostData) {
    var display = "";
    if (spellCostData.channeled > 0) {
        display = "K";
    }
    display += spellCostData.channeled + spellCostData.consumed + spellCostData.exhausted;
    if (spellCostData.consumed > 0) {
        display += "V" + spellCostData.consumed;
    }
    return display;
}

/**
 * @param {any} str
 * @typedef {{consumed: number, channeled: number, exhausted: number}} SpellCosts
 * @return SpellCosts
 */
export function parseCostsString(str) {
    if (!str || typeof str !== "string") {
        return {channeled: 0, exhausted: 0, consumed: 0};
    }
    let strParts = str?.split("/");
    if (strParts.length > 1) {
        return actuallyParseCosts(strParts[1]);
    } else {
        return actuallyParseCosts(strParts[0]);
    }
}

/**
 * @param {string} str
 * @return SpellCosts
 */
function actuallyParseCosts(str) {
    const costDataRaw = /^\s*(-)?(k)?(0*[1-9][0-9]*)(?:v(0*[1-9][0-9]*))?\s*$/.exec(str.toLowerCase());
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