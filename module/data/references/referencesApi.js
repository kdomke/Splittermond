
export const referencesApi = new class ReferencesApi {

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
}