import { foundryApi } from "../../api/foundryApi.ts";

export class DamageRoll {

    /**
     * @param {string} damageString a splittermond damage string like "1W6+2"
     * @param {string|undefined} featureString like "Exact 1" or "Scharf 2"
     */
    static parse(damageString, featureString = "") {
        const features = parseFeatureString(featureString);
        const damage = parseDamageString(damageString);
        return new DamageRoll({ ...damage, features });
    }

    /**
     * @param {{nDice:number, nFaces:number, damageModifier:number, features: Record<string, {name:string, value:number, active:boolean}>}}
     */
    constructor({ nDice, nFaces, damageModifier, features }) {
        this._nDice = nDice;
        this._nFaces = nFaces;
        this._damageModifier = damageModifier;
        this._features = features
    }

    /** @param {number} amount*/
    increaseDamage(amount) {
        this._damageModifier += amount;
    }

    /** @param {number} amount*/
    decreaseDamage(amount) {
        this._damageModifier -= amount;
    }

    /**
     * @return {Promise<Roll>}
     */
    async evaluate() {
        const rollFormula = `${this._nDice}d${this._nFaces}`;
        const rollFormulaWithPrecision = this.#modifyFormulaForExactFeature(rollFormula);
        const damageFormula = `${rollFormulaWithPrecision}${this.#getSign()}${Math.abs(this._damageModifier)}`;

        let rollResult = await foundryApi.roll(damageFormula, {}).evaluate();

        rollResult = this.#modifyResultForScharfFeature(rollResult);
        rollResult = this.#modifyResultForKritischFeature(rollResult);
        return rollResult;
    }

    /**@param {string} rollFormula*/
    #modifyFormulaForExactFeature(rollFormula) {
        if (this._features["exakt"]) {
            this._features["exakt"].active = true;
            let temp = this._nDice + this._features["exakt"].value
            return `${temp}d${this._nFaces}kh${this._nDice}`;
        }
        return rollFormula;
    }

    /**
     * @param {Roll} roll
     * @return {Roll}
     */
    #modifyResultForScharfFeature(roll) {
        if (this._features["scharf"]) {
            let scharfBonus = 0;
            roll.terms[0].results.forEach(r => {
                if (r.active) {
                    if (r.result < this._features["scharf"].value) {
                        this._features["scharf"].active = true;
                        scharfBonus += this._features["scharf"].value - r.result;
                    }
                }
            });
            roll._total += scharfBonus;
        }
        return roll;
    }

    /**
     * @param {Roll} roll
     * @return {Roll}
     */
    #modifyResultForKritischFeature(roll) {
        if (this._features["kritisch"]) {
            let kritischBonus = 0;
            roll.terms[0].results.forEach(r => {
                if (r.active) {
                    if (r.result === roll.terms[0].faces) {
                        this._features["kritisch"].active = true;
                        kritischBonus += this._features["kritisch"].value;
                    }
                }
            });
            roll._total += kritischBonus;
        }
        return roll;
    }

    getDamageFormula() {
        let damageFormula = `${this._nDice}W${this._nFaces}`;
        const sign = this.#getSign();
        if (this._damageModifier) {
            damageFormula += `${sign}${Math.abs(this._damageModifier)}`
        }
        return damageFormula;
    }

    /** @return {string} */
    #getSign() {
        return this._damageModifier >= 0 ? "+" : "-";
    }

    /** @return {string} */
    getFeatureString() {
        return Object.keys(this._features).map(key => `${this._features[key].name} ${this._features[key].value}`).join(", ");
    }

    /**
     * @return {{features: Record<string, {name: string, value: number, active:boolean}>, nFaces: number, nDice: number, damageModifier: number}}
     */
    toObject() {
        return {
            nDice: this._nDice,
            nFaces: this._nFaces,
            damageModifier: this._damageModifier,
            features: this._features
        }
    }
}

/**
 * @param {string} featureString
 * @return {Record<string,{name:string, value:number, active:boolean}>}
 */
function parseFeatureString(featureString) {
    /** @type {Record<string,{name:string, value:number, active:boolean}>} */
    const features = {};
    featureString.split(',').forEach(feat => {
        let temp = /([^0-9 ]+)\s*([0-9]*)/.exec(feat.trim());
        if (temp && temp[1]) {
            features[temp[1].toLowerCase()] = {
                name: temp[1],
                value: parseInt(temp[2]) || 1,
                active: false
            };
        }
    });
    return features;
}

/**
 * @param {string} damageString
 * @return {{nDice:number, nFaces:number,modifiers:number}}
 */
function parseDamageString(damageString) {
    const sanitizedFormula = sanitizeDamageString(damageString)
    const terms = getStringSegments(sanitizedFormula);
    const firstDieTerm = parseDie(terms.firstDie);
    //dice other than 6 or 10 faced do not occur in damage calculation
    if(![0,6,10].includes(firstDieTerm.nFaces)){
        console.warn(`Discarded damage string ${damageString}, because it uses dice with an invalid number of faces.`)
        return {nDice:0, nFaces:0, damageModifier:0}
    }
    return {...firstDieTerm, damageModifier: parseModifiers(terms.modifiers)}
}

/**
 * @param {string} damageString
 * @return {string}
 */
function sanitizeDamageString(damageString) {
    return damageString.toLowerCase()
        .replace(/\s/g,"")
        .replace(/w/g, "d")
        .replace(/_/g, "");
}

/**
 *
 * @param {string} damageString
 * @returns {{firstDie: string, otherDice: *[], modifiers: *[]}}
 */
function getStringSegments(damageString){
    const pattern = /([+-]?\d*d\d+|[+-]\d+)/g;
    const terms = damageString.match(pattern);
    const segmentedTerms = {firstDie:"0d0", otherDice:[], modifiers:[]}
    if(!Array.isArray(terms)){
        return segmentedTerms
    }
    let firstDieFound =false;
    for(/**@type string*/const term of terms){
        if(term.includes("d") && !firstDieFound){
            firstDieFound = true;
           segmentedTerms.firstDie = term;
        }else if (terms.includes("d")){
            segmentedTerms.otherDice.push(term)
        }else {
            segmentedTerms.modifiers.push(term)
        }
    }
    return segmentedTerms;
}

/**
 * @param {string}dieTerm
 * @return {{ndice:number, nfaces:number}}
 */
function parseDie(dieTerm){
    //throwing more than 999 dice is not supported by Foundry V12.
    const diceTermPattern = /(?<ndice>\d{0,999})d(?<nfaces>\d+)/
    const parsedTerm = diceTermPattern.exec(dieTerm);
    return {
        nDice: parseInt(parsedTerm.groups.ndice ?? '0'),
        nFaces: parseInt(parsedTerm.groups.nfaces)
    }
}


/**
 *
 * @param {string[]}modifierTerms
 * @returns {number}
 */
function parseModifiers(modifierTerms){
    function isANumber(modifier, index){
        if(isNaN(modifier)){
            console.warn(`Discarded flat damage term ${modifierTerms[index]}, because it could not be parsed`)
            return false;
        }else {
            return true;
        }
    }
    return modifierTerms
        .map(term => parseInt(term))
        .filter(isANumber)
        .reduce((a,b)=>a+b,0);
}
