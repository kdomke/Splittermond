import ActiveDefense from "../actor/active-defense.js";
import AttackableItem from "./attackable-item.ts";
import SplittermondPhysicalItem from "./physical.js";


export default class SplittermondWeaponItem extends AttackableItem(SplittermondPhysicalItem) {

    prepareBaseData() {
        super.prepareBaseData()
        this.activeDefense = [];
    }
    prepareActorData() {
        super.prepareActorData();
        if (this.system.equipped && this.system.features.toLowerCase().includes("unhandlich")) {
            this.actor.addModifier(this, this.name, "VTD -2", "equipment");
        }
        this.prepareActiveDefense();
    }

    prepareActiveDefense() {
        if (!this.system.equipped && this.system.damageLevel <= 1) return;

        this.attacks.forEach(attack => {
            if (["melee", "slashing", "chains", "blades", "staffs"].includes(attack.skill.id)) {
                this.activeDefense.push(new ActiveDefense(this.id, "defense", attack.name, attack.skill, attack.features, attack.img));
            }
        });

        this.activeDefense.forEach(d => this.actor.activeDefense.defense.push(d));
    }
    
}