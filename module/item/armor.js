import SplittermondItem from "./item.js";


export default class SplittermondArmorItem extends SplittermondItem {

    prepareActorData() {
        super.prepareActorData();
        if (!this.systemData().equipped) return
        if (this.systemData().defenseBonus != 0) {
            this.actor.addModifier(this.name, `VTD ${this.systemData().defenseBonus}`, "equipment");
        }
        this.actor.systemData().damageReduction.value = parseInt(this.actor.systemData().damageReduction.value) + parseInt(this.systemData().damageReduction);
        this.actor.systemData().handicap.armor.value += this.handicap;
        this.actor.systemData().tickMalus.armor.value += this.tickMalus;
    }

    get attributeMalus() {
        if (!this.systemData().equipped) return 0;
        return Math.max(parseInt(this.systemData().minStr || 0) - parseInt(this.actor.systemData().attributes.strength.value),0);
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