export function check(skillValue, skillPoints, difficulty = 15, rollType = "standard", modifier = 0) {

    let rollFormula = `${CONFIG.splittermond.rollType[rollType].rollFormula} + @skillValue`;

    if (modifier) {
        rollFormula += " + @modifier";
    }
    let rollData = {
        skillValue: skillValue,
        modifier: modifier
    };
    difficulty = parseInt(difficulty);
    if (isNaN(difficulty)) {
        difficulty = 0;
    }

    const roll = new Roll(rollFormula, rollData).roll();

    const difference = roll.total - difficulty;

    let degreeOfSuccess = Math.sign(difference) * Math.floor(Math.abs(difference / 3));
    degreeOfSuccess = ((skillPoints < 1) ? Math.min(degreeOfSuccess, 0) : degreeOfSuccess);
    const isFumble = rollType != "safety" && roll.dice[0].total <= 3;
    const isCrit = roll.dice[0].total >= 19;
    const succeeded = difference >= 0 && !isFumble;
    degreeOfSuccess = isFumble ? Math.min(degreeOfSuccess - 3, -1) : degreeOfSuccess;
    degreeOfSuccess = degreeOfSuccess + ((isCrit & succeeded) ? 3 : 0);

    let degreeOfSuccessMessage = game.i18n.localize(`splittermond.${succeeded ? "success" : "fail"}Message.${Math.min(Math.abs(degreeOfSuccess), 5)}`);
    if (isCrit) {
        degreeOfSuccessMessage = game.i18n.localize(`splittermond.critical`);
    }
    if (isFumble) {
        degreeOfSuccessMessage = game.i18n.localize(`splittermond.fumble`);
    }
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

export async function damage(damageFormula, featureString) {
    let feature = {};
    featureString.split(',').forEach(feat => {
        let temp = /([^0-9 ]*)[ ]*([0-9]*)/.exec(feat.trim());
        if (temp[1]) {
            feature[temp[1].toLowerCase()] = {
                name: temp[0],
                value: parseÍnt(temp[2]) || 1
            };
        }
    });
    // sanatize String
    damageFormula = damageFormula.toLowerCase().replace("w", "d").replace(" ", "");
    let damageFormulaData = /([0-9]{0,1})d(6|10)([+\-0-9]*)/.exec(damageFormula);
    let nDices = parseInt(damageFormulaData[1] || 1);
    let nFaces = parseInt(damageFormulaData[2]);
    let damageModifier = damageFormulaData[3];



    damageFormula = `${nDices}d${nFaces}`;
    if (feature["exakt"]) {
        feature["exakt"].active = true;
        let temp = nDices + feature["exakt"].value
        damageFormula = `${temp}d${nFaces}kh${nDices}`;
    }

    if (damageModifier) {
        damageFormula += damageModifier;
    }

    const roll = new Roll(damageFormula, {}).roll();
    if (feature["scharf"]) {
        let scharfBonus = 0;
        roll.terms[0].results.forEach(r => {
            if (r.active) {
                if (r.result < feature["scharf"].value) {
                    feature["scharf"].active = true;
                    scharfBonus += feature["scharf"].value - r.result;
                }
            }
        });
        roll._total += scharfBonus;
    }

    if (feature["kritisch"]) {
        let kritischBonus = 0;
        roll.terms[0].results.forEach(r => {
            if (r.active) {
                if (r.result === roll.terms[0].faces) {
                    feature["kritisch"].active = true;
                    kritischBonus += feature["kritisch"].value;
                }
            }
        });
        roll._total += kritischBonus;
    }

    let templateContext = {
        roll: roll,
        features: feature,
        formula: damageFormula,
        tooltip: await roll.getTooltip()
    };

    let chatData = {
        user: game.user._id,
        roll: roll,
        content: await renderTemplate("systems/splittermond/templates/chat/damage-roll.hbs", templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };

    ChatMessage.create(chatData);


    //roll.toMessage(chatData)

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

