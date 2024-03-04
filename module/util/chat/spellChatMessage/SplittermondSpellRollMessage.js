import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";
import {addToRegistry} from "../chatMessageRegistry.js";
import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "./SpellMessageActionsManager.js";
import {splittermond} from "../../../config.js";
import {evaluateCheck} from "../../dice.js";

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
            spellEnhancementCosts: spell.enhancementCosts,
            degreeOfSuccessManager: SpellMessageDegreesOfSuccessManager.fromRoll(spell, checkReport),
            renderer: {
                messageTitle: spell.name,
                spellDescription: spell.description,
                spellEnhancementDescription: spell.enhancementDescription,
                checkReport: checkReport
            },
            actionManager: SpellMessageActionsManager.initialize(spell, checkReport),
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
        this.actionManager.applyDamage();
        this.degreeOfSuccessManager.use("damage")
    }

    consumeCosts() {
        this.actionManager.consumeFocus()
        this.degreeOfSuccessManager.use("exhaustedFocus")
        this.degreeOfSuccessManager.use("consumedFocus")
        this.degreeOfSuccessManager.use("channelizedFocus")
        this.degreeOfSuccessManager.use("spellEnhancement")
    }

    advanceToken() {
        this.actionManager.advanceToken();
        this.degreeOfSuccessManager.use("castDuration")
    }

    useSplinterpoint() {
        const splinterPointBonus = this.actionManager.useSplinterPoint();
        const checkReport = this.renderer.checkReport;
        checkReport.roll.total += splinterPointBonus;
        const updatedReport = evaluateCheck(checkReport.roll, checkReport.skill.points, checkReport.difficulty, checkReport.rollType);
        const newCheckReport = /**@type CheckReport */{...checkReport, ...updatedReport};
        this.degreeOfSuccessManager.updateSource({totalDegreesOfSuccess: newCheckReport.degreeOfSuccess});
        this.renderer.updateSource({checkReport: newCheckReport});
    }

    rollFumble() {
       this.actionManager.rollFumble();
    }

    get template() {
        return this.renderer.template;
    }

    getData() {
        return this.renderer.renderData();
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
