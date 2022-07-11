export default class SplittermondItem extends Item {

    constructor(data, context) {
        if (context?.splittermond?.ready) {
            super(data, context);
        } else {
            mergeObject(context, { splittermond: { ready: true } });
            const ItemConstructor = CONFIG.splittermond.Item.documentClasses[data.type];
            return ItemConstructor ? new ItemConstructor(data, context) : new SplittermondItem(data, context);
        }
    }

    systemData() {
        return !this.system ? this.data.data : this.system;
    }

    itemData() {
        return !this.system ? this.data : this;
    }

    prepareBaseData() {
        console.log(`prepareBaseData() - ${this.type}: ${this.name}`);
        super.prepareBaseData();

        const data = this.systemData();

        

        if (data.id) {
            if (!data.description) {
                const descriptionId = `${this.type}.${data.id}.desc`;
                const descriptionText = game.i18n.localize(descriptionId);
                if (descriptionId !== descriptionText) {
                    data.description = descriptionText;
                }
            }

            if (CONFIG.splittermond.modifier[data.id]) {
                data.modifier = CONFIG.splittermond.modifier[data.id];
            }

            if (this.type === "spell") {
                const enhancementDescriptionId = `${this.type}.${data.id}.enhan`;
                const enhancementDescriptionText = game.i18n.localize(enhancementDescriptionId);
                if (enhancementDescriptionText !== enhancementDescriptionId) {
                    data.enhancementDescription = enhancementDescriptionText;
                }
            }

            if (this.type === "strength") {
                if (data.level === false || data.level === true) {
                    data.multiSelectable = data.level;
                    data.level = 1;
                }
                if (data.quantity) {
                    data.quantity = 1;
                }
            }
        }

        if (["strength", "mastery"].includes(this.type)) {
            if (!data.modifier) {
                if (CONFIG.splittermond.modifier[this.name.toLowerCase()]) {
                    data.modifier = CONFIG.splittermond.modifier[this.name.toLowerCase()];
                }
            }
        }

        if (["weapon", "shield", "armor","equipment"].includes(this.type)) {
            data.durability = parseInt(data.weight) + parseInt(data.hardness);
            data.sufferedDamage = parseInt(data.sufferedDamage) || 0;

            if (data.durability == 0) {
                if (data.sufferedDamage > 0) {
                    data.damageLevel = 3;
                } else {
                    data.damageLevel = 0;
                }
            } else {
                data.damageLevel = Math.max(Math.min(Math.floor((parseInt(data.sufferedDamage)-1)/data.durability), 3),0);
                if (data.sufferedDamage === 3*data.durability) {
                    data.damageLevel = 3;
                }
            }

            data.damageLevelText = CONFIG.splittermond.damageLevel[data.damageLevel];
                
        }


    }

    prepareActorData() {
        const data = this.systemData();
        switch (this.type) {
            case "weapon":
            case "shield":
            case "armor":
                if (!data.equipped) {
                    break;
                }
            case "equipment":
                this.actor.addModifier(this.name, data.modifier, "equipment");
                break;
            case "strength":
                this.actor.addModifier(this.name, data.modifier, "strength", data.quantity)
                break;
            case "statuseffect":
                this.actor.addModifier(this.name, data.modifier, "statuseffect", data.level);
                break;
            case "spelleffect":
                if (data.active) {
                    this.actor.addModifier(this.name, data.modifier, "magic");
                }
                break
            default:
                if (data.modifier) {
                    this.actor.addModifier(this.name, data.modifier);
                }
                
                break;
        }
        
    }

}