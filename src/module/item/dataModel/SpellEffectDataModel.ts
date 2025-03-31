import {DataModelSchemaType, fields, SplittermondDataModel} from "../../data/SplittermondDataModel";
import SplittermondItem from "../item";
import {getDescriptorFields, validatedBoolean} from "./commonFields";
import {migrateFrom0_12_11, migrateFrom0_12_13} from "./migrations";

function ItemSpellEffectDataModelSchema() {
    return {
        ...getDescriptorFields(),
        modifier: new fields.StringField({ required: true, nullable: true }),
        active: validatedBoolean()
    };
}

export type SpellEffectDataModelType = DataModelSchemaType<typeof ItemSpellEffectDataModelSchema>;

export class SpellEffectDataModel extends SplittermondDataModel<SpellEffectDataModelType, SplittermondItem> {
    static defineSchema = ItemSpellEffectDataModelSchema;

    static migrateData(source:unknown){
        source = migrateFrom0_12_11(source);
        source = migrateFrom0_12_13(source);
        return super.migrateData(source);
    }
}
