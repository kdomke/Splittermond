export function calcSpellCostReduction(reductions, costData) {
    if (reductions?.length == 0) return costData;

    var costs = parseCostsString(costData);
    reductions.forEach(reduction => {
        if (reduction.channeled > 0 && costs.channeled > 0) {
            costs.channeled = Math.max(1, costs.channeled - reduction.channeled);
        }

        if (reduction.consumed > 0 && costs.consumed > 0) {
            costs.consumed = Math.max(1, costs.consumed - reduction.consumed);
        }

        if (reduction.exhausted > 0 && costs.exhausted > 0) {
            costs.exhausted = Math.max(1, costs.exhausted - reduction.exhausted);
        }
    });

    return formatCosts(costs);
}

export function getReductionsBySpell(spellData, reductions) {
    let skillId = spellData.skill.trim().toLowerCase();
    let spellType = spellData.spellType.toLowerCase().split(",").map(st => st.trim());
    return Object.keys(reductions).filter(key => {
        let group = key.split(".");
        return (group[0] == "*" || group[0] == skillId) & (group[1] == undefined || spellType.includes(group[1]));
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

export function parseCostsString(str) {
    let strParts = str.split("/");
    if (strParts.length > 1) {
        str = strParts[1];
    } else {
        str = strParts[0];
    }
    let costDataRaw = /([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(str.toLowerCase());
    if (costDataRaw) {
        return {
            channeled: costDataRaw[1] === "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
            exhausted: costDataRaw[1] !== "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
            consumed: parseInt(costDataRaw[3] || 0)
        }
    } else {
        return {
            channeled: 0,
            exhausted: 0,
            consumed: 0
        }
    }

}