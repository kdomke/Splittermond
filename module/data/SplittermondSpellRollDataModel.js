import {splittermond} from "../config.js";

const fields = foundry.data.fields;

export class SplittermondSpellRollDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            //spell: fields.ObjectField({required: true, blank: false}), //also has caster
            //target: fields.ObjectField({required: true, blank: false}), //actor
            constructorKey: new fields.StringField({required: true, trim:true, blank: false}),
            totalDegreesOfSuccess: new fields.NumberField({required: true, blank: false}),
            openDegreesOfSuccess: new fields.NumberField({required: true, blank: false}),
            degreeOfSuccessOptions: new fields.SchemaField(createDegreesOfSuccessOptions(), {
                required: true,
                blank: false
            }),
        }
    }

    get usedDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.openDegreesOfSuccess;
    }
}

function createDegreesOfSuccessOptions() {
    const schema = {}
    for (const key in splittermond.spellDegreesOfSuccessOptions) {
        schema[key] = new fields.BooleanField({required: true, blank: false})
    }
    return schema;
}
