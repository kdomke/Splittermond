import {SplittermondChatCardModel} from "../../data/SplittermondChatCardModel.js";

export class SplittermondChatCard extends SplittermondChatCardModel {
    /**
     *
     * @param {SplittermondActor} actor
     * @param {SplittermondSpellRollMessage} message
     * @return {SplittermondChatCard}
     */
    static create(actor, message) {
        const gameInterface = new SplittermondChatCardGameInterface();
        const speaker = gameInterface.chatMessageSystem.getSpeaker({actor});

        return new SplittermondChatCard({
            speaker,
            message,
        }, gameInterface);
    }

    /**
     * @param {SplittermondChatCardModel} model
     * @param {SplittermondChatCardGameInterface} gameInterface
     */
    constructor(model, gameInterface = new SplittermondChatCardGameInterface()) {
        super(model);
        this.gameInterface = gameInterface;
    }

    async sendToChat() {
        const content = await this.render();

        const chatData = {
            user: game.user?.id,
            speaker: this.speaker,
            type: this.gameInterface.chatMessageTypes.ROLL,
            content: content,
            flags: {
                splittermond: {
                    chatCard: this.toObject(false),
                },
            },
        };

        const message = await this.gameInterface.chatMessageSystem.create(chatData);

        this.updateSource({messageId: message.id});
        await this.updateMessage();
    }

    async updateMessage() {
        const message = this.getMessage();

        if (!message) {
            this.gameInterface.ui.notifications.warn(this.gameInterface.localize("FAx.ChatCard.MessageNotFound"));
            return Promise.resolve();
        }

        const content = await this.render();
        return await message.update({content, flags: {splittermond: {chatCard: this.toObject(false)}}}); //The flags object was copied from Fatex, I don't know what it does
    }

    getMessage() {
        return this.gameInterface.messages?.get(this.messageId);
    }

    async render() {
        return await this.gameInterface.renderer(this.message.template, this.message.getData());
    }
}

class SplittermondChatCardGameInterface {
    get ui()  {
        return ui;
    }

    get messages() {
        return game.messages;
    }

    get renderer() {
        return renderTemplate;
    }

    get chatMessageSystem() {
        return ChatMessage;
    }

    get localize() {
        return game.i18n.localize;
    }

    get chatMessageTypes() {
        return CONST.CHAT_MESSAGE_TYPES;
    }
}