export const foundryApi= new class FoundryApi {

    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    reportError(messageKey) {
        ui.notifications.error(this.localize(messageKey));
    }
    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    warnUser(messageKey) {
        ui.notifications.warn(this.localize(messageKey));
    }

    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    informUser(messageKey) {
        ui.notifications.info(this.localize(messageKey));
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

    /**
     * @return {{once: (key:string, ()=>void)=>void, on: (key:string, ()=>void)=>void}}
     */
    get hooks() {
        return Hooks;
    }


    /**
     * @param {string} itemId
     * @return {SplittermondItem}
     */
    getItem(itemId){
        return game.items.get(itemId);
    }

    /**
     * @param {string} actorId
     * @return {SplittermondActor|undefined}
     */
    getActor(actorId){
        return game.actors.get(actorId);
    }

    /**
     * @param {string} sceneId
     * @param {string} tokenId
     * @returns {TokenDocument|undefined}
     */
    getToken(sceneId, tokenId){
        return game.scenes.get(sceneId)?.tokens.get(tokenId);
    }


    /**
     * @typedef Die
     * @type {object}
     * @property {number} faces
     * @property {{active:true, result:number}[]} results
     */

    /**
     * @typedef OperatorTerm
     * @type {object}
     * @property {string} operator
     */

    /**
     * @typedef NumericTerm
     * @type {object}
     * @property {number} number
     */


    /**
     * @typedef Roll
     * @type {object}
     * @property {((options:{async: true})=>Promise<Roll>} evaluate
     * @property {number} _total
     * @property {Readonly<number>} total
     * @property {(Die|OperatorTerm|NumericTerm)[]}terms
     */
    /**
     * @param {string} damageFormula
     * @param {object} context
     * @return {Roll}
     */
    roll(damageFormula, context = {}) {
        return new Roll(damageFormula, context)
    }
}