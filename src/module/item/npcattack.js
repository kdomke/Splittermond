import AttackableItem from "./attackable-item.js";
import SplittermondItem from "./item.js";
import ActiveDefense from "../actor/active-defense.js";

export default class SplittermondNPCAttackItem extends AttackableItem(SplittermondItem) {

    prepareBaseData() {
        super.prepareBaseData()
        this.activeDefenses = [];
    }

    prepareActorData() {
        super.prepareActorData();
        this.prepareActiveDefense();
    }

    prepareActiveDefense() {
        this.attacks.forEach(attack => {
            if (attack.range == 0) {
                this.activeDefenses.push(new ActiveDefense(this.id, "defense", attack.name, attack.skill, attack.features, attack.img));
            }
        });

        this.activeDefenses.forEach(d => this.actor.activeDefense.defense.push(d));
    }

}