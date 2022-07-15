import SplittermondPhysicalItem from "./physical.js";
import AttackableItem from "./attackable-item.js";
import ActiveDefense from "../actor/active-defense.js";
import Skill from "../actor/skill.js";

export default class SplittermondShieldItem extends AttackableItem(SplittermondPhysicalItem) {

    prepareBaseData() {
        this.activeDefenses = [];
    }

    prepareActorData() {
        super.prepareActorData();
        this.prepareActiveDefense();
        if (!this.systemData().equipped) return;
        if (this.systemData().defenseBonus)
            this.actor.modifier.add("defense", this.name, this.systemData().defenseBonus, this, "equipment");
        let handicap = this.handicap;
        let tickMalus = this.tickMalus;
        if (handicap)
            this.actor.modifier.add("handicap.shield", this.name, handicap, this, "equipment");
        if (tickMalus)
            this.actor.modifier.add("tickmalus.shield", this.name, tickMalus, this, "equipment");
    }


    prepareActiveDefense() {
        if (!this.systemData().equipped && this.systemData().damageLevel <= 1) return;

        let skill = new Skill(this.actor, this.systemData().skill, "intuition", "strength");
        this.activeDefenses.push(new ActiveDefense(this.id, "defense", this.name, skill, this.systemData().features, img));

        this.actor.activeDefenses.defense.push(this.activeDefenses[0]);
    }

    get attributeMalus() {
        if (!this.systemData().equipped) return 0;
        let minAttributeMalus = 0;
        const actor = this.actor;
        (this.systemData().minAttributes || "").split(",").forEach(aStr => {
            let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
            if (temp) {
                let attr = CONFIG.splittermond.attributes.find(a => {
                    return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                });
                if (attr) {
                    minAttributeMalus += Math.max(parseInt(temp[2] || 0) - parseInt(actor.attributes[attr].value), 0);
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