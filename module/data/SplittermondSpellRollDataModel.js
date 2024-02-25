import {splittermond} from "../config.js";

const fields = foundry.data.fields;

export class SplittermondSpellRollDataModel extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            //spell: fields.ObjectField({required: true, blank: false}), //also has caster
            //target: fields.ObjectField({required: true, blank: false}), //actor
            constructorKey: new fields.StringField({required: true, trim:true, blank: false, nullable:false}),
            totalDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable:false}),
            openDegreesOfSuccess: new fields.NumberField({required: true, blank: false, initial:0, nullable:false}),
            degreeOfSuccessOptions: new fields.SchemaField(createDegreesOfSuccessOptions(), {
                required: true,
                blank: false
            }),
        }
    }

    constructor(data) {
        super({degreeOfSuccessOptions: initializeDegreeOfSuccessOptions(),...data});

    }


    get usedDegreesOfSuccess() {
        return this.totalDegreesOfSuccess - this.openDegreesOfSuccess;
    }
}

/**
 * @return {Record<SpellDegreesOfSuccessOptions, SplittermondSpellRollDegreeOfSuccessOptionState>}
 */
function initializeDegreeOfSuccessOptions() {
    const degreeOfSuccessOptions={};
    for (const key in splittermond.spellEnhancement) {
        degreeOfSuccessOptions[key] = {
           checked: false,
           disabled: false,
        };
    }
    return degreeOfSuccessOptions;

}

function createDegreesOfSuccessOptions() {
    const schema = {}
    for (const key in splittermond.spellEnhancement) {
        schema[key] = new fields.SchemaField ({
            checked: new fields.BooleanField({required: true, blank: false, initial: false,nullable:false}),
            disabled: new fields.BooleanField({required: true, blank: false, initial: false,nullable:false})
        }, {required: true, blank: false});
    }
    return schema;
}
