import Attack from "../actor/attack.js";
import { produceAttackableItemTags } from "./tags/attackableItemTags.js";
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

            if(!("equipped" in this.system)) {
               return
            }else if (!this.system.equipped && this.type !== "npcattack") {
                return;
            }

            this.attacks.push(new Attack(this.actor, this));

            if (this.hasSecondaryAttack) {
                this.attacks.push(new Attack(this.actor, this, true));
            }

            this.attacks.forEach((attack) => this.actor.attacks.push(attack));
        }

        get featuresList() {
            //TODO check this
            const system = this.system;
            if("features" in system && Array.isArray(system.features)){
               return system.features;
            } else if ("features" in system && typeof system.features === "string") {
                return produceAttackableItemTags(system as {features?: string|null});
            }
            return [];
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
