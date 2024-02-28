import {splittermond} from "../config.js";
import {SpellMessageDegreesOfSuccessManager} from "../util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SplittermondSpellRollDataModel>}
 * @property {Readonly<string>} constructorKey
 * @property {SpellMessageDegreesOfSuccessManager} degreeOfSuccessManager
 */
export class SplittermondSpellRollDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            //spell: fields.ObjectField({required: true, blank: false}), //also has caster
            //target: fields.ObjectField({required: true, blank: false}), //actor
            constructorKey: new fields.StringField({required: true, trim:true, blank: false, nullable:false}),
            degreeOfSuccessManager: new fields.EmbeddedDataField(SpellMessageDegreesOfSuccessManager,{required: true, blank: false, nullable: false}),
            actions: new fields.SchemaField({
                    applyDamage: new fields.BooleanField({required: true, blank: false, nullable: false}),
                    consumeCosts: new fields.BooleanField({required: true, blank: false, nullable: false}),
                    useSplinterpoints: new fields.BooleanField({required: true, blank: false, nullable: false}),
                    advanceToken: new fields.BooleanField({required: true, blank: false, nullable: false}),
                }, {required: true, blank: false, nullable: false}
            )
        }
    }

    get usedDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.openDegreesOfSuccess;
    }
}
