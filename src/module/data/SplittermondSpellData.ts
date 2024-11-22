import {splittermond} from "../config.js";
import {DataModelSchemaType, fields, SplittermondDataModel} from "./SplittermondDataModel";
import SplittermondSpellItem from "../item/spell";

/**
 * effectively a copy of what is defined as spell data in the template json
 * We will for now only use ist for the spell roll message, because migrating everything is too risky at this point.
**/
function SplittermondSpellSchema(){
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
export type SplittermondSpellType = DataModelSchemaType<typeof SplittermondSpellSchema>
export class SplittermondSpellData extends SplittermondDataModel<SplittermondSpellType>{
    static defineSchema = SplittermondSpellSchema;

    static fromSpellItem(spellItem:SplittermondSpellItem) {
        return new SplittermondSpellData((spellItem as unknown as {system:SplittermondSpellType}).system);
    }
}

type SplittermondSpellEnhancementType = keyof typeof splittermond.spellEnhancement;
function createDegreesOfSuccessOptions() {
    const schema: Partial<Record<SplittermondSpellEnhancementType, InstanceType<typeof fields.BooleanField>>> = {}
    for (const key in splittermond.spellEnhancement) {
        schema[key as SplittermondSpellEnhancementType] = new fields.BooleanField({required: true, blank: false, initial: false,nullable:false});
    }
    return schema;
}
