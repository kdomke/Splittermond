import Attack from "../actor/attack.js";

const AttackableItem = (superclass) => class extends superclass {

    prepareBaseData() {
        this.attacks = [];
    }

    prepareActorData() {
        super.prepareActorData();


        if (!this.systemData().equipped && this.type != "npcattack") return;

        this.attacks.push(new Attack(this.actor, this));

        if (this.systemData().secondaryAttack && this.systemData().secondaryAttack.skill !== "" && this.systemData().secondaryAttack.skill !== "none") {
            this.attacks.push(new Attack(this.actor, this, true));
        }

        this.attacks.forEach(a => this.actor.attacks.push(a));

    }

};

export default AttackableItem