import {fields, DataModelSchemaType, SplittermondDataModel} from "data/SplittermondDataModel";

export class SplittermondChatCardModel extends SplittermondDataModel<SplittermondChatCardData> {
    static defineSchema() {
        return SplittermondChatCardModelSchema();
    }

    setMessageId(messageId:string) {
        this.updateSource({messageId: messageId});
    }
}

function SplittermondChatCardModelSchema(){
    return {
        chatOptions: new fields.SchemaField({
            type: new fields.NumberField({required: true, nullable: false}),
            mode: new fields.StringField({required: false, blank: false, nullable: true}),
            rolls: new fields.ArrayField(new fields.StringField({}),{required:true, nullable:false, initial: []}),
            whisper: new fields.ArrayField(new fields.StringField({}), {required:true, nullable:false, initial: []}),
        }, {required: true, blank: false}),
        messageId: new fields.StringField({required: true, blank: false}),
        speaker: new fields.ObjectField({required: true, blank: false}),
        message: new fields.ObjectField({required: true, blank: false}), //if not object then foundry does not store the derived object properties.
    }
}
type SplittermondChatCardData = DataModelSchemaType<typeof SplittermondChatCardModelSchema>;
//For testing only
const c :SplittermondChatCardData = {
    message: {}, speaker: {}, chatOptions:{type:3, mode: null, rolls:[],whisper:[3]}, messageId:""
}
const d = new SplittermondChatCardModel(c);
d.chatOptions