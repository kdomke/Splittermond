import ActiveDefense from "../actor/active-defense.js";
import AttackableItem from "./attackable-item.js";
import SplittermondPhysicalItem from "./physical.js";


export default class SplittermondWeaponItem extends AttackableItem(SplittermondPhysicalItem) {

    prepareBaseData() {
        super.prepareBaseData()
        this.activeDefense = [];
    }
    prepareActorData() {
        super.prepareActorData();
        this.prepareActiveDefense();
    }

    prepareActiveDefense() {
        if (!this.systemData().equipped && this.systemData().damageLevel <= 1) return;

        this.attacks.forEach(attack => {
            if (["melee", "slashing", "chains", "blades", "staffs"].includes(attack.skill.id)) {
                this.activeDefense.push(new ActiveDefense(this.id, "defense", attack.name, attack.skill, attack.features, attack.img));
            }
        });

        this.activeDefense.forEach(d => this.actor.activeDefense.defense.push(d));
    }
}