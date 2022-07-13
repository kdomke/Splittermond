import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

export default class SplittermondShieldItem extends AttackableItem(SplittermondItem) {

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
        let itemData = duplicate(this.systemData());
        this.actor.systemData().activeDefense.defense.push({
            _id: this.id,
            name: this.name,
            img: this.img,
            item: this,
            skillId: itemData.skill,
            skillMod: itemData.skillMod,
            attribute1: "intuition",
            attribute2: "strength",
            features: itemData.features,
            isDamaged: parseInt(this.systemData().damageLevel) === 1,
            minAttributeMalus: 0
        });
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