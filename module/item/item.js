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

    get skillPoints() {
        if (this.data.type === "weapon") {
            if (this.actor) {
                return parseInt(this.actor.data.data.skills[this.data.data.skill].points);
            } else {
                return 0;
            }
        }
    }

    get skillValue() {
        if (this.data.type === "weapon") {
            if (this.actor) {
                const actorData = this.actor.data.data;
                let skillValue = this.skillPoints;
                skillValue += parseInt(actorData.attributes[this.data.data.attribute1].value);
                skillValue += parseInt(actorData.attributes[this.data.data.attribute2].value);
                return skillValue;
            } else {
                return 0;
            }
        }
    }

    async roll() {
        if (this.data.type === "weapon" && this.actor) {
            const itemData = this.data.data;

            let checkData = await CheckDialog.create({
                difficulty: "VTD",
                modifier: 0
            });

            if (!checkData) return;

            let data = Dice.check(this.skillValue, this.skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

            data.title = this.data.name;
            data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

            let templateContext = {
                ...data,
                item: this.data,
                tooltip: await data.roll.getTooltip()
            };

            let chatData = {
                user: game.user._id,
                speaker: ChatMessage.getSpeaker(),
                roll: data.roll,
                content: await renderTemplate("systems/splittermond/templates/chat/weapon-check.hbs", templateContext),
                sound: CONFIG.sounds.dice,
                type: CONST.CHAT_MESSAGE_TYPES.ROLL
            };

            ChatMessage.create(chatData);
        }
    }
}