import {produceSpellTags} from "../../item/tags/spellTags.js";
import {initializeMetadata} from "./metadataInitializer.js";

/**
 *
 * @param spellAvailabilityParser
 * @returns {typeof prepareSpellItemIndex}
 */
export function initializeSpellItemPreparation(spellAvailabilityParser) {
    return prepareSpellItemIndex;

    /**
     * @param {CompendiumMetadata} compendiumMetadata
     * @param {ItemIndexEntity} itemIndexEntity
     * @returns {ItemIndexEntity}
     */
    function prepareSpellItemIndex(compendiumMetadata, itemIndexEntity) {
        if (!isDisplayableSpell(itemIndexEntity)) {
            throw new Error(`Item '${itemIndexEntity.name}' is not a spell`);
        }
        delete itemIndexEntity.system.features;
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
    function initializeTagGenerator(item) {
        const property = "availableInList";
        if (!(property in item)) {
            Object.defineProperty(item,
                property,
                {
                    get: function () {
                        return produceSpellTags(this.system, spellAvailabilityParser);
                    }

                });
        }
    }
}