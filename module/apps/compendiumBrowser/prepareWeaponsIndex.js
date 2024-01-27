import {produceAttackableItemTags} from "../../item/tags/attackableItemTags.js";
import {initializeMetadata} from "./metadataInitializer.js";

/**
 * @param {CompendiumMetadata} compendiumMetadata
 * @param {ItemIndexEntity} itemIndexEntity
 * @returns {ItemIndexEntity}
 */
export function prepareWeaponItemIndex(compendiumMetadata, itemIndexEntity) {
    if(!isDisplayableWeapon(itemIndexEntity)){
        throw new Error(`Item '${itemIndexEntity.name}' is not a weapon`);
    }
    initializeTagGenerator(itemIndexEntity);
    delete itemIndexEntity.system.skill;
    delete itemIndexEntity.system.skillLevel;
    return initializeMetadata(compendiumMetadata, itemIndexEntity);
}

/**
 * @param {ItemIndexEntity} itemIndexEntity
 * @returns {boolean}
 */
function isDisplayableWeapon(itemIndexEntity) {
    return itemIndexEntity.type === "weapon" && typeof itemIndexEntity.system === "object" &&
        itemIndexEntity.system.features !== undefined;
}

/**
 * @param {ItemIndexEntity} item
 */
function initializeTagGenerator(item){
    const property = "featureList";
    if(!(property in item)) {
        Object.defineProperty(item,
            property,
            {
                get: function () {
                    return produceAttackableItemTags(this.system);
                }

            });
    }
}