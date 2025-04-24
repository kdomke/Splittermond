import { DataModelSchemaType, SplittermondDataModel } from "../../data/SplittermondDataModel";
import { fields } from "../../data/SplittermondDataModel";
import SplittermondNpcAttackItem from "../npcattack";
import {damage, getDescriptorFields} from "./commonFields";
import {ItemFeaturesModel} from "./features/ItemFeaturesModel";
import {migrateFrom0_12_20} from "./migrations";

function ItemNpcAttackDataModelSchema() {
    return {
        ...getDescriptorFields(),
        ...damage(),
        range: new fields.NumberField({ required: true, nullable: true, initial: 0 }),
        weaponSpeed: new fields.NumberField({ required: true, nullable: true, initial: 0 }),
        skillValue: new fields.NumberField({ required: true, nullable: true, initial: 0 }),
        features: new fields.EmbeddedDataField(ItemFeaturesModel,{required: true, nullable: false}),
    };
}

export type NpcAttackDataModelType = DataModelSchemaType<typeof ItemNpcAttackDataModelSchema>;

export class NpcAttackDataModel extends SplittermondDataModel<NpcAttackDataModelType, SplittermondNpcAttackItem> {
    static defineSchema = ItemNpcAttackDataModelSchema;

    static migrateData(source: unknown) {
        source = migrateFrom0_12_20(source);
        return super.migrateData(source);
    }
}
