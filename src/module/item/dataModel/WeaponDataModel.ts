import {DataModelSchemaType, fields, SplittermondDataModel} from "../../data/SplittermondDataModel";
import SplittermondWeaponItem from "../weapon";
import {damage, getDescriptorFields, getPhysicalProperties, validatedBoolean} from "./commonFields";
import {migrateFrom0_12_11, migrateFrom0_12_13, migrateFrom0_12_20} from "./migrations";
import {ItemFeaturesModel, parseFeatures} from "./features/ItemFeaturesModel";

function ItemWeaponDataModelSchema() {
    return {
        ...getDescriptorFields(),
        ...getPhysicalProperties(),
        modifier: new fields.StringField({required: true, nullable: true}),
        ...damage(),
        range: new fields.NumberField({required: true, nullable: true, initial: 0}),
        weaponSpeed: new fields.NumberField({required: true, nullable: true, initial: 0}),
        skill: new fields.StringField({required: true, nullable: false}),
        skillMod: new fields.NumberField({required: true, nullable: false, initial: 0}),
        features: new fields.EmbeddedDataField(ItemFeaturesModel,{required: true, nullable: false}),
        attribute1: new fields.StringField({required: true, nullable: false}),
        attribute2: new fields.StringField({required: true, nullable: false}),
        minAttributes: new fields.StringField({required: true, nullable: false}),
        prepared: validatedBoolean(),
        equipped: validatedBoolean(),
        secondaryAttack: new fields.SchemaField({
            skill: new fields.StringField({required: true, nullable: true, initial: "none"}),
            skillMod: new fields.NumberField({required: true, nullable: true, initial: 0}),
            attribute1: new fields.StringField({required: true, nullable: true}),
            attribute2: new fields.StringField({required: true, nullable: true}),
            ...damage(),
            range: new fields.NumberField({required: true, nullable: true, initial: 0}),
            weaponSpeed: new fields.NumberField({required: true, nullable: true, initial: 0}),
            minAttributes: new fields.StringField({required: true, nullable: true}),
            features: new fields.StringField({required: true, nullable: true}),
        }, {required: false, nullable: false}),
    };
}

export type WeaponDataModelType = DataModelSchemaType<typeof ItemWeaponDataModelSchema>

export class WeaponDataModel extends SplittermondDataModel<WeaponDataModelType, SplittermondWeaponItem> {
    static defineSchema = ItemWeaponDataModelSchema;

    static migrateData(source:unknown){
        source = migrateFrom0_12_11(source);
        source = migrateFrom0_12_13(source);
        source = migrateFrom0_12_20(source);
        source = migrateFeatures(source);
        return super.migrateData(source);
    }


}
function migrateFeatures(source:unknown) {
    if (source && typeof source === "object" && "features" in source && typeof source["features"] === "string") {
        const features = source["features"];
        source["features"] = {
            features: features
        }
    }
    if (source && typeof source === "object" && "features" in source && typeof source["features"] === "object") {
        if (source.features && "features" in source["features"] && typeof source["features"]["features"] === "string") {
            const features = source["features"]["features"];
            source["features"] = {
                internalFeatureList: parseFeatures(features)
            }
        }
    }
   return source;
}
