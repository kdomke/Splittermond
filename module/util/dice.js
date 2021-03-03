export function check(skillValue, skillPoints, difficulty = 15, rollType = "standard", modifier = 0) {

    let rollFormula = `${CONFIG.splittermond.rollType[rollType].rollFormula} + @skillValue`;
    if (modifier) {
        rollFormula += " + @modifier";
    }
    let rollData = {
        skillValue: skillValue,
        modifier: modifier
    };

    const roll = new Roll(rollFormula, rollData).roll();

    const difference = roll.total - difficulty;
    const succeeded = difference >= 0;
    let degreeOfSuccess = Math.sign(difference) * Math.floor(Math.abs(difference / 3));
    degreeOfSuccess = ((skillPoints < 1) ? Math.min(degreeOfSuccess, 0) : degreeOfSuccess);
    const isFumble = rollType != "safety" && roll.dice[0].total <= 3;
    const isCrit = roll.dice[0].total >= 19;
    degreeOfSuccess = degreeOfSuccess - (isFumble ? 3 : 0);
    degreeOfSuccess = degreeOfSuccess + ((isCrit & succeeded) ? 3 : 0);

    const degreeOfSuccessMessage = game.i18n.localize(`splittermond.${succeeded ? "success" : "fail"}Message.${Math.min(Math.abs(degreeOfSuccess), 5)}`);
    return {
        difficulty: difficulty,
        succeeded: succeeded,
        isFumble: isFumble,
        isCrit: isCrit,
        degreeOfSuccess: degreeOfSuccess,
        degreeOfSuccessMessage: degreeOfSuccessMessage,
        roll: roll,
    };
}

export function damage(damageFormula, featureString) {
    let feature = {};
    featureString.toLowerCase().split(',').forEach(feat => {
        let temp = /([^0-9 ]*)[ ]*([0-9]*)/.exec(feat.trim());
        if (temp[1]) {
            feature[temp[1]] = parseInt(temp[2] || 1);
        }
    });
    // sanatize String
    damageFormula = damageFormula.toLowerCase().replace("w", "d").replace(" ", "");
    let damageFormulaData = /([0-9]{0,1})d(6|10)[+]*([0-9]*)/.exec(damageFormula);
    let nDices = parseInt(damageFormulaData[1] || 1);
    let nFaces = parseInt(damageFormulaData[2]);
    let damageModifier = parseInt(damageFormulaData[3] || 0);



    damageFormula = `${nDices}d${nFaces}`;
    if (feature["exakt"]) {
        let temp = nDices + feature["exakt"]
        damageFormula = `${temp}d${nFaces}kh${nDices}`;
    }

    if (damageModifier) {
        damageFormula += `+${damageModifier}`;
    }

    let chatData = {
        title: game.i18n.localize("splittermond.damage"),
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
    };

    const roll = new Roll(damageFormula, {}).roll();
    if (feature["scharf"]) {
        let scharfBonus = 0;
        roll.terms[0].results.forEach(r => {
            if (r.active) {
                if (r.result < feature["scharf"]) {
                    scharfBonus += feature["scharf"] - r.result;
                }
            }
        });
        roll._total += scharfBonus;
    }


    roll.toMessage(chatData)

}

export function riskModifier() {
    if (this.results.length == 4) {
        const sortedResult = this.results.sort((a, b) => {
            return a.result - b.result;
        });

        if (sortedResult[0].result < 2 && sortedResult[1].result < 3) {
            sortedResult[0].active = true;
            sortedResult[0].discarded = false;
            sortedResult[1].active = true;
            sortedResult[1].discarded = false;
            sortedResult[2].active = false;
            sortedResult[2].discarded = true;
            sortedResult[3].active = false;
            sortedResult[3].discarded = true;
        } else {
            sortedResult[0].active = false;
            sortedResult[0].discarded = true;
            sortedResult[1].active = false;
            sortedResult[1].discarded = true;
            sortedResult[2].active = true;
            sortedResult[2].discarded = false;
            sortedResult[3].active = true;
            sortedResult[3].discarded = false;
        }
    }
}

