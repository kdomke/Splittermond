import {SplittermondChatCardModel} from "../../data/SplittermondChatCardModel.js";
import {getFromRegistry} from "./chatMessageRegistry.js";

/**
 * @typedef SplittermondChatMessage
 * @type {object}
 * @property {string} template
 * @property {()=>object} getData
 */
export class SplittermondChatCard extends SplittermondChatCardModel {
    /**
     *
     * @param {SplittermondActor} actor
     * @param {SplittermondChatMessage & foundry.abstract.DataModel} message
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

/**
 * @param {string} action the action invoked on the chat card
 * @param {string} messageId the chat card message id
 * @param userId
 * @return {Promise<void>}
 */
export async function handleChatAction(action, messageId, userId) {
    const gameInterface = new SplittermondChatCardGameInterface();

    const chatCard = gameInterface.messages.get(messageId)
    const chatCardFlag = chatCard.getFlag("splittermond", "chatCard");
    const constructor = getFromRegistry(chatCardFlag.message.constructorKey)
    const messageObject = new constructor(chatCardFlag.message);

    const splittermondChatCard = new SplittermondChatCard({
        ...chatCardFlag,
        message: messageObject,
    }, gameInterface);

    if(hasAction(splittermondChatCard.message, action)){
        splittermondChatCard.message[action]();
        await splittermondChatCard.updateMessage();
    }else{
        gameInterface.ui.notifications.warn(gameInterface.localize("splittermond.chatCard.actionNotFound"));
        throw new Error(`Action ${action} not found on chat card for message ${chatCardFlag.constructorKey} with ${messageId}`);
    }

}

/**
 *
 * @param {object} object
 * @param {string} action
 */
function hasAction(object, action){
    return (action in object || action in Object.getPrototypeOf(object)) && typeof object[action] === "function";
}

class SplittermondChatCardGameInterface {
    get ui() {
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