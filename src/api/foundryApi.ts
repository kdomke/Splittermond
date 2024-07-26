import type {ChatMessage, ChatMessageTypes, Hooks, Roll, Socket, User} from "./foundryTypes";

export const foundryApi = new class FoundryApi {

    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    reportError(messageKey: string): void {
        //@ts-ignore
        ui.notifications.error(this.localize(messageKey));
    }

    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    warnUser(messageKey: string): void {
        //@ts-ignore
        ui.notifications.warn(this.localize(messageKey));
    }

    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    informUser(messageKey: string): void {
        // @ts-ignore
        ui.notifications.info(this.localize(messageKey));
    }

    // @ts-expect-error messages is used in a js file outside the compiler scope
    private get messages(): { get: (id: string) => ChatMessage } {
        //@ts-ignore
        return game.messages;
    }

    get renderer(): (template: string, data: object) => Promise<string> {
        //@ts-ignore
        return renderTemplate;
    }

    createChatMessage(chatData: object): Promise<ChatMessage> {
        //@ts-ignore
        return ChatMessage.create(chatData);
    }

    /**
     * @param {object} data object containing the actor
     * @return {{scene:string,token: string,actor: string,alias: string}} the token that is registered as the speaker
     */
    getSpeaker(data: object) {
        //@ts-ignore
        return ChatMessage.getSpeaker(data);
    }

    /**
     * @param {string} messageKey
     * @return {string} the localized string or the key if no localization is found
     */
    localize(messageKey: string): string {
        //@ts-ignore
        return game.i18n.localize(messageKey);
    }

    /**
     * @typedef ChatMessageTypes
     * @type {object}
     * @property EMOTE: 3
     * @property IC: 2
     * @property OOC: 1
     * @property OTHER: 0
     */

    get chatMessageTypes(): ChatMessageTypes {
        //@ts-ignore
        return CONST.CHAT_MESSAGE_TYPES;
    }

    get currentUser(): User {
        //@ts-ignore
        return game.user
    }

    get users(): User[] {
        //@ts-ignore
        return game.users;
    }

    get socket(): Socket {
        //@ts-ignore
        return game.socket;
    }

    get hooks(): Hooks {
        //@ts-ignore
        return Hooks;
    }


    /**
     * @return {SplittermondItem}
     */
    getItem(itemId: string) {
        //@ts-ignore
        return game.items.get(itemId);
    }

    /**
     * @return {SplittermondActor|undefined}
     */
    getActor(actorId: string) {
        //@ts-ignore
        return game.actors.get(actorId);
    }

    /**
     * @returns {TokenDocument|undefined}
     */
    getToken(sceneId: string, tokenId: string) {
        //@ts-ignore
        return game.scenes.get(sceneId)?.tokens.get(tokenId);
    }

    roll(damageFormula: string, context: object = {}): Roll {
        // @ts-ignore
        return new Roll(damageFormula, context)
    }
}