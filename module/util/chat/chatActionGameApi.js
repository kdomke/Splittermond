export const chatFeatureApi = new class SplittermondChatCardGameInterface {
    /**
     * @param {string} messageKey the key to an entry in the localization file
     */
    warnUser(messageKey) {
        ui.notifications.warn(this.localize(messageKey));
    }

    /** @return {{get: (id:string)=>{getFlag:(...flag: string)=> object}}} */
    get messages() {
        return game.messages;
    }

    get renderer() {
        return renderTemplate;
    }

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

    get localize() {
        return game.i18n.localize;
    }

    /** @return {{ROLL: string}} */
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