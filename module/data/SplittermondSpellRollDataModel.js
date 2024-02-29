import {splittermond} from "../config.js";
import {SpellMessageDegreesOfSuccessManager} from "../util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "../util/chat/spellChatMessage/SpellMessageActionsManager.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SplittermondSpellRollDataModel>}
 * @property {Readonly<string>} constructorKey
 * @property {SpellMessageDegreesOfSuccessManager} degreeOfSuccessManager
 * @property {SpellMessageActionsManager} actionManager
 */
export class SplittermondSpellRollDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            //spell: fields.ObjectField({required: true, blank: false}), //also has caster
            //target: fields.ObjectField({required: true, blank: false}), //actor
            messageTitle: new fields.StringField({required: true, blank: false, nullable: false}),
            constructorKey: new fields.StringField({required: true, trim:true, blank: false, nullable:false}),
            degreeOfSuccessManager: new fields.EmbeddedDataField(SpellMessageDegreesOfSuccessManager,{required: true, blank: false, nullable: false}),
            actionManager: new fields.EmbeddedDataField(SpellMessageActionsManager,{required: true, blank: false, nullable: false}),
        }
    }
}
