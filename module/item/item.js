import * as Dice from "../util/dice.js"
import CheckDialog from "../apps/dialog/check-dialog.js"

export default class SplittermondItem extends Item {

    prepareData() {
        super.prepareData();

        const itemData = this.data;
        const data = itemData.data;

        if (itemData.type === "weapon" && this.actor) {
            data.skillPoints = this.skillPoints;
            data.skillValue = this.skillValue;
        }
    }

}