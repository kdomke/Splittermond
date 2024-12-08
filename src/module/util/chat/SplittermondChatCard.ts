import {
    SplittermondChatCardData,
    SplittermondChatCardModel,
    SplittermondChatMessage
} from "../../data/SplittermondChatCardModel";
import {getFromRegistry} from "./chatMessageRegistry";
import {foundryApi} from "../../api/foundryApi";
import SplittermondActor from "../../actor/actor";
import {ChatMessageTypes} from "../../api/foundryTypes";

interface ChatMessageConfig {
    type: ChatMessageTypes;
    mode?: string;
    whisper: string[];
    blind: boolean;
    rolls: string[];
}

export class SplittermondChatCard extends SplittermondChatCardModel {

    static create(actor: SplittermondActor, message: SplittermondChatMessage, chatOptions: ChatMessageConfig): SplittermondChatCard {
        const speaker = foundryApi.getSpeaker({actor});

        return new SplittermondChatCard({
            speaker,
            chatOptions,
            message,
            messageId: null /*We set the ID internally*/,
        }, foundryApi);
    }

    constructor(model: SplittermondChatCardData, private foundryApiWrapper: typeof foundryApi) {
        super(model);
    }

    async sendToChat() {
        const content = await this.render();

        const chatData = {
            blind: this.chatOptions.blind,
            user: this.foundryApiWrapper.currentUser.id,
            speaker: this.speaker,
            rolls: this.chatOptions.rolls,
            whisper: this.chatOptions.whisper,
            type: this.chatOptions.type,
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
        if (this.messageId === null) {
            return null;
        }
        return this.foundryApiWrapper.messages?.get(this.messageId);
    }

    async render() {
        return await this.foundryApiWrapper.renderer(this.message.template, this.message.getData());
    }
}

/**
 * @param data the dataset that was on the invoked element. Should contain an action to execute.
 * @param messageId the chat card message id
 */
export async function handleChatAction(data: unknown, messageId: string): Promise<void> {
    const chatCard = getChatCard(messageId);
    const isObjectWithAction = data instanceof Object && "action" in data

    if (isObjectWithAction && hasAction(chatCard.message, data.action)) {
        await call(chatCard.message, data.action, data);
        await chatCard.updateMessage();
    } else if(isObjectWithAction && canBeKey(data.action)) {
        await chatCard.message.handleGenericAction({...data, action:data.action})
            .catch(()=>throwNoActionError(chatCard, data, messageId ))
        await chatCard.updateMessage();
    } else {
        throwNoActionError(chatCard, data, messageId);
    }
}

export async function handleLocalChatAction(data: unknown, messageId: string) {
    const chatCard = getChatCard(messageId);
    const isObjectWithAction = data instanceof Object && "action" in data
    if (isObjectWithAction && hasAction(chatCard.message, data.action)) {
        await call(chatCard.message, data.action, data);
    } else if(isObjectWithAction && canBeKey(data.action)) {
        return chatCard.message.handleGenericAction({...data, action: data.action})
            .catch(() => throwNoActionError(chatCard, data, messageId))
    } else {
        throwNoActionError(chatCard, data, messageId);
    }
}

function getChatCard(messageId: string): SplittermondChatCard {
    const chatCard = foundryApi.messages.get(messageId)
    const chatCardFlag = chatCard.getFlag("splittermond", "chatCard") as SplittermondChatCardData;
    const constructor = getFromRegistry(chatCardFlag.message.constructorKey)
    const messageObject = new constructor(chatCardFlag.message);

    return new SplittermondChatCard({
        ...chatCardFlag,
        message: messageObject,
    }, foundryApi);

}

//We have to do these checks twice, because we cannot verify "keyof object" and "callable" at the same time.
function hasAction<T extends object>(object: T, action: unknown): boolean {
    return canBeKey(action) && isKey(action, object)&& isCallable(object[action]);
}
function canBeKey(input:unknown): input is string {
    return typeof input === "string";
}

async function call<T extends object>(object: T, key:unknown, ...args: any[]) {
    if (canBeKey(key) && isKey(key, object)) {
        const memberRef = object[key];
        if (isCallable(memberRef)) {
            //We need to use the call function here, because if we just do a function invocation, we don't get the `this` context.
            return Promise.resolve(memberRef.call(object, ...args));
        }
    }
    throw new Error("Key not found or not callable");
}

function isKey<T extends object>(key: string | number | symbol, object: T): key is keyof T {
    return (key in object || key in Object.getPrototypeOf(object))
}

function isCallable(ref: unknown): ref is (...args: any[]) => any {
    return typeof ref === "function";
}

function throwNoActionError(chatCard:SplittermondChatCard, data:any, messageId:string) {
    foundryApi.warnUser("splittermond.chatCard.actionNotFound");
    throw new Error(`Action ${data.action} not found on chat card for message ${chatCard.message.constructorKey} with ${messageId}`);
}

