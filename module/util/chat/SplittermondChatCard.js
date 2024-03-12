import {SplittermondChatCardModel} from "../../data/SplittermondChatCardModel.js";
import {getFromRegistry} from "./chatMessageRegistry.js";
import {chatFeatureApi} from "./chatActionGameApi.js";

/**
 * @typedef SplittermondChatMessage
 * @type {object}
 * @property {string} template
 * @property {()=>object} getData
 * @property {Readonly<string>} constructorKey
 */
export class SplittermondChatCard extends SplittermondChatCardModel {
    /**
     *
     * @param {SplittermondActor} actor
     * @param {SplittermondChatMessage & foundry.abstract.DataModel} message
     * @param {{type: ChatMessageTypes, mode?: string}} chatOptions
     * @return {SplittermondChatCard}
     */
    static create(actor, message,chatOptions) {
        const foundryApi = chatFeatureApi;
        const speaker = foundryApi.getSpeaker({actor});

        return new SplittermondChatCard({
            speaker,
            chatOptions,
            message,
        }, foundryApi);
    }

    /**
     * @param {SplittermondChatCardModel} model
     * @param {SplittermondChatCardGameInterface} gameInterface
     */
    constructor(model, gameInterface ){
        super(model);
        this.foundryApi = gameInterface;
    }

    async sendToChat() {
        const content = await this.render();

        const chatData = {
            user: this.foundryApi.currentUser.id,
            speaker: this.speaker,
            type: this.chatOptions.type,
            rollMode: this.chatOptions.mode,
            content: content,
            flags: {
                splittermond: {
                    chatCard: this.toObject(false),
                },
            },
        };

        const message = await this.foundryApi.createChatMessage(chatData);

        this.updateSource({messageId: message.id});
        await this.updateMessage();
    }

    async updateMessage() {
        const message = this.getMessage();

        if (!message) {
            this.foundryApi.warnUser("splittermond.chatCard.messageNotFound");
            return Promise.resolve();
        }

        const content = await this.render();
        return await message.update({content, flags: {splittermond: {chatCard: this.toObject(false)}}});//we store the data model portion of this object on the chat message
    }

    getMessage() {
        return this.foundryApi.messages?.get(this.messageId);
    }

    async render() {
        return await this.foundryApi.renderer(this.message.template, this.message.getData());
    }
}

/**
 * @param {string} action the action invoked on the chat card
 * @param {string} messageId the chat card message id
 * @return {Promise<void>}
 */
export async function handleChatAction(action, messageId) {

    const chatCard = chatFeatureApi.messages.get(messageId)
    const chatCardFlag = chatCard.getFlag("splittermond", "chatCard");
    const constructor = getFromRegistry(chatCardFlag.message.constructorKey)
    const messageObject = new constructor(chatCardFlag.message);

    const splittermondChatCard = new SplittermondChatCard({
        ...chatCardFlag,
        message: messageObject,
    }, chatFeatureApi);

    if(hasAction(splittermondChatCard.message, action)){
        splittermondChatCard.message[action]();
        await splittermondChatCard.updateMessage();
    }else{
        chatFeatureApi.warnUser("splittermond.chatCard.actionNotFound");
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

