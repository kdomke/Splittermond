import Attack from "../actor/attack.js";
import {produceAttackableItemTags} from "./tags/attackableItemTags.js";

const AttackableItem = (superclass) => class extends superclass {

    prepareBaseData() {
        super.prepareBaseData();
        this.attacks = [];
    }

    prepareActorData() {
        super.prepareActorData();


        if (!this.system.equipped && this.type != "npcattack") return;

        this.attacks.push(new Attack(this.actor, this));

        if (this.hasSecondaryAttack) {
            this.attacks.push(new Attack(this.actor, this, true));
        }

        this.attacks.forEach(a => this.actor.attacks.push(a));

    }

    get featuresList() {
        return produceAttackableItemTags(this.system);
    }

    get hasSecondaryAttack() {
        return this.system.secondaryAttack && this.system.secondaryAttack.skill !== "" && this.system.secondaryAttack.skill !== "none";
    }

};

export default AttackableItem;