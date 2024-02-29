import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";
import {addToRegistry} from "../chatMessageRegistry.js";
import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "./SpellMessageActionsManager.js";
import {splittermond} from "../../../config.js";

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
            messageTitle: spell.name,
            spellEnhancementDescription: spell.enhancementDescription,
            spellEnhancementCosts: spell.enhancementCosts,
            degreeOfSuccessManager: SpellMessageDegreesOfSuccessManager.fromRoll(spell.system, checkReport),
            renderer: {
                checkReport: checkReport
            },
            actionManager: SpellMessageActionsManager.initialize(spell.system),
            constructorKey: constructorRegistryKey,
        });
    }

    castDurationUpdate() {
        if(this.degreeOfSuccessManager.isChecked("castDuration")){
            this.actionManager.ticks.add(splittermond.spellEnhancement.castDuration.castDurationReduction)
        }else {
            this.actionManager.ticks.subtract(splittermond.spellEnhancement.castDuration.castDurationReduction)
        }
        this.#alterCheckState("castDuration");
    }

    exhaustedFocusUpdate() {
        if(this.degreeOfSuccessManager.isChecked("exhaustedFocus")){
            this.actionManager.focus.addCost(splittermond.spellEnhancement.exhaustedFocus.focusCostReduction)
        }else {
            this.actionManager.focus.subtractCost(splittermond.spellEnhancement.exhaustedFocus.focusCostReduction)
        }
        this.#alterCheckState("exhaustedFocus");
    }

    channelizedFocusUpdate() {
        if(this.degreeOfSuccessManager.isChecked("channelizedFocus")){
            this.actionManager.focus.addCost(splittermond.spellEnhancement.channelizedFocus.focusCostReduction)
        }else {
            this.actionManager.focus.subtractCost(splittermond.spellEnhancement.channelizedFocus.focusCostReduction)
        }
        this.#alterCheckState("channelizedFocus")
    }

    consumedFocusUpdate() {
        if(this.degreeOfSuccessManager.isChecked("consumedFocus")){
            this.actionManager.focus.addCost(splittermond.spellEnhancement.consumedFocus.focusCostReduction)
        }else{
            this.actionManager.focus.subtractCost(splittermond.spellEnhancement.consumedFocus.focusCostReduction)
        }
        this.#alterCheckState("consumedFocus")
    }

    rangeUpdate() {
        this.#alterCheckState("range");
    }

    damageUpdate() {
        if(this.degreeOfSuccessManager.isChecked("damage")){
            this.actionManager.damage.subtractCost(splittermond.spellEnhancement.damage.damageIncrease)
        }else {
            this.actionManager.damage.addCost(splittermond.spellEnhancement.damage.damageIncrease)
        }
        this.#alterCheckState("damage");
    }

    effectAreaUpdate() {
        this.#alterCheckState("effectArea");
    }

    effectDurationUpdate() {
        this.#alterCheckState("effectDuration");
    }

    spellEnhancementUpdate() {
        if(this.degreeOfSuccessManager.isChecked("spellEnhancement")){
            this.actionManager.focus.subtractCost(this.spellEnhancementCosts);
        }else {
            this.actionManager.focus.addCost(this.spellEnhancementCosts);
        }
        this.#alterCheckState("spellEnhancement");
    }

    /** @param {ManagedSpellOptions} key */
    #alterCheckState(key) {
        this.degreeOfSuccessManager.alterCheckState(key);
    }


    applyDamage() {
        this.actionManager.damage.used = true;
        this.degreeOfSuccessManager.use("damage")
    }

    consumeCosts() {
        this.actionManager.focus.used = true;
        this.degreeOfSuccessManager.use("exhaustedFocus")
        this.degreeOfSuccessManager.use("consumedFocus")
        this.degreeOfSuccessManager.use("channelizedFocus")
        this.degreeOfSuccessManager.use("spellEnhancement")
    }

    advanceToken() {
        this.actionManager.ticks.used = true;
        this.degreeOfSuccessManager.use("castDuration")
    }

    useSplinterpoint() {
        this.actionManager.splinterPoint.used = true;
        this.degreeOfSuccessManager.totalDegreesOfSuccess += 1;
    }

    get template() {
        return this.renderer.template;
    }

    getData() {
        return this.renderer.renderData(this);
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
