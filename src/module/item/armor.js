import SplittermondItem from "./item.js";
import SplittermondPhysicalItem from "./physical.js";


export default class SplittermondArmorItem extends SplittermondPhysicalItem {

    prepareActorData() {
        super.prepareActorData();
        if (!this.system.equipped) return
        if (this.system.defenseBonus)
            this.actor.modifier.addOld("defense", this.name, this.system.defenseBonus, this, "equipment");
        let handicap = this.handicap;
        let tickMalus = this.tickMalus;
        let damageReduction = parseInt(this.system.damageReduction);
        if (handicap)
            this.actor.modifier.addOld("handicap.armor", this.name, handicap, this, "equipment");
        if (tickMalus)
            this.actor.modifier.addOld("tickmalus.armor", this.name, tickMalus, this, "equipment");
        if (damageReduction)
            this.actor.modifier.addOld("damagereduction", this.name, damageReduction, this, "equipment");
    }

    get attributeMalus() {
        if (!this.system.equipped) return 0;
        return Math.max(parseInt(this.system.minStr || 0) - parseInt(this.actor.attributes.strength.value), 0);
    }

    get handicap() {
        if (!this.system.equipped) return 0;
        return parseInt(this.system.handicap) + this.attributeMalus;
    }

    get tickMalus() {
        if (!this.system.equipped) return 0;
        return parseInt(this.system.tickMalus) + this.attributeMalus;
    }

    get featuresList() {
        if (Array.isArray(this.system.features)) return [];
        if (this.system.features.trim() == "" || this.system.features.trim() == "-") return [];
        return this.system.features?.split(",").map(str => str.trim());
    }
}