import {DataModelSchemaType, fieldExtensions, fields, SplittermondDataModel} from "module/data/SplittermondDataModel";
import SplittermondItem from "module/item/item";
import {ItemFeature, itemFeatures} from "../../../config/itemFeatures";
import {splittermond} from "../../../config";
import {DataModelConstructorInput} from "../../../api/DataModel";


function FeaturesSchema() {
    return {
        internalFeatureList: new fields.ArrayField(
            new fields.EmbeddedDataField(ItemFeatureDataModel, {required: true, nullable: false}),
            {required: true, nullable: false, initial: []}
        )
    };
}

export type ItemFeaturesType = DataModelSchemaType<typeof FeaturesSchema>;

export class ItemFeaturesModel extends SplittermondDataModel<ItemFeaturesType, SplittermondItem> {
    static defineSchema = FeaturesSchema;

    /**
     * Returns a string representation of the features suitable for display.
     */
    get features() {
        return this.featureList.map(feature => `${feature}`).join(", ");
    }


    hasFeature(feature: ItemFeature) {
        return this.internalFeatureList.some(f => f.name === feature);
    }

    get featureList(){
        return this.internalFeatureList
    }



}


function FeatureSchema() {
    return {
        name: new fieldExtensions.StringEnumField({
            required: true,
            nullable: false,
            validate: (x: ItemFeature) => itemFeatures.includes(x)
        }),
        value: new fields.NumberField({
            required: false,
            nullable: true,
            validate: (x: number) => x > 0
        }),
    }
}

export type ItemFeatureType = DataModelSchemaType<typeof FeatureSchema>;

export class ItemFeatureDataModel extends SplittermondDataModel<ItemFeatureType, SplittermondItem> {
    static defineSchema = FeatureSchema;

    toString() {
        if (this.value === undefined || this.value === null) {
            return this.name;
        } else {
            return `${this.name} ${this.value}`;
        }
    }
}

export function parseFeatures(features: string): DataModelConstructorInput<ItemFeatureType>[] {
    const featureList = features.split(",").map((f) => f.trim());
    const parsedFeatures: DataModelConstructorInput<ItemFeatureType>[] = [];
    for (const feature of featureList) {
        const [name, value] = feature.split(" ");

        parsedFeatures.push({
            name: normalizeName(name) as ItemFeature/*we cannot guarantee this, but we have a validation function in the constructor*/,
            ...(value ? {value: parseInt(value.trim())} : {})
        });
    }
    return parsedFeatures;
}

function normalizeName(name: string) {
    return splittermond.itemFeatures.find(f => f.toLowerCase() == name.trim().toLowerCase()) ?? name;
}