import {splittermond} from "../config.js";
import {SpellMessageDegreesOfSuccessManager} from "../util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "../util/chat/spellChatMessage/SpellMessageActionsManager.ts";
import {SplittermondSpellRollMessageRenderer} from "../util/chat/spellChatMessage/SpellRollMessageRenderer.ts";
import {ItemReference} from "./references/ItemReference.js";
import {fields, SplittermondDataModel} from "./SplittermondDataModel.ts";


/**
 * @property {Readonly<string>} constructorKey
 * @property {SplittermondSpellRollMessageRenderer} renderer
 * @property {SpellMessageDegreesOfSuccessManager} degreeOfSuccessManager
 * @property {SpellMessageActionsManager} actionManager
 * @property {CheckReport} checkReport
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 */
export class SplittermondSpellRollDataModel extends SplittermondDataModel{
    static defineSchema() {
        return {
            spellReference: new fields.EmbeddedDataField(ItemReference, {required: true, blank: false, nullable: false}),
            checkReport: new fields.ObjectField({required: true, nullable: false}),
            constructorKey: new fields.StringField({required: true, trim:true, blank: false, nullable:false}),
            renderer: new fields.EmbeddedDataField(SplittermondSpellRollMessageRenderer, {required: true, nullable:false}),
            degreeOfSuccessManager: new fields.EmbeddedDataField(SpellMessageDegreesOfSuccessManager,{required: true, nullable: false}),
            actionManager: new fields.EmbeddedDataField(SpellMessageActionsManager,{required: true, nullable: false}),
        }
    }
}
