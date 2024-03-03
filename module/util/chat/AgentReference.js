
const fields = foundry.data.fields
/**
 * A reference to a Token object, which is used to represent a specific Token within a ChatMessage.
 * @extends {foundry.abstract.DataModel<AgentReference,never>}
 * @property {string} name
 * @property {string|null} sceneName
 * @property {"actor"|"token"} type
 */
export class AgentReference extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            name: new fields.StringField({required: true, blank: false, nullable: false}),
            sceneName: new fields.StringField({required: false, blank: true, nullable: true}),
            type: new fields.StringField({required: true, blank: false, nullable: false})
        }
    }

    static initialize(agent){
        if(!agent.parent) { //agent is a primary document and therefore must be an actor
           return new AgentReference({name: agent.name, sceneName: null, type: "actor"});
        }else {
            return new AgentReference({name: agent.parent.name, sceneName: agent.parent.parent.name, type: "token"});
        }

    }

    getAgent(){
        //TODO use chatFeatureAPI
        if(this.type === "actor"){
           return game.actors.getName(this.name);
        } else {
            return game.scenes.find(s => s.name === this.sceneName).tokens.find(t => t.name === this.name);
        }
    }
}
