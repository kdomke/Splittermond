import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";
import {addToRegistry} from "../chatMessageRegistry.js";
import {spellMessageRenderer} from "./spellRollMessageRenderer.js";
import {splittermond} from "../../../config.js";

const constructorRegistryKey = "SplittermondSpellRollMessage";

export class SplittermondSpellRollMessage extends SplittermondSpellRollDataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {Actor} target
     * @param {CheckReport} checkReport
     * @return {SplittermondSpellRollMessage}
     */
    static createRollMessage(spell, target, checkReport) {

        return new SplittermondSpellRollMessage({
            totalDegreesOfSuccess: checkReport.degreeOfSuccess,
            openDegreesOfSuccess: checkReport.degreeOfSuccess,
            constructorKey: constructorRegistryKey,
        });
    }

    /** @param {number} amount */
    #useDegreesOfSuccess(amount) {
        this.updateSource({openDegreesOfSuccess: this.openDegreesOfSuccess - amount})
    }

    /** @param {number} amount */
    #freeDegreeOfSuccess(amount) {
        this.updateSource({openDegreesOfSuccess: this.openDegreesOfSuccess + amount})
    }

    /**
     * @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    degreeOfSuccessOptionIsCheckable(key) {
        return !this.degreeOfSuccessOptions[key].disabled && (this.degreeOfSuccessOptions[key].checked
            || splittermond.spellEnhancement[key].degreesOfSuccess <= this.openDegreesOfSuccess);
    }

    /**
     * @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    degreeOfSuccessOptionIsChecked(key) {
        return this.degreeOfSuccessOptions[key].checked;
    }

    castDurationUpdate() {
        this.#alterCheckState("castDuration");
    }

    exhaustedFocusUpdate() {
        this.#alterCheckState("exhaustedFocus");
    }

    channelizedFocusUpdate() {
        this.#alterCheckState("channelizedFocus")
    }

    consumedFocusUpdate() {
        this.#alterCheckState("consumedFocus")
    }

    rangeUpdate() {
        this.#alterCheckState("range");
    }

    damageUpdate() {
        this.#alterCheckState("damage");
    }

    effectAreaUpdate() {
        this.#alterCheckState("effectArea");
    }

    effectDurationUpdate() {
        this.#alterCheckState("effectDuration");
    }

    /** @param {SpellDegreesOfSuccessOptions} key */
    #alterCheckState(key) {
        const isChecked = this.degreeOfSuccessOptions[key].checked;
        isChecked ? this.#onUncheck(key) : this.#onCheck(key);
    }

    /** @param {SpellDegreesOfSuccessOptions} key */
    #onCheck(key) {
        if (this.degreeOfSuccessOptions[key].disabled) {
            console.warn(`Tried to check disabled option ${key}!`)
            return;
        }
        this.#useDegreesOfSuccess(splittermond.spellEnhancement[key].degreesOfSuccess)
        this.updateSource({degreeOfSuccessOptions: {[key]: {checked: true}}})
    }

    /** @param {SpellDegreesOfSuccessOptions} key */
    #onUncheck(key) {
        if (this.degreeOfSuccessOptions[key].disabled) {
            console.warn(`Tried to uncheck disabled option ${key}!`)
            return;
        }
        this.#freeDegreeOfSuccess(splittermond.spellEnhancement[key].degreesOfSuccess)
        this.updateSource({degreeOfSuccessOptions: {[key]: {checked: false}}})
    }

    applyDamage(){}
    consumeCost(){}

    advanceToken(){}

    useSplinterpoint(){}

    get template() {
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }

    getData() {
        return spellMessageRenderer.renderData(this);
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
