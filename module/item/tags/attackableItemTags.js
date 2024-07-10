/**
 * Renders the features of an attackable item as tags.
 * @param {{features:string}} system
 * @returns {string[]}
 */
export function produceAttackableItemTags(system) {
    if (typeof system.features !== "string") return [];
    if (system.features.trim() === "" || system.features.trim() === "-") return [];
    return system.features?.split(",").map(str => str.trim());
}