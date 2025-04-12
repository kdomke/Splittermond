import SplittermondPhysicalItem from "./physical.js";
import {of} from "../actor/modifiers/expressions/scalar";


export default class SplittermondArmorItem extends SplittermondPhysicalItem {

    prepareActorData() {
        super.prepareActorData();
        if (!this.system.equipped) return
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
        let damageReduction = parseInt(this.system.damageReduction);
        if (handicap)
            this.actor.modifier.add("handicap.armor",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(handicap),
                this
            )
        if (tickMalus)
            this.actor.modifier.add("tickmalus.armor",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(tickMalus),
                this
            )
        if (damageReduction)
            this.actor.modifier.add("damagereduction",
                {
                    name: this.name,
                    type: "equipment"
                },
                of(damageReduction),
                this
            )
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
        if (this.system.features.trim() === "" || this.system.features.trim() === "-") return [];
        return this.system.features?.split(",").map(str => str.trim());
    }
}