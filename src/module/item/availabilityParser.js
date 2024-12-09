/**
 * This module transformes the internal representation of the availability of spells and masteries into a
 * localized string. It caches the generated parsers, because in production there is only one real set of
 * localizer and skills that is required. In testing, however, the localizer and skills can change between tests.
 */
let cachedSpellAvailabilityParser;
let cachedMasteryAvailabilityParser;

/**
 * Returns a cached instance of the spell availability parser or creates a new one if inputs don't match.
 * @param i18n
 * @param {string[]} masterySkills
 * @returns {MasteryAvailabilityParser}
 */
export function getMasteryAvailabilityParser(i18n, masterySkills) {
    if (!cachedMasteryAvailabilityParser || !cachedMasteryAvailabilityParser.isSame(i18n, masterySkills)){
        cachedMasteryAvailabilityParser = new MasteryAvailabilityParser(i18n, masterySkills);
    }
    return cachedMasteryAvailabilityParser;
}

/**
 * Returns a cached instance of the spell availability parser or creates a new one if inputs don't match.
 * @param i18n
 * @param {string[]}magicSkills
 * @returns {SpellAvailabilityParser}
 */
export function getSpellAvailabilityParser(i18n, magicSkills) {
    if (!cachedSpellAvailabilityParser || !cachedSpellAvailabilityParser.isSame(i18n, magicSkills)){
        cachedSpellAvailabilityParser = new SpellAvailabilityParser(i18n, magicSkills);
    }
    return cachedSpellAvailabilityParser;
}

/**
 * In a comma separated list of string this class translates entries of the form "magicSkill level" into either
 * the localized version of the magic skill or the internal representation, while preserving the rest of the string.
 */
class AvailabilityParser {

    /**
     * @param {{localize: (string)=>string}} i18n
     * @param {Iterable<any>} skills
     * @public
     */
    constructor(i18n, skills) {
        this._internalsAsKeys = new Map();
        this._translationsAsKeys = new Map();
        this.__skills = skills;
        this.__i18n = i18n;
        for (const skill of skills) {
            const translation = i18n.localize(`splittermond.skillLabel.${skill}`);
            this._translationsAsKeys.set(translation.toLowerCase(), skill);
            this._internalsAsKeys.set(skill, translation);
        }

        this.processString = function (availability, translationsMap) {
            const availabilityExists = availability && typeof availability === "string" && availability.trim() !== '';
            let transformed;
            if (availabilityExists) {
                transformed = availability.split(",")
                    .map(item => item.trim())
                    .filter(item => item !== "")
                    .map(item => this._translateSingleItem(item, translationsMap))
                    .join(", ");
            }
            return transformed ? transformed : availability;
        };
    }

    /**
     * @param {{localize: (string)=>string}} i18n
     * @param {Iterable<any>} skills
     */
    isSame(i18n, skills) {
        return this.__i18n === i18n && this.skills === skills;
    }


    /**
     * Transforms the internal string representation of the availabilties of the form "skill level, skill level"
     * into a localized string
     * @public
     * @param {?string} availability
     * @returns {string}
     */
    toDisplayRepresentation(availability) {
        return this.processString(availability, this._internalsAsKeys);
    }

    /**
     * Turns the internal representation of the availabilities into a localized string
     * @param {string} availability
     * @returns {string}
     */
    toInternalRepresentation(availability) {
        return this.processString(availability, this._translationsAsKeys);
    }

    /**
     * @protected
     * @param {string}availablityItem
     * @param {Map<string,string>}translationsMap
     * @returns {string}
     */
    _translateSingleItem(availablityItem, translationsMap) { throw new Error("Use derived class");
    }
}

class SpellAvailabilityParser extends AvailabilityParser {

    /**
     * @param {{localize: (string)=>string}} i18n
     * @param {Iterable<any>} magicSkills
     */
    constructor(i18n, magicSkills) {
        super(i18n, magicSkills);
    }

    /**
     * @protected
     * @param {string}availablityItem
     * @param {Map<string,string>}translationsMap
     * @returns {string}
     */
    _translateSingleItem(availablityItem, translationsMap) {
        if (this.isWellFormattedAvailability(availablityItem)) {
            const splitItem = availablityItem.trim().split(/[ :]/).filter(item=>!!item);
            const hasTranslation = translationsMap.get(splitItem[0].trim().toLowerCase());
            return `${hasTranslation ?? splitItem[0]} ${splitItem[1].trim()}`;
        } else {
            return availablityItem;
        }
    }

    /**
     * checks whether a single spell availability token is well formatted
     * @param {string}availability
     * @returns {boolean}
     */
    isWellFormattedAvailability(availability) {
        const splitItem = availability.trim().split(/[ :]/).filter(item=>!!item);
        return Array.isArray(splitItem) &&
            splitItem.length === 2 &&
            !isNaN(parseFloat(splitItem[1]));
    }
}

class MasteryAvailabilityParser extends AvailabilityParser {

    /**
     * @param {{localize: (string)=>string}} i18n
     * @param {Iterable<string>} masteries
     */
    constructor(i18n, masteries) {
        super(i18n, masteries);
    }

    /**
     * @protected
     * @param {string} availablityItem
     * @param {Map<string,string>} translationsMap
     * @returns {string}
     */
    _translateSingleItem(availablityItem, translationsMap) {
        const hasTranslation = translationsMap.get(availablityItem.trim().toLowerCase());
        return hasTranslation ?? availablityItem;
    }
}
