import {foundryApi} from "../../api/foundryApi";
import {Die, FoundryRoll, isNumericTerm, isOperatorTerm, NumericTerm} from "../../api/Roll";
import {DamageFeature} from "./DamageFeature";
import {
    ItemFeatureDataModel,
    ItemFeaturesModel,
    parseFeatures
} from "../../item/dataModel/propertyModels/ItemFeaturesModel";
import {ItemFeature} from "../../config/itemFeatures";
import {condense, mapRoll, toRollFormula} from "../../actor/modifiers/expressions/scalar";

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
        const damage = concatSimpleRoll(foundryApi.roll(damageString.replace(/(?<=\d+)[wW](?=\d+)/g, "d")));
        return new DamageRoll(damage, itemFeatures)
    }

    private backingRoll: FoundryRoll;
    private baseModifier: number;
    private hasFinalNumericTerm: boolean;
    private _damageModifier: number;
    private _features: ItemFeaturesModel;
    private activeFeatures: Set<ItemFeature>

    constructor(roll: FoundryRoll, features: ItemFeaturesModel) {
        this.backingRoll = roll;
        this._damageModifier = 0;
        this.hasFinalNumericTerm = isNumericTerm(this.getLastTerm(roll));
        this.baseModifier = this.hasFinalNumericTerm ? (this.getLastTerm(roll) as NumericTerm).number : 0;
        this._features = features
        this.activeFeatures = new Set();
    }

    private getLastTerm(roll: FoundryRoll) {
        return roll.terms.slice(-1)[0];
    }

    private modifyRollFormula(roll: FoundryRoll) {
        const finalModificationValue = this.baseModifier + this._damageModifier;
        if (this.hasFinalNumericTerm) {
            const lastOperand = roll.terms.slice(-2);
            const lastOperator = lastOperand[0];
            const lastNumericTerm= lastOperand[1];
            if(isOperatorTerm(lastOperator) && isNumericTerm(lastNumericTerm)) {
                lastOperator.operator = finalModificationValue > 0 ? "+" : "-";
                lastNumericTerm.number = Math.abs(finalModificationValue);
                roll.resetFormula();
                return roll;
            }
        }
        return this.appendModifier(roll, finalModificationValue);
    }

    private appendModifier(roll: FoundryRoll, damageModifier:number) {
        if(damageModifier === 0){
            return roll;
        }
        const operator = damageModifier< 0 ? foundryApi.rollInfra.minusTerm() : foundryApi.rollInfra.plusTerm();
        const number = foundryApi.rollInfra.numericTerm(damageModifier);
        roll.terms.push(operator,number);
        roll.resetFormula();
        return roll;
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
        const roll = this.modifyRollFormula(this.backingRoll.clone());
        const withPrecision = this.modifyFormulaForExactFeature(roll);
        let rollResult = await withPrecision.evaluate();

        rollResult = this.modifyResultForScharfFeature(rollResult);
        rollResult = this.modifyResultForKritischFeature(rollResult);
        return rollResult;
    }

    private modifyFormulaForExactFeature(roll: FoundryRoll) {
        const exactValue = this._features.valueOf("Exakt");
        if (exactValue) {
            this.activeFeatures.add("Exakt");
            const dieTerm  =this.getFirstDieTerm(roll);
            dieTerm.number += exactValue;
            dieTerm.modifiers.push(`kh${exactValue}`)
            roll.resetFormula();
        }
        return roll;
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
        const rollCopy = this.modifyRollFormula(this.backingRoll.clone());
        return rollCopy.formula.replace(/(?<=\d+)[d](?=\d+)/g, "W");
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

    private toRecords(features: ItemFeatureDataModel[]): Record<string, DamageFeature> {
        const starter = {} as Record<string, DamageFeature>;
        return features.map(f => this.toRecord(f))
            .reduce((acc, f) => {
                acc[f.name.toLowerCase()] = f;
                return acc
            }, starter);
    }

    private toRecord(feature: ItemFeatureDataModel): DamageFeature {
        return {
            name: feature.name,
            value: feature.value,
            active: this.activeFeatures.has(feature.name)
        }
    }
}

function concatSimpleRoll(roll:FoundryRoll){
    const condensedFormula = toRollFormula(condense(mapRoll(roll)));
    return foundryApi.roll(condensedFormula[0]);
}
