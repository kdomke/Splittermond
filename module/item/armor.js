import SplittermondItem from "./item.js";


export default class SplittermondArmorItem extends SplittermondItem {

    prepareActorData() {
        super.prepareActorData();
        if (!this.systemData().equipped) return
        if (this.systemData().defenseBonus)
            this.actor.modifier.add("defense", this.name, this.systemData().defenseBonus, this, "equipment");
        let handicap = this.handicap;
        let tickMalus = this.tickMalus;
        let damageReduction = parseInt(this.actor.systemData().damageReduction.value);
        if (handicap)
            this.actor.modifier.add("handicap.shield", this.name, handicap, this, "equipment");
        if (tickMalus)
            this.actor.modifier.add("tickmalus.shield", this.name, tickMalus, this, "equipment");
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