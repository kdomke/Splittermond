//unfortunately we need to import js because tsc will just not add it upon compilation, breaking the compiled js module
import {fields, SplittermondDataModel} from "./SplittermondDataModel.js";
import type {DataModelSchemaType} from "./SplittermondDataModel";

export class SplittermondChatCardModel extends SplittermondDataModel<SplittermondChatCardData> {

    static defineSchema() {
        return SplittermondChatCardModelSchema();
    }

    setMessageId(messageId: string) {
        this.updateSource({messageId: messageId});
    }
}

function SplittermondChatCardModelSchema() {
    return {
        chatOptions: new fields.SchemaField({
            type: new fields.NumberField({required: true, nullable: false}),
            mode: new fields.StringField({required: false, blank: false, nullable: true}),
            rolls: new fields.ArrayField(new fields.StringField({}), {required: true, nullable: false, initial: []}),
            blind: new fields.BooleanField({required:true, nullable:false}),
            whisper: new fields.ArrayField(new fields.StringField({}), {required: true, nullable: false, initial: []}),
        }, {required: true, blank: false, nullable: false}),
        messageId: new fields.StringField({required: true, blank: false, nullable: true, initial:null}),
        speaker: new fields.ObjectField({required: true, blank: false}),
        message: new fields.ObjectField({required: true, blank: false, nullable:false}), //if not object then foundry does not store the derived object properties.
    }
}

interface SplittermondChatMessageBearer {
    message: SplittermondChatMessage;
}

export interface SplittermondChatMessage {
    template: string;
    getData: () => object;
    readonly constructorKey: string;
}
export type SplittermondChatCardData = Omit<DataModelSchemaType<typeof SplittermondChatCardModelSchema>,"message"> & SplittermondChatMessageBearer;