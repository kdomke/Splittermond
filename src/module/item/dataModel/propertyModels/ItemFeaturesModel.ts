import {DataModelSchemaType, fieldExtensions, fields, SplittermondDataModel} from "module/data/SplittermondDataModel";
import SplittermondItem from "module/item/item";
import {ItemFeature, itemFeatures} from "../../../config/itemFeatures";
import {splittermond} from "../../../config";
import {DataModelConstructorInput} from "../../../api/DataModel";
import {foundryApi} from "../../../api/foundryApi";


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


    hasFeature(feature: ItemFeature) {
        return this.featureList.some(f => f.name === feature && f.value > 0);
    }

    get featureList() {
        return this.internalFeatureList
    }

    featuresAsStringList() {
        return this.featureList.map(f => f.toString())
    }

    /**
     * Returns a string representation of the features suitable for display.
     */
    get features() {
        return this.featureList.map(feature => `${feature}`).join(", ");
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
            required: true,
            nullable: false,
            validate: (x: number) => x > 0
        }),
    }
}

export type ItemFeatureType = DataModelSchemaType<typeof FeatureSchema>;

export class ItemFeatureDataModel extends SplittermondDataModel<ItemFeatureType, SplittermondItem> {
    static defineSchema = FeatureSchema;

    toString() {
        if (this.value === 1) {
            return this.name;
        } else {
            return `${this.name} ${this.value}`;
        }
    }
}

export function parseFeatures(features: string): DataModelConstructorInput<ItemFeatureType>[] {
    if (!features) {
        return [];
    }
    const featureList = features.split(",").map((f) => f.trim());
    const parsedFeatures: DataModelConstructorInput<ItemFeatureType>[] = [];
    for (const feature of featureList) {
        const name = parseName(feature);
        const value = parseValue(feature);
        if(!name || !value){
            continue;
        }
        parsedFeatures.push({name, value});
    }
    return parsedFeatures;
}

function parseName(feature: string) {
    const name = /^\S+(?=\s+|$)/.exec(feature)?.[0] ?? feature; //we should never actually hit the right hand side, but TS cannot know that.
    const matched = normalizeName(name);
    if (!splittermond.itemFeatures.includes(matched as ItemFeature)) {
        foundryApi.warnUser("splittermond.message.featureParsingFailure",{feature})
        return null;
    }
    return matched as ItemFeature;
}

function parseValue(feature: string) {
    const valueString = /(?<=\s+)\S+$/.exec(feature)?.[0] ?? "1"; //A feature that does not need a scale gets a scale of one.
    const value = parseInt(valueString);
    if (isNaN(value)) {
        foundryApi.warnUser("splittermond.message.featureParsingFailure", {feature})
        return null
    }
    return value;
}


function normalizeName(name: string) {
    return splittermond.itemFeatures.find(f => f.toLowerCase() == name.trim().toLowerCase()) ?? name;
}