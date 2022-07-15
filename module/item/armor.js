import SplittermondItem from "./item.js";
import SplittermondPhysicalItem from "./physical.js";


export default class SplittermondArmorItem extends SplittermondPhysicalItem {

    prepareActorData() {
        super.prepareActorData();
        if (!this.systemData().equipped) return
        if (this.systemData().defenseBonus)
            this.actor.modifier.add("defense", this.name, this.systemData().defenseBonus, this, "equipment");
        let handicap = this.handicap;
        let tickMalus = this.tickMalus;
        let damageReduction = parseInt(this.systemData().damageReduction);
        if (handicap)
            this.actor.modifier.add("handicap.armor", this.name, handicap, this, "equipment");
        if (tickMalus)
            this.actor.modifier.add("tickmalus.armor", this.name, tickMalus, this, "equipment");
        if (damageReduction)
            this.actor.modifier.add("damagereduction", this.name, damageReduction, this, "equipment");
    }

    get attributeMalus() {
        if (!this.systemData().equipped) return 0;
        return Math.max(parseInt(this.systemData().minStr || 0) - parseInt(this.actor.attributes.strength.value), 0);
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