import {SpellMessageDegreeOfSuccessField} from "./SpellMessageDegreeOfSuccessField.js";
import {splittermond} from "../../../config.js";
import {parseSpellEnhancementDegreesOfSuccess} from "../../costs/costParser.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.js";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference.js";

/**
 * @typedef ManagedSpellOptions
 * @type {SpellDegreesOfSuccessOptions | "spellEnhancement"}
 */

/**
 * @extends {SplittermondDataModel<SpellMessageDegreesOfSuccessManager>}
 * @extends {Record<ManagedSpellOptions, SpellMessageDegreeOfSuccessField>}
 */
export class SpellMessageDegreesOfSuccessManager extends SplittermondDataModel{
    /**
     * @param {ItemReference<SplittermondSpellItem>} spellReference
     * @param {OnAncestorReference<CheckReport>} checkReportReference
     */
    static fromRoll(spellReference, checkReportReference) {
        const spell = spellReference.getItem();
        const degreeOfSuccessOptions = {};
        for (const key in splittermond.spellEnhancement) {
            degreeOfSuccessOptions[key] = new SpellMessageDegreeOfSuccessField({
                degreeOfSuccessCosts: splittermond.spellEnhancement[key].degreesOfSuccess,
                checked: false,
                used: false,
                isDegreeOfSuccessOption: spell.degreeOfSuccessOptions[key],
            })
        }
        return new SpellMessageDegreesOfSuccessManager({
            checkReportReference: checkReportReference.toObject(),
            //test init fails because these are not objects
            spellEnhancement: new SpellMessageDegreeOfSuccessField({
                degreeOfSuccessCosts: parseSpellEnhancementDegreesOfSuccess(spell.enhancementCosts),
                checked: false,
                used: false,
                isDegreeOfSuccessOption: true
            }).toObject(),
            ...degreeOfSuccessOptions,
        });
    }

    static defineSchema() {
        return {
            ...createDegreesOfSuccessOptionSchema(),
            spellEnhancement: new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {required: true, blank: false, nullable: false}),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {required: true, blank: false, nullable: false}),
            usedDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
        }
    }

    get totalDegreesOfSuccess(){
        return this.checkReportReference.get().degreeOfSuccess;
    }

    /** @return {number} */
    get openDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.usedDegreesOfSuccess;
    }

    /**
     * @param {ManagedSpellOptions} key
     * @return {boolean}
     */
    isCheckable(key) {
        return this[key].isCheckable();
    }

    /** @param {ManagedSpellOptions} key
     * @return {boolean}
     */
    isChecked(key) {
        return this[key].checked;
    }

    /** @param {ManagedSpellOptions} key
     * @return {boolean}
     */
    isAvailable(key) {
        return this[key].isAvailable();
    }

    /** @param {ManagedSpellOptions} key
     * @return {boolean}
     */
    isUsed(key) {
        return this[key].used;
    }

    /** @param {ManagedSpellOptions} key*/
    use(key) {
        this.updateSource({[key]: {used: true}})
    }

    /** @param {ManagedSpellOptions} key*/
    alterCheckState(key) {
        const isChecked = this[key].checked;
        isChecked ? this.#onUncheck(key) : this.#onCheck(key);
    }

    /** @param {ManagedSpellOptions} key */
    #onCheck(key) {
        this[key].alterCheckState();
        this.updateSource({usedDegreesOfSuccess: this.usedDegreesOfSuccess + this[key].degreeOfSuccessCosts})
    }

    /** @param {ManagedSpellOptions} key */
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