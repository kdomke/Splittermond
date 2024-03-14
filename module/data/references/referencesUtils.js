import {api} from "../../api/api.js";
import {AgentReference} from "./AgentReference.js";

export const referencesUtils ={
    /**@type {() => AgentReference}*/findBestUserActor,
}

/**
 * @returns {AgentReference}
 * @throws {Error}
 */
function findBestUserActor(){
    /*
  * Incredible as it is, as of V11, going via the chat system is actually the best and most robust way to
  * figure out against whom to send the active defense action. It checks, explicitly given actors, controlled
  * tokens (via game.canvas.tokens.controlled), or owned actors (via game.user.character).
  */
    const speaker = api.getSpeaker();//TODO we should not use the chatFeature API here.
    /**@type {AgentReference|null} */ let actor = null;
    if (speaker.token) {
        actor = withTry(()=>AgentReference.initialize(api.getToken(speaker.scene, speaker.token)));
    }
    if (!actor && speaker.actor) {
        actor = withTry(() => AgentReference.initialize(api.getActor(speaker.actor)));
    }
    if (!actor) {
        throw new Error("No actor found for the current user.")
    }
    return actor
}
function withTry(callback){
    try{
        return callback();
    }catch(Error){
        return null;
    }
}