import Attack from "../actor/attack";
import { produceAttackableItemTags } from "./tags/attackableItemTags";
import SplittermondItem from "./item";

// Helper type to define a constructor
type Constructor<T = {}> = new (...args: any[]) => T;


// Mixin function to extend SplittermondItem
function AttackableItem<TBase extends Constructor<SplittermondItem>>(Base: TBase) {
    return class AttackableItem extends Base {
        // Define attacks as an array of Attack instances
        attacks: Attack[] = [];

        prepareBaseData(): void {
            super.prepareBaseData();
            this.attacks = [];
        }

        prepareActorData(): void {
            super.prepareActorData();

            const isUnequipped = !("equipped" in this.system  && this.system.equipped);
            if ( isUnequipped && this.type !== "npcattack") {
                return;
            }

            this.attacks.push(new Attack(this.actor, this));

            if (this.hasSecondaryAttack) {
                this.attacks.push(new Attack(this.actor, this, true));
            }

            this.attacks.forEach((attack) => this.actor.attacks.push(attack));
        }

        get featuresList() {
            return "features" in this.system ?
                produceAttackableItemTags(this.system): [];
        }

        get hasSecondaryAttack(): boolean {
            return (
                "secondaryAttack" in this.system && !!this.system.secondaryAttack &&
                this.system.secondaryAttack.skill !== "" &&
                this.system.secondaryAttack.skill !== "none"
            );
        }
    };
}

export default AttackableItem;
