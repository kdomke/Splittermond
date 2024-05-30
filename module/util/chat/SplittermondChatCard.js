import {SplittermondChatCardModel} from "../../data/SplittermondChatCardModel.js";
import {getFromRegistry} from "./chatMessageRegistry.js";
import {foundryApi} from "../../api/foundryApi.js";

/**
 * @typedef SplittermondChatMessage
 * @type {object}
 * @property {string} template
 * @property {()=>object} getData
 * @property {Readonly<string>} constructorKey
 */

/**
 * @typedef ChatOptions
 * @type {object}
 * @property {ChatMessageTypes} type
 * @property {?string} mode
 * @property {Roll[]|string[]} rolls evaluated roll instances for the chat message. If this is not a roll, use empty array.
 */
export class SplittermondChatCard extends SplittermondChatCardModel {
    /**
     *
     * @param {SplittermondActor} actor
     * @param {SplittermondChatMessage & foundry.abstract.DataModel} message
     * @param {{type: ChatMessageTypes, mode?: string, rolls:string[]}} chatOptions
     * @return {SplittermondChatCard}
     */
    static create(actor, message,chatOptions) {
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
        this.foundryApiWrapper = gameInterface;
    }

    async sendToChat() {
        const content = await this.render();

        const chatData = {
            user: this.foundryApiWrapper.currentUser.id,
            speaker: this.speaker,
            rolls: this.chatOptions.rolls,
            whisper : [],//this is provisional and makes rolls always public
            type: this.chatOptions.type,
            rollMode: this.chatOptions.mode,
            //TODO: we need to check whether we need to fill whisper with appropriat user roles
            content: content,
            flags: {
                splittermond: {
                    chatCard: this.toObject(false),
                },
            },
        };

        const message = await this.foundryApiWrapper.createChatMessage(chatData);

        this.updateSource({messageId: message.id});
        await this.updateMessage();
    }

    async updateMessage() {
        const message = this.getMessage();

        if (!message) {
            this.foundryApiWrapper.warnUser("splittermond.chatCard.messageNotFound");
            return Promise.resolve();
        }

        const content = await this.render();
        return await message.update({content, flags: {splittermond: {chatCard: this.toObject(false)}}});//we store the data model portion of this object on the chat message
    }

    getMessage() {
        return this.foundryApiWrapper.messages?.get(this.messageId);
    }

    async render() {
        return await this.foundryApiWrapper.renderer(this.message.template, this.message.getData());
    }
}

/**
 * @param {string} action the action invoked on the chat card
 * @param {string} messageId the chat card message id
 * @return {Promise<void>}
 */
export async function handleChatAction(action, messageId) {
    const chatCard = getChatCard(messageId);

    if(hasAction(chatCard.message, action)){
        await Promise.resolve(chatCard.message[action]());
        await chatCard.updateMessage();
    }else{
        foundryApi.warnUser("splittermond.chatCard.actionNotFound");
        throw new Error(`Action ${action} not found on chat card for message ${chatCardFlag.constructorKey} with ${messageId}`);
    }

}
export function handleLocalChatAction(action, messageId) {
    const chatCard = getChatCard(messageId);

    if(hasAction(chatCard.message, action)){
        chatCard.message[action]();
    }else{
        foundryApi.warnUser("splittermond.chatCard.actionNotFound");
        throw new Error(`Action ${action} not found on chat card for message ${chatCard.constructorKey} with ${messageId}`);
    }
}

/**
 * @param {string} messageId
 * @return {SplittermondChatCard}
 */
function getChatCard(messageId){
    const chatCard = foundryApi.messages.get(messageId)
    const chatCardFlag = chatCard.getFlag("splittermond", "chatCard");
    const constructor = getFromRegistry(chatCardFlag.message.constructorKey)
    const messageObject = new constructor(chatCardFlag.message);

    return new SplittermondChatCard({
        ...chatCardFlag,
        message: messageObject,
    }, foundryApi);

}

/**
 *
 * @param {object} object
 * @param {string} action
 */
function hasAction(object, action){
    return (action in object || action in Object.getPrototypeOf(object)) && typeof object[action] === "function";
}

