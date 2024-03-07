import {referencesApi} from "./referencesApi.js";

const fields = foundry.data.fields

/**
 * A reference to a Token object, which is used to represent a specific Token within a ChatMessage.
 * @extends {foundry.abstract.DataModel<AgentReference,never>}
 * @property {string} id
 * @property {string|null} sceneId
 * @property {"actor"|"token"} type
 */
export class AgentReference extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            id: new fields.StringField({required: true, blank: false, nullable: false}),
            sceneId: new fields.StringField({required: false, blank: true, nullable: true}),
            type: new fields.StringField({required: true, blank: false, nullable: false})
        }
    }

    /**
     *
     * @param {SplittermondActor|TokenDocument} agent
     * @return {AgentReference}
     */
    static initialize(agent) {
        if (agent.documentName === "Actor") {
            return !agent.parent ?
                new AgentReference({id: agent.id, sceneId: null, type: "actor"}) :
                new AgentReference({id: agent.parent.id, sceneId: agent.parent.parent.id, type: "token"});
        } else if (agent.documentName === "Token") {
            return new AgentReference({id: agent.id, sceneId: agent.parent.id, type: "token"});
        } else {
            throw new Error("AgentReference can only be initialized with an actor or a token");
        }


    }

    /**@return SplittermondActor */
    getAgent() {
        const agent = this.#getActor()
        if(!agent){
            throw new Error("AgentReference could not resolve the agent")
        }
        return agent;
    }

    #getActor(){
        if (this.type === "actor") {
            return referencesApi.getActor(this.id);
        } else {
            return referencesApi.getToken(this.sceneId, this.id)?.actor;
        }
    }
}
