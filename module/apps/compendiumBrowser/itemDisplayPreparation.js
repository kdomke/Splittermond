import {prepareSpellItemIndex} from "./prepareSpellItemIndex.js";
import {prepareMasteryItemIndex} from "./prepareMasteryItemIndex.js";
import {initializeMetadata} from "./metadataInitializer.js";
import {prepareWeaponItemIndex} from "./prepareWeaponsIndex.js";

/**
 * @typedef {{id:string, label:string}} CompendiumMetadata
 * @typedef {{type:string, folder:string, img:string, name:string, sort:number, uuid:string, _id:string, system:{availableIn:string, skill:string, skillLevel:number}}} ItemIndexEntity
 * @param {CompendiumMetadata} metadata
 * @param {Promise<ItemIndexEntity[]>} index
 * @param {object} data
 * @returns {Promise<void>}
 */
export function produceDisplayableItems(metadata, index, data) {
    return index.then(/**@param {ItemIndexEntity[]} itemIndexEntities*/( itemIndexEntities) => {
        for (const itemIndex of itemIndexEntities) {
            if( !["spell", "mastery", "weapon"].includes(itemIndex.type)){
                continue;
            }
            data = initializeItemType(itemIndex.type, data);
            data[itemIndex.type].push(getTransformer(itemIndex.type)(metadata, itemIndex));
        }
    });
}

/**
 * @template T
 * @param {string} itemType
 * @param {T} data
 * @returns {T & {[typeof itemType]:[]}}
 */
function initializeItemType(itemType, data) {
    if (data[itemType] === undefined) {
        data[itemType] = [];
    }
    return data;
}

/**
 * @typedef {(metadata: CompendiumMetadata, item: ItemIndexEntity) => ItemIndexEntity & CompendiumMetadata & {[x:string]:string[]}} SplittermondItemTransformer
 * @param {"spell"|"itemType"} itemType
 * @returns {SplittermondItemTransformer}
 */
function getTransformer(itemType){
    switch(itemType){
        case "spell":
            return prepareSpellItemIndex;
        case "mastery":
            return prepareMasteryItemIndex;
        case "weapon":
            return prepareWeaponItemIndex;
        default:
            return initializeMetadata;
    }
}
