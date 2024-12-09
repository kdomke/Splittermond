import {addToRegistry} from "../../../module/util/chat/chatMessageRegistry.js";

const constructorRegistryKey = "SplittermondTestRollMessage";
export class SplittermondTestRollMessage extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            constructorKey: new foundry.data.fields.StringField({required: true, trim:true, blank: false}),
            title: new foundry.data.fields.StringField({required: true, blank: false}),
        }
    }
    constructor(data) {
        super({...data, constructorKey : constructorRegistryKey});
    }


    get template(){
        return "systems/splittermond/templates/__tests__/integration/resources/testTemplate.hbs";
    }

    getData(){
        return {
            title: this.title,
        }
    }

    alterTitle(){
        this.updateSource({title: this.title + "2"});
    }
}

addToRegistry(constructorRegistryKey, SplittermondTestRollMessage);