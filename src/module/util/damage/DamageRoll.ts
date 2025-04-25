import {foundryApi} from "../../api/foundryApi";
import {Die, FoundryRoll} from "../../api/Roll";
import {DamageFeature} from "./DamageFeature";
import {
    ItemFeatureDataModel,
    ItemFeaturesModel,
    parseFeatures
} from "../../item/dataModel/propertyModels/ItemFeaturesModel";
import {ItemFeature} from "../../config/itemFeatures";

interface DamageRollObjectType {
    nDice: number;
    nFaces: number;
    damageModifier: number;
    features: Record<string, DamageFeature>;
}
type DamageRollConstructorInput = Omit<DamageRollObjectType, "features"> & {features: ItemFeaturesModel};

export class DamageRoll {

    /**
     * @param  damageString a splittermond damage string like "1W6+2"
     * @param  featureString like "Exakt 1" or "Scharf 2"
     */
    static parse(damageString: string, featureString: string = "") {
        const features = parseFeatures(featureString).map(f => new ItemFeatureDataModel(f));
        return this.from(damageString, ItemFeaturesModel.from(features));
    }

    static from(damageString: string, itemFeatures: ItemFeaturesModel) {
        const damage = parseDamageString(damageString);
        return new DamageRoll({...damage, features: itemFeatures})
    }

    private _nDice: number;
    private _nFaces: number;
    private _damageModifier: number;
    private _features: ItemFeaturesModel;
    private activeFeatures: Set<ItemFeature>

    constructor({nDice, nFaces, damageModifier, features}:DamageRollConstructorInput) {
        this._nDice = nDice;
        this._nFaces = nFaces;
        this._damageModifier = damageModifier;
        this._features = features
        this.activeFeatures = new Set();
    }

    increaseDamage(amount: number) {
        this._damageModifier += amount * this.damageModifierFactor;
    }

    decreaseDamage(amount: number) {
        this._damageModifier -= amount * this.damageModifierFactor;
    }

    private get damageModifierFactor(): number {
        return this._features.hasFeature("Wuchtig") ? 2 : 1;
    }

    async evaluate(): Promise<FoundryRoll> {
        const rollFormula = `${this._nDice}d${this._nFaces}`;
        const rollFormulaWithPrecision = this.modifyFormulaForExactFeature(rollFormula);
        const modifierTerm = this._damageModifier ? `${this.getSign()}${Math.abs(this._damageModifier)}` : "";
        const damageFormula = `${rollFormulaWithPrecision}${modifierTerm}`;

        let rollResult = await foundryApi.roll(damageFormula, {}).evaluate();

        rollResult = this.modifyResultForScharfFeature(rollResult);
        rollResult = this.modifyResultForKritischFeature(rollResult);
        return rollResult;
    }

    private modifyFormulaForExactFeature(rollFormula: string) {
        const exactValue = this._features.valueOf("Exakt");
        if (exactValue) {
            this.activeFeatures.add("Exakt");
            let temp = this._nDice + exactValue
            return `${temp}d${this._nFaces}kh${this._nDice}`;
        }
        return rollFormula;
    }

    private modifyResultForScharfFeature(roll: FoundryRoll): FoundryRoll {
        const scharfValue = this._features.valueOf("Scharf");
        if (scharfValue) {
            let scharfBonus = 0;
            this.getFirstDieTerm(roll).results.forEach(r => {
                if (r.active) {
                    if (r.result < scharfValue) {
                        this.activeFeatures.add("Scharf");
                        scharfBonus += scharfValue - r.result;
                    }
                }
            });
            roll._total += scharfBonus;
        }
        return roll;
    }

    private modifyResultForKritischFeature(roll: FoundryRoll): FoundryRoll {
        const kritischValue = this._features.valueOf("Kritisch");
        if (kritischValue) {
            let kritischBonus = 0;
            const firstDie = this.getFirstDieTerm(roll);
            firstDie.results.forEach(r => {
                if (r.active) {
                    if (r.result === firstDie.faces) {
                        this.activeFeatures.add("Kritisch");
                        kritischBonus += kritischValue;
                    }
                }
            });
            roll._total += kritischBonus;
        }
        return roll;
    }

    private getFirstDieTerm(roll: FoundryRoll): Die {
        for (const term of roll.terms) {
            if ("results" in term && "faces" in term) {
                return term;
            }
        }
        throw new Error("Somehow the first term in the roll was an operator.")
    }

    getDamageFormula() {
        let damageFormula = `${this._nDice}W${this._nFaces}`;
        const sign = this.getSign();
        if (this._damageModifier) {
            damageFormula += `${sign}${Math.abs(this._damageModifier)}`
        }
        return damageFormula;
    }

    private getSign(): string {
        return this._damageModifier >= 0 ? "+" : "-";
    }

    getFeatureString(): string {
        return this._features.features
    }

    getActiveFeatures(): Record<string, DamageFeature> {
        if (this._features.hasFeature("Wuchtig") && this._damageModifier != 0) {
            this.activeFeatures.add("Wuchtig");
        }
        return this.toRecords(this._features.featureList.filter(f => this.activeFeatures.has(f.name)));
    };

    private toRecords(features: ItemFeatureDataModel[]): Record<string,DamageFeature> {
        const starter = {} as Record<string, DamageFeature>;
        return features.map(f => this.toRecord(f))
            .reduce((acc, f) => {acc[f.name.toLowerCase()] = f; return acc}, starter);
    }
    private toRecord(feature: ItemFeatureDataModel): DamageFeature {
        return {
            name: feature.name,
            value: feature.value,
            active: this.activeFeatures.has(feature.name)
        }
    }
}

function parseDamageString(damageString: string): { nDice: number, nFaces: number, damageModifier: number } {
    const sanitizedFormula = sanitizeDamageString(damageString)
    const terms = getStringSegments(sanitizedFormula);
    const firstDieTerm = parseDie(terms.firstDie);
    //dice other than 6 or 10 faced do not occur in damage calculation
    if (![0, 6, 10].includes(firstDieTerm.nFaces)) {
        console.warn(`Discarded damage string ${damageString}, because it uses dice with an invalid number of faces.`)
        return {nDice: 0, nFaces: 0, damageModifier: 0}
    }
    return {...firstDieTerm, damageModifier: parseModifiers(terms.modifiers)}
}

function sanitizeDamageString(damageString: string): string {
    return damageString.toLowerCase()
        .replace(/\s/g, "")
        .replace(/w/g, "d")
        .replace(/_/g, "");
}

function getStringSegments(damageString: string) {
    const pattern = /([+-]?\d*d\d+|[+-]\d+)/g;
    const terms = damageString.match(pattern);
    const segmentedTerms = {firstDie: "0d0", otherDice: [] as string[], modifiers: [] as string[]}
    if (!Array.isArray(terms)) {
        return segmentedTerms
    }
    let firstDieFound = false;
    for (const term of terms) {
        if (term.includes("d") && !firstDieFound) {
            firstDieFound = true;
            segmentedTerms.firstDie = term;
        } else if (terms.includes("d")) {
            segmentedTerms.otherDice.push(term)
        } else {
            segmentedTerms.modifiers.push(term)
        }
    }
    return segmentedTerms;
}

function parseDie(dieTerm: string) {
    //throwing more than 999 dice is not supported by Foundry V12.
    const diceTermPattern = /(?<ndice>\d{0,999})d(?<nfaces>\d+)/
    const parsedTerm = diceTermPattern.exec(dieTerm);
    return {
        nDice: parseInt(parsedTerm?.groups?.ndice ?? '0'),
        nFaces: parseInt(parsedTerm?.groups?.nfaces ?? '0')
    }
}


function parseModifiers(modifierTerms: string[]): number {
    function isANumber(modifier: number, index: number) {
        if (isNaN(modifier)) {
            console.warn(`Discarded flat damage term ${modifierTerms[index]}, because it could not be parsed`)
            return false;
        } else {
            return true;
        }
    }

    return modifierTerms
        .map(term => parseInt(term))
        .filter(isANumber)
        .reduce((a, b) => a + b, 0);
}
