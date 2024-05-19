import {SplittermondSpellRollDataModel} from "../../../data/SplittermondSpellRollDataModel.js";
import {addToRegistry} from "../chatMessageRegistry.js";
import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "./SpellMessageActionsManager.js";
import {splittermond} from "../../../config.js";
import {evaluateCheck} from "../../dice.js";
import {ItemReference} from "../../../data/references/ItemReference.js";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference.js";
import {SplittermondSpellRollMessageRenderer} from "./SpellRollMessageRenderer.js";
import {parseCostString} from "../../costs/costParser.js";

const constructorRegistryKey = "SplittermondSpellRollMessage";

/**
 * @extends {SplittermondSpellRollDataModel}
 */
export class SplittermondSpellRollMessage extends SplittermondSpellRollDataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {CheckReport} checkReport
     * @return {SplittermondSpellRollMessage}
     */
    static createRollMessage(spell, checkReport) {
        const reportReference = OnAncestorReference
            .for(SplittermondSpellRollMessage).identifiedBy("constructorKey", constructorRegistryKey)
            .references("checkReport");
        const spellReference = ItemReference.initialize(spell);
        return new SplittermondSpellRollMessage({
            checkReport: checkReport,
            spellReference: spellReference.toObject(),
            degreeOfSuccessManager: SpellMessageDegreesOfSuccessManager.fromRoll(spellReference, reportReference).toObject(),
            renderer: new SplittermondSpellRollMessageRenderer({
                messageTitle: spell.name,
                spellDescription: spell.description,
                spellReference: spellReference,
                checkReportReference: reportReference
            }).toObject(),
            actionManager: SpellMessageActionsManager.initialize(spellReference, reportReference).toObject(),
            constructorKey: constructorRegistryKey,
        });
    }

    /** @param {{multiplicity:number}}data*/
    castDurationUpdate(data) {
        const multiplicity = data.multiplicity;
        if (this.degreeOfSuccessManager.isChecked("castDuration", multiplicity)) {
            this.actionManager.ticks.add(multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction)
        } else {
            this.actionManager.ticks.subtract(multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction)
        }
        this.#alterCheckState("castDuration", multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    exhaustedFocusUpdate(data) {
        const multiplicity = data.multiplicity;
        const focusCosts = this.#toCostModifier(splittermond.spellEnhancement.exhaustedFocus.focusCostReduction, multiplicity);
        if (this.degreeOfSuccessManager.isChecked("exhaustedFocus", multiplicity)) {
            this.actionManager.focus.addCost(focusCosts)
        } else {
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("exhaustedFocus",multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    channelizedFocusUpdate(data) {
        const multiplicity = data.multiplicity;
        const focusCosts = this.#toCostModifier(splittermond.spellEnhancement.channelizedFocus.focusCostReduction, multiplicity);
        if (this.degreeOfSuccessManager.isChecked("channelizedFocus", data.multiplicity)) {
            this.actionManager.focus.addCost(focusCosts)
        } else {
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("channelizedFocus", multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    consumedFocusUpdate(data) {
        const multiplicity = data.multiplicity;
        const focusCosts = parseCostString(splittermond.spellEnhancement.consumedFocus.focusCostReduction)
            .asModifier()
            .multiply(multiplicity);
        if (this.degreeOfSuccessManager.isChecked("consumedFocus", multiplicity)) {
            this.actionManager.focus.addCost(focusCosts)
        } else {
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("consumedFocus", multiplicity)
    }

    /** @param {{multiplicity:number}}data*/
    damageUpdate(data) {
        const multiplicity = data.multiplicity;
        if (this.degreeOfSuccessManager.isChecked("damage", multiplicity)) {
            this.actionManager.damage.subtractDamage(multiplicity * splittermond.spellEnhancement.damage.damageIncrease)
        } else {
            this.actionManager.damage.addDamage(multiplicity * splittermond.spellEnhancement.damage.damageIncrease)
        }
        this.#alterCheckState("damage", multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    rangeUpdate(data) {
        this.#alterCheckState("range", data.multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    effectAreaUpdate(data) {
        this.#alterCheckState("effectArea", data.multiplicity);
    }

    /** @param {{multiplicity:number}}data*/
    effectDurationUpdate(data) {
        this.#alterCheckState("effectDuration", data.multiplicity);
    }

    /** @param {object}data*/
    spellEnhancementUpdate(data) {
        const focusCosts = this.#toCostModifier(this.spellReference.getItem().enhancementCosts, 1);
        if (this.degreeOfSuccessManager.isChecked("spellEnhancement", "")) {
            this.actionManager.focus.subtractCost(focusCosts);
        } else {
            this.actionManager.focus.addCost(focusCosts);
        }
        this.#alterCheckState("spellEnhancement","");
    }



    /**
     * @param {ManagedSpellOptions} key
     * @param {number} multiplicity
     */
    #alterCheckState(key, multiplicity) {
        this.degreeOfSuccessManager.alterCheckState(key, multiplicity);
    }

    /**
     *
     * @param {string} cost
     * @param {number} multiplicity
     * @return {CostModifier}
     */
    #toCostModifier(cost, multiplicity){
        return parseCostString(cost, true).asModifier().multiply(multiplicity);
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

    async useSplinterpoint() {
        const splinterPointBonus = this.actionManager.useSplinterPoint();
        const checkReport = this.checkReport;
        checkReport.roll.total += splinterPointBonus;
        const updatedReport = await evaluateCheck(checkReport.roll, checkReport.skill.points, checkReport.difficulty, checkReport.rollType);
        const newCheckReport = /**@type CheckReport */{...checkReport, ...updatedReport};
        this.updateSource({checkReport: newCheckReport});
    }

    rollMagicFumble() {
        this.actionManager.rollMagicFumble();
    }

    activeDefense() {
        this.actionManager.defend();
    }


    get template() {
        return this.renderer.template;
    }

    getData() {
        return this.renderer.renderData();
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
