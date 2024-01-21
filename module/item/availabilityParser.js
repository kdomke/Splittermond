/**
 * @type AvailabilityParser
 */
let singletonSpellAvailabilityParser;

/**
 * Returns the singleton instance of the spell availability parser or creates it if it does not exist.
 * @param i18n
 * @param {string[]}magicSkills
 * @returns {AvailabilityParser}
 */
export function getSpellAvailabilityParser(i18n, magicSkills) {
    if (!singletonSpellAvailabilityParser) {
        singletonSpellAvailabilityParser = new AvailabilityParser(i18n, magicSkills);
    }
    return singletonSpellAvailabilityParser;
}

/**
 * used for testing
 * @param i18n
 * @param {string[]}magicSkills
 * @returns {AvailabilityParser}
 */
export function newSpellAvailabilityParser(i18n, magicSkills){
    singletonSpellAvailabilityParser = null;
    return getSpellAvailabilityParser(i18n, magicSkills);
}


/**
 * In a comma separated list of string this class translates entries of the form "magicSkill level" into either
 * the localized version of the magic skill or the internal representation, while preserving the rest of the string.
 */
class AvailabilityParser {
    /**
     * @param {{localize: (string)=>string}} i18n
     * @param {Iterable<any>} magicSkills
     * @private
     */
    constructor(i18n, magicSkills) {
        this._internalsAsKeys = new Map();
        this._translationsAsKeys = new Map();
        for (const skill of magicSkills) {
            const translation = i18n.localize(`splittermond.skillLabel.${skill}`)
            this._translationsAsKeys.set(translation.toLowerCase(), skill);
            this._internalsAsKeys.set(skill, translation);
        }
    }


    /**
     * Transforms the internal string representation of the availabilties of the form "skill level, skill level"
     * into a localized string
     * @public
     * @param {?string} availability
     * @returns {string}
     */
    toDisplayRepresentation(availability) {
        return this.#processString(availability, this._internalsAsKeys);
    }

    /**
     * transforms a single availability token of the form "skill level", into the display representation
     * @public
     * @param {string|string[]} singleAvailability
     * @returns {string[]}
     */
    parseInternalToken(singleAvailability){
        const splitToken = typeof singleAvailability === "string" ? singleAvailability.split(" "): singleAvailability;
        return this.#translateSingleItem(splitToken, this._internalsAsKeys);
    }

    /**
     * Turns the internal representation of the availabilities into a localized string
     * @param {string} availability
     * @returns {string}
     */
    toInternalRepresentation(availability) {
        return this.#processString(availability, this._translationsAsKeys);
    }

    /**
     * transforms a single availability token of the form "skill level", into the internal representation
     * @public
     * @param {string|string[]} singleAvailability
     * @returns {string[]}
     */
    parseDisplayToken(singleAvailability){
        const splitToken = typeof singleAvailability === "string" ? singleAvailability.split(" "): singleAvailability;
        return this.#translateSingleItem(singleAvailability, this._internalsAsKeys);
    }

    /**
     * @param {string} availability
     * @param {Map<string,string>} translationsMap
     * @returns {string[]}
     */
    #processString(availability, translationsMap) {
        const availabilityExists = availability && typeof availability == "string" && availability.trim() !== '';
        let transformed;
        if (availabilityExists) {
            transformed = availability.split(",")
                .map(item => item.trim().split(/[ :]/))
                .map(item => this.#translateSingleItem(item, translationsMap))
                .map(item => item.join(" "))
                .join(", ")
        }
        return transformed ? transformed : availability;
    }

    /**
     * @param {string | string[2]}availablityItem
     * @param {Map<string,string>}translationsMap
     * @returns {string[]}
     */
    #translateSingleItem(availablityItem, translationsMap){
        const isWellFormattedAvailability = Array.isArray(availablityItem) && availablityItem.length === 2
        if(isWellFormattedAvailability) {
            const hasTranslation  =translationsMap.get(availablityItem[0].trim().toLowerCase())
            return [hasTranslation ?? availablityItem[0], availablityItem[1].trim()];
        } else
            return [availablityItem];
    }
}
