import {fields, SplittermondDataModel} from "./SplittermondDataModel.js";

/**
 * @property {string} messageId
 * @property {object} speaker
 * @property {{type:number, mode: string, rolls:string[], whisper:string[]}} chatOptions
 * @property {SplittermondChatMessage & SplittermondDataModel} message
 */
export class SplittermondChatCardModel extends SplittermondDataModel {
    static defineSchema() {
        return {
            chatOptions: new fields.SchemaField({
                type: new fields.NumberField({required: true, nullable: false}),
                mode: new fields.StringField({required: false, blank: false, nullable: false}),
                rolls: new fields.ArrayField(new fields.StringField(),{required:true, nullable:false, initial: []}),
                blind: new fields.BooleanField({required:true, nullable:false}),
                whisper: new fields.ArrayField(new fields.StringField(), {required:true, nullable:false, initial: []}),
            }, {required: true, blank: false}),
            messageId: new fields.StringField({required: false, blank: false}),
            speaker: new fields.ObjectField({required: true, blank: false}),
            message: new fields.ObjectField({required: true, blank: false}), //if not object then foundry does not store the derived object properties.
        }
    }

    setMessageId(messageId) {
        this.updateSource({messageId: messageId});
    }
}