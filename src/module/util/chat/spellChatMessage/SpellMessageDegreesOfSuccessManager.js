import {SpellMessageDegreeOfSuccessField} from "./SpellMessageDegreeOfSuccessField.js";
import {splittermond} from "../../../config.js";
import {parseSpellEnhancementDegreesOfSuccess} from "../../costs/costParser.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.ts";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference";

/**
 * @typedef {1|2|4|8} Multiplicity
 */
/**
 * Defines the multiplicities of degrees of success. It allows for using the same degree of success option up to 16 times.
 * Example to simulate 6 application of a degree of success, one selects the 2 and 4 multiplicities.
 * @type {Multiplicity[]}
 */
const multiplicities = [1, 2, 4, 8] ;

/**
 * @typedef ManagedSpellOptions
 * @type {SpellDegreesOfSuccessOptions | "spellEnhancement"}
 */


/**
 * @typedef MultipliedOptions
 * @type {`${SpellDegreesOfSuccessOptions}${Multiplicity}`}
 */

/**
 * @extends {SplittermondDataModel<SpellMessageDegreesOfSuccessManager>}
 * @extends {Record<MultipliedOptions, SpellMessageDegreeOfSuccessField>}
 * @extends {{spellEnhancement: SpellMessageDegreeOfSuccessField}}
 */
export class SpellMessageDegreesOfSuccessManager extends SplittermondDataModel {
    /**
     * @param {ItemReference<SplittermondSpellItem>} spellReference
     * @param {OnAncestorReference<CheckReport>} checkReportReference
     */
    static fromRoll(spellReference, checkReportReference) {
        const spell = spellReference.getItem();
        const degreeOfSuccessOptions = {};
        for (const key in splittermond.spellEnhancement) {
            for (const multiplicity of multiplicities) {
                degreeOfSuccessOptions[key + multiplicity] = new SpellMessageDegreeOfSuccessField({
                    degreeOfSuccessCosts: multiplicity * splittermond.spellEnhancement[key].degreesOfSuccess,
                    checked: false,
                    used: false,
                    multiplicity: multiplicity,
                    isDegreeOfSuccessOption: spell.degreeOfSuccessOptions[key],
                })
            }
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
            spellEnhancement: new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {
                required: true,
                blank: false,
                nullable: false
            }),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {
                required: true,
                blank: false,
                nullable: false
            }),
            usedDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
        }
    }

    get totalDegreesOfSuccess() {
        return this.checkReportReference.get().degreeOfSuccess;
    }

    /** @return {number} */
    get openDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.usedDegreesOfSuccess;
    }

    /**
     * @param {ManagedSpellOptions} key
     * @return {SpellMessageDegreeOfSuccessField[]}
     */
    getMultiplicities(key) {
        return multiplicities.map(multiplicity => this[key + multiplicity])
            .filter(option => !!option)
    }

    /**
     * @param {ManagedSpellOptions} key
     * @param {number} multiplicity
     * @return {boolean}
     */
    isCheckable(key, multiplicity) {
        return this[key + multiplicity].isCheckable();
    }

    /**
     * @param {ManagedSpellOptions} key
     * @param {number} multiplicity
     * @return {boolean}
     */
    isChecked(key, multiplicity) {
        return this[key + multiplicity].checked;
    }

    /**
     * @param {ManagedSpellOptions} key
     * @param {number} multiplicity
     * @return {boolean}
     */
    isAvailable(key, multiplicity) {
        return this[key + multiplicity].isAvailable();
    }

    /**
     * @deprecated only used in test?
     * @param {ManagedSpellOptions} key
     * @return {boolean}
     */
    isUsed(key ) {
        return this.getMultiplicities(key).some(option => option.used) || this[key]?.used;
    }

    /**
     * @param {ManagedSpellOptions} key
     */
    use(key ) {
        this.getMultiplicities(key).forEach(option => option.use());
        this[key]?.use();
    }

    /**
     * @param {ManagedSpellOptions} key
     * @param {number} multiplicity
     */
    alterCheckState(key, multiplicity) {
        const isChecked = this[key + multiplicity].checked;
        isChecked ? this.#onUncheck(key + multiplicity) : this.#onCheck(key + multiplicity);
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
        for (const multiplicity of multiplicities)
            schema[key + multiplicity] = new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {
                required: true,
                blank: false,
                nullable: false
            })
    }
    return schema;
}