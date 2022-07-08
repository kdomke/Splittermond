export default class SplittermondItem extends Item {

    systemData() {
        return !this.system ? this.data.data : this.system;
    }

    itemData() {
        return !this.system ? this.data : this;
    }

    prepareData() {
        super.prepareData();

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

}