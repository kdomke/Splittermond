import {splittermond} from "../config.js";
import {fields, SplittermondDataModel} from "./SplittermondDataModel";

const fields = foundry.data.fields;

/**
 * effectively a copy of what is defined as spell data in the template json
 * We will for now only use ist for the spell roll message, because migrating everything is too risky at this point.
 *
 * @extends {foundry.abstract.DataModel<SplittermondSpellData>}
 * @property {string} availableIn
 * @property {string} skill
 * @property {number} skillLevel
 * @property {string} spellType
 * @property {string} costs
 * @property {string} difficulty
 * @property {string} damage
 * @property {string} range
 * @property {string} castDuration
 * @property {string} effectDuration
 * @property {string} effectArea
 * @property {string} enhancementDescription
 * @property {string} enhancementCosts
 * @property {string} features
 * @property {Record<SpellDegreesOfSuccessOptions,boolean>} degreeOfSuccessOptions
 */
export class SplittermondSpellData extends SplittermondDataModel{
    static defineSchema() {
        return {
            availableIn: new fields.StringField({required: true, nullable: false, initial: ""}),
            skill: new fields.StringField({required: true, blank: false, nullable: false}),
            skillLevel: new fields.NumberField({required: true, blank: false, nullable: false}),
            spellType: new fields.StringField({required: true, nullable: false, initial: ""}),
            costs: new fields.StringField({required: true, blank: false, nullable: false}),
            difficulty: new fields.StringField({required: true, blank: false, nullable: false}),
            damage: new fields.StringField({required: false, blank: false, nullable: true}),
            range: new fields.StringField({required: true, blank: false, nullable: false}),
            castDuration: new fields.StringField({required: true, blank: false, nullable: false}),
            effectDuration: new fields.StringField({required: true, blank: false, nullable: true, initial: null}),
            effectArea: new fields.StringField({required: true, blank: false, nullable: true, initial: null}),
            enhancementDescription: new fields.StringField({required: true, blank: false, nullable: false}),
            enhancementCosts: new fields.StringField({required: true, blank: false, nullable: false}),
            features: new fields.StringField({required: true, blank: false, nullable: true }),
            degreeOfSuccessOptions: new fields.SchemaField(createDegreesOfSuccessOptions(), {
                required: true,
                blank: false
            }),
        }

    }

    /** @param {SplittermondSpellItem} spellItem */
    static fromSpellItem(spellItem) {
        return new SplittermondSpellData(spellItem.system)
    }
}

function createDegreesOfSuccessOptions() {
    const schema = {}
    for (const key in splittermond.spellEnhancement) {
        schema[key] = new fields.BooleanField({required: true, blank: false, initial: false,nullable:false});
    }
    return schema;
}
