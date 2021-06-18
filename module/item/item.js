export default class SplittermondItem extends Item {

    prepareData() {
        super.prepareData();

        const itemData = this.data;
        const data = itemData.data;

        if (data.id) {
            if (!data.description) {
                const descriptionId = `${itemData.type}.${data.id}.desc`;
                const descriptionText = game.i18n.localize(descriptionId);
                if (descriptionId !== descriptionText) {
                    data.description = descriptionText;
                }
            }

            if (CONFIG.splittermond.modifier[data.id]) {
                data.modifier = CONFIG.splittermond.modifier[data.id];
            }

            if (itemData.type === "spell") {
                const enhancementDescriptionId = `${itemData.type}.${data.id}.enhan`;
                const enhancementDescriptionText = game.i18n.localize(enhancementDescriptionId);
                if (enhancementDescriptionText !== enhancementDescriptionId) {
                    data.enhancementDescription = enhancementDescriptionText;
                }
            }

            if (itemData.type === "strength") {
                if (data.level === false || data.level === true) {
                    data.multiSelectable = data.level;
                    data.level = 1;
                }
                if (data.quantity) {
                    data.quantity = 1;
                }
            }
        }

        if (["strength", "mastery"].includes(itemData.type)) {
            if (!data.modifier) {
                if (CONFIG.splittermond.modifier[itemData.name.toLowerCase()]) {
                    data.modifier = CONFIG.splittermond.modifier[itemData.name.toLowerCase()];
                }
            }
        }

        if (["weapon", "shield", "armor","equipment"].includes(itemData.type)) {
            data.durability = parseInt(data.weight) + parseInt(data.hardness);
            data.sufferedDamage = parseInt(data.sufferedDamage) || 0;

            if (data.durability == 0) {
                if (data.sufferedDamage > 0) {
                    data.damageLevel = 3;
                } else {
                    data.damageLevel = 0;
                }
            } else {
                data.damageLevel = Math.max(Math.min(Math.floor((parseInt(data.sufferedDamage))/data.durability), 3),0);
            }

            data.damageLevelText = CONFIG.splittermond.damageLevel[data.damageLevel];
                
        }

    }

}