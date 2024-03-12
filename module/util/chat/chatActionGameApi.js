export const chatFeatureApi = new class SplittermondChatCardGameInterface {


    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    warnUser(messageKey) {
        ui.notifications.warn(this.localize(messageKey));
    }

    /** @return {{get: (id:string) => ChatMessage}}*/
    get messages() {
        return game.messages;
    }

    /** @return {(template: string, data: {object}) => Promise<string>} */
    get renderer() {
        return renderTemplate;
    }

    /**
     * @typedef {{id: string, update(data:object):Promise<ChatMessage>, getFlag(scope: string, key:string):object}} ChatMessage object from foundry, guaranteed to have an id.
     * @param {object} chatData
     * @return {Promise<ChatMessage>} message
     */
    createChatMessage(chatData) {
        return ChatMessage.create(chatData);
    }

    /**
     * @param {object} data object containing the actor
     * @return {{scene:string,token: string,actor: string,alias: string}} the token that is registered as the speaker
     */
    getSpeaker(data) {
        return ChatMessage.getSpeaker(data);
    }

    /**
     * @param {string} messageKey
     * @return {string} the localized string or the key if no localization is found
     */
    localize(messageKey) {
        return game.i18n.localize(messageKey);
    }

    /**
     * @typedef ChatMessageTypes
     * @type {object}
     * @property EMOTE: 3
     * @property IC: 2
     * @property OOC: 1
     * @property OTHER: 0
     * @property ROLL: 5
     * @property WHISPER: 4
     */

    /** @return {ChatMessageTypes} */
    get chatMessageTypes() {
        return CONST.CHAT_MESSAGE_TYPES;
    }

    /** @return {{isGM: boolean, id: string, active: boolean}}*/
    get currentUser() {
        return game.user
    }

    /** @return {{isGM: boolean, id: string, active: boolean}[]}*/
    get users(){
        return game.users;
    }

    /** @return {{on: (key:string, ()=>void)=>void, emit: (key:string, object:object)=>void}} */
    get socket() {
        return game.socket;
    }

    get hooks() {
        return Hooks;
    }
}