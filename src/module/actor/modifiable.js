import {evaluate} from "./modifiers/expressions/evaluation.js";

export default class Modifiable {
    /**
     * 
     * @param {Actor} actor 
     * @param {string} path 
     */
    constructor(actor, path) {
        this.actor = actor;
        if (!Array.isArray(path)) {
            path = [path];
        }
        this._modifierPath = path;
    }

    get mod() {
        const grandTotal = this.actor.modifier.getForIds(...this._modifierPath).notSelectable().value();
        const bonusEquipment = this.actor.modifier.getForIds(...this._modifierPath).notSelectable().getModifiers()
            .filter(mod => mod.type === "equipment" && mod.isBonus).reduce((acc, mod) => acc + evaluate(mod.value), 0);
        const bonusMagic = this.actor.modifier.getForIds(...this._modifierPath).notSelectable().getModifiers()
            .filter(mod => mod.type === "magic" && mod.isBonus).reduce((acc, mod) => acc + evaluate(mod.value), 0);

        const cappedEquipment = grandTotal - Math.max(0, bonusEquipment - this.actor.bonusCap);
        return cappedEquipment - Math.max(0, bonusMagic - this.actor.bonusCap);
    }

    addModifierPath(path) {
        this._modifierPath.push(path);
    }

    addModifierTooltipFormulaElements(formula, bonusPrefix = "+", malusPrefix = "-") {
        this.actor.modifier.static(this._modifierPath).forEach((e) => {
            e.addTooltipFormulaElements(formula, bonusPrefix, malusPrefix);
        });
    }
}