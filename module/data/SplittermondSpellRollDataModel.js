import {splittermond} from "../config.js";
import {SpellMessageDegreesOfSuccessManager} from "../util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "../util/chat/spellChatMessage/SpellMessageActionsManager.js";
import {SplittermondSpellRollMessageRenderer} from "../util/chat/spellChatMessage/SpellRollMessageRenderer.js";
import {ItemReference} from "./references/ItemReference.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SplittermondSpellRollDataModel>}
 * @property {Readonly<string>} constructorKey
 * @property {SplittermondSpellRollMessageRenderer} renderer
 * @property {SpellMessageDegreesOfSuccessManager} degreeOfSuccessManager
 * @property {SpellMessageActionsManager} actionManager
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 */
export class SplittermondSpellRollDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            spellReference: new fields.EmbeddedDataField(ItemReference, {required: true, blank: false, nullable: false}),
            constructorKey: new fields.StringField({required: true, trim:true, blank: false, nullable:false}),
            renderer: new fields.EmbeddedDataField(SplittermondSpellRollMessageRenderer, {required: true, blank: false, nullable:false}),
            degreeOfSuccessManager: new fields.EmbeddedDataField(SpellMessageDegreesOfSuccessManager,{required: true, blank: false, nullable: false}),
            actionManager: new fields.EmbeddedDataField(SpellMessageActionsManager,{required: true, blank: false, nullable: false}),
        }
    }
}
