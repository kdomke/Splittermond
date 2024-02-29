/**
 * @param {unknown} input
 */
export function parseRollDifficulty(input){
    if (!input){
        return new RollDifficulty(15)
    } else if (input instanceof RollDifficulty){
        return input;
    } else {
        return new RollDifficulty(coerceToRollDifficulty(input));
    }

}

/**
 * @param {unknown} difficulty
 * @return {RollType}
 */
function coerceToRollDifficulty(difficulty) {
    if (isRollDifficulty(difficulty)) {
        return parseInt(difficulty);
    }
    return 0;
}

/**
 * @param {unknown} difficulty
 * @return {boolean}
 */
function isRollDifficulty(difficulty){
    return isTargetDependentDifficulty(difficulty) || !isNaN(parseInt(difficulty));
}

function isTargetDependentDifficulty(value){
    return ["VTD", "KW", "GW"].includes(value);
}

class RollDifficulty {
    constructor(difficulty){
       this._difficulty = difficulty;
       this.evaluatedDifficulty = null;
    }

    isTargetDependentValue(){
        return isTargetDependentDifficulty(this._difficulty)
    }

    /**
     * @param {{actor:{derivedValues:{defense: number, bodyresist:number, mindresist:number}}}} target
     */
    evaluate(target) {
        switch (this._difficulty) {
            case "VTD":
                this.evaluatedDifficulty = target.actor.derivedValues.defense.value;
                break;
            case "KW":
                this.evaluatedDifficulty =  target.actor.derivedValues.bodyresist.value;
                break;
            case "GW":
                this.evaluatedDifficulty = target.actor.derivedValues.mindresist.value;
                break;
            default:
                this.evaluatedDifficulty = this.difficulty
        }
    }
    get difficulty(){
        return this.evaluatedDifficulty ?? this._difficulty;
    }
}