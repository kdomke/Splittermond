import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";
import {addToRegistry} from "../chatMessageRegistry.js";
import {spellMessageRenderer} from "./spellRollMessageRenderer.js";
import {SpellDegreesOfSuccessManager} from "./SpellDegreesOfSuccessManager.js";

const constructorRegistryKey = "SplittermondSpellRollMessage";

/**
 * @extends {SplittermondSpellRollDataModel}
 */
export class SplittermondSpellRollMessage extends SplittermondSpellRollDataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {Actor} target
     * @param {CheckReport} checkReport
     * @return {SplittermondSpellRollMessage}
     */
    static createRollMessage(spell, target, checkReport) {

        return new SplittermondSpellRollMessage({
            degreeOfSuccessManager: SpellDegreesOfSuccessManager.fromRoll(spell, checkReport),
            constructorKey: constructorRegistryKey,
        });
    }

    /**
     * @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    degreeOfSuccessOptionIsCheckable(key) {
        return this.degreeOfSuccessManager.isCheckable(key)
    }

    /**
     * @param {SpellDegreesOfSuccessOptions} key
     * @return {boolean}
     */
    degreeOfSuccessOptionIsChecked(key) {
        return this.degreeOfSuccessManager.isChecked(key);
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
        this.degreeOfSuccessManager.alterCheckState(key);
    }

    applyDamage() {
    }

    consumeCost() {
    }

    advanceToken() {
    }

    useSplinterpoint() {
    }

    get template() {
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }

    getData() {
        return spellMessageRenderer.renderData(this);
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
