import {
    SpellMessageDegreesOfSuccessManager
} from "../util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "../util/chat/spellChatMessage/SpellMessageActionsManager.js";
import {SplittermondSpellRollMessageRenderer} from "../util/chat/spellChatMessage/SpellRollMessageRenderer.js";
import {ItemReference} from "./references/ItemReference.js";
import {DataModelSchemaType, fields, SplittermondDataModel} from "./SplittermondDataModel";


export class SplittermondSpellRollDataModel extends SplittermondDataModel<SplittermondSpellRollDataModelSchema> {
    static defineSchema() {
        return SplittermondSpellRollSchema();
    }
}


