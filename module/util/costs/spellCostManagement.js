import {parseCostString} from "./costParser.js";

/**
 * @typedef {object} SpellCostReductionManagement
 * @property {SpellCostReductionManager} spellCostReduction
 * @property {SpellCostReductionManager} spellEnhancedCostReduction
 */
/**
 * @template {object} T
 * @param {T} data
 * @return {T & SpellCostReductionManagement}
 */
export function initializeSpellCostManagement(data) {
    data.spellCostReduction = new SpellCostReductionManager()
    data.spellEnhancedCostReduction = new SpellCostReductionManager()
    return data;
}

class SpellCostReductionManager {

    constructor() {
        this.modifiersMap = new SpellCostModifiers();
    }

    /** @return {SpellCostModifiers} */
    get modifiers() {
        return this.modifiersMap;
    }

    /**
     * @param {string} modifierLabel
     * @param {string} modifierValue
     * @param {?string|null} skill the skill of the item the modifier is attached to
     */
    addCostModifier(modifierLabel, modifierValue, skill) {
        let group = null;
        let type = null;
        let labelParts = modifierLabel.split(".");

        if (labelParts.length >= 2) {
            group = labelParts[1].trim().toLowerCase();
        }
        if (labelParts.length >= 3) {
            type = labelParts[2].trim().toLowerCase();
        }
        if (labelParts.length >= 4) {
            console.warn("The label " + modifierLabel + " is not a valid cost modifier label. Extraneous parts will be ignored.")
        }
        if (group == "${skill}"  && skill) {
            group = skill;
        }
        /*
        if (group === null && skill) {
            group = skill;
        }
        */

        this.modifiersMap.put(parseCostString(modifierValue).asModifier(), group, type);
    }

    /**
     * convenience method for adding retrieving a modifier without having to get the map first
     * @param skill {string}
     * @param type {string}
     * @return {CostModifier[]}
     */
    getCostModifiers(skill, type) {
        return this.modifiersMap.get(skill, type);
    }
}


class SpellCostModifiers {
    constructor() {
        /**@typedef {{spellType:string|null, skill:string|null}} Key*/
        /** @type {Map<Key, CostModifier[]>} */
        this.backingMap = new Map();
        /** @type {Map<string, Record<string|null,Key>>} */
        this.keyMap = new Map();
    }

    /**
     * @param {string|null} type the type of spell this cost modifier is for
     * @param {string|null} group the skill this spell selector for this cost modifier
     */
    get(group = null, type = null) {
        const formattedGroup = group ? group.toLowerCase().trim() : null;
        const formattedType = type ? type.toLowerCase().trim() : null;

        const groupAndTypeSpecificReductions = this.#internalGet(formattedGroup, formattedType)
        const groupSpecificReductions = formattedGroup ? this.#internalGet(null, formattedType) : [];
        const typeSpecificReductions = formattedType ? this.#internalGet(formattedGroup, null) : [];
        const globalReductions = formattedType && formattedGroup ? this.#internalGet(null, null) : [];
        return [
            ...groupAndTypeSpecificReductions,
            ...groupSpecificReductions,
            ...typeSpecificReductions,
            ...globalReductions
        ];
    }

    /** @returns CostModifier[] */
    #internalGet(group, type) {
        return this.backingMap.get(this.#getMapKey(group, type)) ?? [];
    }

    /**
     * @param {CostModifier} cost
     * @param {string|null} type the type of spell this cost modifier is for
     * @param {string|null} group the skill selector for this cost modifier
     */
    put(cost, group = null, type = null) {
        const mapKey = this.#getMapKey(group, type);
        if (this.backingMap.get(mapKey) === undefined) {
            this.backingMap.set(mapKey, []);
        }
        this.backingMap.get(mapKey).push(cost);
    }

    /**
     * JS compares objects by reference. This function ensures that the same object is used for the same key.
     * @return {Key}
     */
    #getMapKey(group, type) {
        if (this.keyMap.get(group) === undefined) {
            this.keyMap.set(group, {});
        }
        if (this.keyMap.get(group)[type] === undefined) {
            this.keyMap.get(group)[type] = {spellType: type, skill: group};
        }
        return this.keyMap.get(group)[type];
    }


}