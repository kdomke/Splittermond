import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

export default class SplittermondShieldItem extends AttackableItem(SplittermondItem) {

    prepareActorData() {
        super.prepareActorData();
        if (this.systemData().equipped && this.systemData().defenseBonus != 0) {
            this.actor.addModifier(this.name, `VTD ${this.systemData().defenseBonus}`, "equipment")
        }
        this.actor.systemData().handicap.shield.value += this.handicap;
        this.actor.systemData().tickMalus.shield.value += this.tickMalus;
    }

    get attributeMalus() {
        if (!this.systemData().equipped) return 0;
        let minAttributeMalus = 0;
        (this.systemData().minAttributes || "").split(",").forEach(aStr => {
            let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
            if (temp) {
                let attr = CONFIG.splittermond.attributes.find(a => {
                    return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                });
                if (attr) {
                    minAttributeMalus +=  Math.max(parseInt(temp[2] || 0) - parseInt(this.actor.systemData().attributes[attr].value), 0);
                }
            }
        });

        return minAttributeMalus;
    }

    get handicap() {
        if (!this.systemData().equipped) return 0;
        return parseInt(this.systemData().handicap) + this.attributeMalus;
    }

    get tickMalus() {
        if (!this.systemData().equipped) return 0;
        return parseInt(this.systemData().tickMalus) + this.attributeMalus;
    }
}