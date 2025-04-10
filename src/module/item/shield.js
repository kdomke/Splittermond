import SplittermondPhysicalItem from "./physical.js";
import AttackableItem from "./attackable-item.ts";
import ActiveDefense from "../actor/active-defense.js";
import Skill from "../actor/skill.js";
import {of} from "../actor/modifiers/expressions";

export default class SplittermondShieldItem extends AttackableItem(SplittermondPhysicalItem) {

    prepareBaseData() {
        super.prepareBaseData();
        this.activeDefenses = [];
        this.system.attribute1 = "agility";
        this.system.attribute2 = "strength";
    }

    prepareActorData() {
        super.prepareActorData();
        this.prepareActiveDefense();
        if (!this.system.equipped) return;
        if (this.system.defenseBonus)
            this.actor.modifier.add(
                "defense",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(this.system.defenseBonus),
                this
            )
        let handicap = this.handicap;
        let tickMalus = this.tickMalus;
        if (handicap)
            this.actor.modifier.add(
                "handicap.shield",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(handicap),
                this
            )
        if (tickMalus)
            this.actor.modifier.add(
                "tickmalus.shield",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(tickMalus),
                this
            )
    }


    prepareActiveDefense() {
        if (!this.system.equipped && this.system.damageLevel <= 1) return;

        let skill = new Skill(this.actor, this.system.skill, "intuition", "strength");
        this.activeDefenses.push(new ActiveDefense(this.id, "defense", this.name, skill, this.system.features, this.img));

        this.actor.activeDefense.defense.push(this.activeDefenses[0]);
    }

    get attributeMalus() {
        if (!this.system.equipped) return 0;
        let minAttributeMalus = 0;
        const actor = this.actor;
        (this.system.minAttributes || "").split(",").forEach(aStr => {
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
        if (!this.system.equipped) return 0;
        return parseInt(this.system.handicap) + this.attributeMalus;
    }

    get tickMalus() {
        if (!this.system.equipped) return 0;
        return parseInt(this.system.tickMalus) + this.attributeMalus;
    }
}