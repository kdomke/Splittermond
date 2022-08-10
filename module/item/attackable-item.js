import Attack from "../actor/attack.js";

const AttackableItem = (superclass) => class extends superclass {

    prepareBaseData() {
        this.attacks = [];
    }

    prepareActorData() {
        super.prepareActorData();


        if (!this.system.equipped && this.type != "npcattack") return;

        this.attacks.push(new Attack(this.actor, this));

        if (this.system.secondaryAttack && this.system.secondaryAttack.skill !== "" && this.system.secondaryAttack.skill !== "none") {
            this.attacks.push(new Attack(this.actor, this, true));
        }

        this.attacks.forEach(a => this.actor.attacks.push(a));

    }

};

export default AttackableItem