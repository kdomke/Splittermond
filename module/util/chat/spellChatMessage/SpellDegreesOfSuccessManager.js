import {SpellMessageDegreeOfSuccessField} from "./SpellMessageDegreeOfSuccessField.js";
import {splittermond} from "../../../config.js";

const fields = foundry.data.fields

/**
 * @extends {foundry.abstract.DataModel<SpellDegreesOfSuccessManager>}
 * @extends {Record<SpellDegreesOfSuccessOptions, SpellMessageDegreeOfSuccessField>}
 */
export class SpellDegreesOfSuccessManager extends foundry.abstract.DataModel {
    /**
     * @param {SplittermondSpellData} spell
     * @param {CheckReport} checkReport
     */
    static fromRoll(spell, checkReport) {
        const degreeOfSuccessOptions = {};
        for (const key in splittermond.spellEnhancement) {
            degreeOfSuccessOptions[key] = {
                degreeOfSuccessCosts: splittermond.spellEnhancement[key].degreesOfSuccess,
                checked: false,
                used: false,
                isDegreeOfSuccessOption: spell.degreeOnfSuccessOptions[key],
            }
        }
        return new SpellDegreesOfSuccessManager({
            initialDegreesOfSuccess: checkReport.degreeOfSuccess,
            totalDegreesOfSuccess: checkReport.degreeOfSuccess,
            ...degreeOfSuccessOptions,
        });
    }

    static defineSchema() {
        return {
            ...createDegreesOfSuccessOptionSchema(),
            initialDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false}),
            totalDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false}),
            usedDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
        }
    }

    get openDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.usedDegreesOfSuccess;
    }

    /**
     * @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    isCheckable(key) {
        return this[key].isCheckable();
    }

    /** @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    isChecked(key){
        return this[key].checked;
    }

    /** @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    isAvailable(key) {
        return this[key].isAvailable();
    }

    /** @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    isUsed(key) {
        return this[key].used;
    }

    /** @param {SpellDegreesOfSuccessOptions} key*/
    alterCheckState(key) {
        const isChecked = this[key].checked;
        isChecked ? this.#onUncheck(key) : this.#onCheck(key);
    }

    /** @param {SpellDegreesOfSuccessOptions} key */
    #onCheck(key) {
        this[key].alterCheckState();
        this.updateSource({usedDegreesOfSuccess: this.usedDegreesOfSuccess + this[key].degreeOfSuccessCosts})
    }

    /** @param {SpellDegreesOfSuccessOptions} key */
    #onUncheck(key) {
        this[key].alterCheckState();
        this.updateSource({usedDegreesOfSuccess: this.usedDegreesOfSuccess - this[key].degreeOfSuccessCosts})
    }
}

function createDegreesOfSuccessOptionSchema() {
    const schema = {}
    for (const key in splittermond.spellEnhancement) {
        schema[key] = new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {
            required: true,
            blank: false,
            nullable: false
        })
    }
    return schema;
}