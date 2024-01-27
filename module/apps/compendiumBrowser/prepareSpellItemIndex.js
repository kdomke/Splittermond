import {produceSpellTags} from "../../item/availability/spellTags.js";
import {getSpellAvailabilityParser} from "../../item/availability/availabilityParser.js";
import {initializeMetadata} from "./metadataInitializer.js";

/**
 * @param {CompendiumMetadata} compendiumMetadata
 * @param {ItemIndexEntity} itemIndexEntity
 * @returns {ItemIndexEntity}
 */
export function prepareSpellItemIndex(compendiumMetadata, itemIndexEntity) {
    if(!isDisplayableSpell(itemIndexEntity)){
        throw new Error(`Item '${itemIndexEntity.name}' is not a spell`);
    }
    initializeTagGenerator(itemIndexEntity);
    return initializeMetadata(compendiumMetadata, itemIndexEntity);
}

/**
 * @param {ItemIndexEntity} itemIndexEntity
 * @returns {boolean}
 */
function isDisplayableSpell(itemIndexEntity) {
    return itemIndexEntity.type === "spell" && typeof itemIndexEntity.system === "object" &&
        itemIndexEntity.system.skill !== undefined &&
        itemIndexEntity.system.skillLevel !== undefined &&
        itemIndexEntity.system.availableIn !== undefined;
}

/**
 * @param {ItemIndexEntity} item
 */
function initializeTagGenerator(item){
    const property = "availableInList";
    if(!(property in item)) {
        Object.defineProperty(item,
            property,
            {
                get: function () {
                    return produceSpellTags(this.system, getSpellAvailabilityParser(game.i18n, CONFIG.splittermond.skillGroups.magic));
                }

    });
    }
}
