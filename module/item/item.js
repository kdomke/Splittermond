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



    }

}