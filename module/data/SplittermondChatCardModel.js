
const fields = foundry.data.fields;

/**
 * @property {string} messageId
 * @property {object} speaker
 * @property {SplittermondChatMessage & foundry.abstract.DataModel} message
 */
export class SplittermondChatCardModel extends  foundry.abstract.DataModel {
    static defineSchema() {
        return {
            messageId: new fields.StringField({required: false, blank: false}),
            speaker: new fields.ObjectField({required: true, blank: false}),
            message: new fields.ObjectField({required: true, blank: false}), //if not object then foundry does not store the derived object properties.
        }
    }

    setMessageId(messageId) {
        this.updateSource({messageId: messageId});
    }
}