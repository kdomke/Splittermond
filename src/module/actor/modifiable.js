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
        let total = this.actor.modifier.getForIds(...this._modifierPath).notSelectable().value();
        let bonusEquipment = parseInt(this.actor.modifier.static(this._modifierPath).filter(mod => mod.type == "equipment" && mod.isBonus).reduce((acc, mod) => acc + mod.value, 0));
        let bonusMagic = parseInt(this.actor.modifier.static(this._modifierPath).filter(mod => mod.type == "magic" && mod.isBonus).reduce((acc, mod) => acc + mod.value, 0));

        total -= Math.max(0, bonusEquipment - this.actor.bonusCap);
        total -= Math.max(0, bonusMagic - this.actor.bonusCap);

        return total;
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