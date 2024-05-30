import Modifiable from "./modifiable.js";
import CheckDialog from "../apps/dialog/check-dialog.js"
import * as Dice from "../util/dice.js"
import * as Chat from "../util/chat.js";
import * as Tooltip from "../util/tooltip.js";


export default class Skill extends Modifiable {
    constructor(actor, skill, attribute1 = "", attribute2 = "", skillValue = null) {
        super(actor, [skill.toLowerCase().trim(), "woundmalus"]);
        this.id = skill.toLowerCase().trim();
        this.label = skill;
        if (this.actor.system.skills[skill]) {
            this.label = game.i18n.localize(`splittermond.skillLabel.${this.id}`);
            attribute1 = attribute1 ? attribute1 : CONFIG.splittermond.skillAttributes[skill][0];
            attribute2 = attribute2 ? attribute2 : CONFIG.splittermond.skillAttributes[skill][1];
            this.attribute1 = this.actor.attributes[attribute1];
            this.attribute2 = this.actor.attributes[attribute2];
        }

        this._skillValue = skillValue;


        this._cache = {
            enabled: false,
            value: null
        }
    }

    toObject() {
        return {
            id: this.id,
            label: this.label,
            value: this.value,
            attribute1: this.attribute1?.toObject(),
            attribute2: this.attribute2?.toObject()
        }
    }

    get points() {
        if (this._skillValue == null) {
            return parseInt(this.actor.system.skills[this.id].points);
        } else {
            return this._skillValue - (this.attribute1?.value || 0) - (this.attribute2?.value || 0);
        }

    }

    get value() {
        if (this._cache.enabled && this._cache.value !== null) return this._cache.value;

        let value = (this.attribute1?.value || 0) + (this.attribute2?.value || 0) + this.points;
        value += this.mod;

        if (this._cache.enabled && this._cache.value === null)
            this._cache.value = value;
        return value;
    }

    get selectableModifier() {
        return this.actor.modifier.selectable(this._modifierPath);
    }

    get isGrandmaster() {
        return this.actor.items.find(i => i.type == "mastery" && (i.system.isGrandmaster || 0) && i.system.skill == this.id);
    }

    enableCaching() {
        this._cache.enabled = true;
    }

    disableCaching() {
        this._cache.enabled = false;
        this._cache.value = null;
    }

    get maneuvers() {
        return this.actor.items.filter(i => i.type == "mastery" && (i.system.isManeuver || false) && i.system.skill == this.id);
    }

    async roll(options = {}) {
        let emphasisData = [];
        let selectableModifier = this.selectableModifier;
        let preSelectedModifier = options.preSelectedModifier || [];
        preSelectedModifier = preSelectedModifier.map(s => s.trim().toLowerCase());
        if (selectableModifier) {
            emphasisData = Object.entries(selectableModifier).map(([key, value]) => {
                return {
                    name: key,
                    label: key + (value > 0 ? " +" : " ") + value,
                    value: value,
                    active: preSelectedModifier.includes(key.trim().toLowerCase())
                }
            });
        }

        let title = options.title || game.i18n.localize(this.label);
        if (options.subtitle)
            title = `${title} - ${options.subtitle}`;

        let skillFormula = this.getFormula();
        skillFormula.addOperator("=")
        skillFormula.addPart(this.value, game.i18n.localize("splittermond.skillValueAbbrev"));

        let checkData = await CheckDialog.create({
            difficulty: options.difficulty || 15,
            modifier: options.modifier || 0,
            emphasis: emphasisData,
            title: title,
            skill: this,
            skillTooltip: skillFormula.render(),
        });

        if (!checkData) return false;

        checkData.modifierElements = [... this.actor.modifier.static(this._modifierPath).map(mod => { return { value: mod.value, description: mod.name } }), ...checkData.modifierElements];

        let target = Array.from(game.user.targets)[0];
        let hideDifficulty = false;
        if (target) {
            switch (checkData.difficulty) {
                case "VTD":
                    checkData.difficulty = target.actor.derivedValues.defense.value;
                    hideDifficulty = true;
                    break;
                case "KW":
                    checkData.difficulty = target.actor.derivedValues.bodyresist.value;
                    hideDifficulty = true;
                    break;
                case "GW":
                    checkData.difficulty = target.actor.derivedValues.mindresist.value;
                    hideDifficulty = true;
                    break;
            }
        }

        checkData.difficulty = parseInt(checkData.difficulty);

        if (this.isGrandmaster) {
            checkData.rollType = checkData.rollType + "Grandmaster";
        }

        let data = await Dice.check(this, checkData.difficulty, checkData.rollType, checkData.modifier);
        let skillAttributes = {};
        if (this.attribute1?.id && this.attribute1?.value) {
            skillAttributes[this.attribute1.id] = this.attribute1.value;
        }

        if (this.attribute2?.id && this.attribute2?.value) {
            skillAttributes[this.attribute2.id] = this.attribute2.value;
        }

        let checkMessageData = {
            type: options.type || "skill",
            skill: this.id,
            skillValue: this.value,
            skillPoints: this.points,
            skillAttributes: skillAttributes,
            difficulty: data.difficulty,
            rollType: checkData.rollType,
            modifierElements: checkData.modifierElements,
            succeeded: data.succeeded,
            isFumble: data.isFumble,
            isCrit: data.isCrit,
            degreeOfSuccess: data.degreeOfSuccess,
            availableSplinterpoints: this.actor.type === "character" ? this.actor.system.splinterpoints.value : 0,
            hideDifficulty: hideDifficulty,
            maneuvers: checkData.maneuvers || [],
            ...(options.checkMessageData || {})
        }

        return ChatMessage.create(await Chat.prepareCheckMessageData(this.actor, checkData.rollMode, data.roll, checkMessageData));
    }

    getFormula() {
        let formula = new Tooltip.TooltipFormula();
        if (this.attribute1) {
            formula.addPart(this.attribute1.value, this.attribute1.label.short);
            formula.addOperator("+");
        }
        if (this.attribute2) {
            formula.addPart(this.attribute2.value, this.attribute2.label.short);
            formula.addOperator("+");
        }
        formula.addPart(this.points, game.i18n.localize("splittermond.skillPointsAbbrev"));

        this.addModifierTooltipFormulaElements(formula);
        return formula;
    }

    tooltip() {
        return this.getFormula().render();
    }

}