import {SplittermondSpellRollMessage} from "./SplittermondSpellRollMessage.js";
import {chatFeatureApi} from "../chatActionGameApi.js";
import {splittermond} from "../../../config.js";

export const spellMessageRenderer = new class SplittermondSpellRollMessageRenderer {

    /**
     * @typedef SpellDegreessOfSuccessRenderedData
     * @type object
     * @property {string} id
     * @property {string} text
     * @property {string} action
     * @property {string} checked
     * @property {string} disabled
     */

    /**
     * @typedef SplittermondSpellRollMessageRenderedData
     * @type object
     * @property {string} title
     * @property {string} rollResultClass
     * @property {number} totalDegreesOfSuccess
     * @property {number} openDegreesOfSuccess
     * @property {Partial<Record<SpellDegreesOfSuccessOptions,SpellDegreessOfSuccessRenderedData>>} degreeOfSuccessOptions
     */
    /**
     * @param {SplittermondSpellRollMessage} spellRollMessage
     * @return {SpellDegreessOfSuccessRenderedData}
     */
    renderData(spellRollMessage) {
        return {
            title: "Spell Roll",
            rollResultClass: "success",
            totalDegreesOfSuccess: spellRollMessage.totalDegreesOfSuccess,
            openDegreesOfSuccess: spellRollMessage.openDegreesOfSuccess,
            degreeOfSuccessOptions: renderDegreeOfSuccessOptions(spellRollMessage),
        }
    }
}

/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @return {Partial<Record<SpellDegreesOfSuccessOptions,SpellDegreessOfSuccessRenderedData>>}
 */
function renderDegreeOfSuccessOptions(spellRollMessage) {
    const renderedOptions = {};
    for (const key in splittermond.spellEnhancement) {
        const renderedOption = renderDegreeOfSuccessOption(spellRollMessage, key);
        if (renderedOption) {
            renderedOptions[key] = renderedOption;
        }
    }
    return renderedOptions;
}

/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @param {SpellDegreesOfSuccessOptions} key
 */
function renderDegreeOfSuccessOption(spellRollMessage, key) {
    const actionName = `${key}Update`
    const degreeOfSuccessOptionConfig = splittermond.spellEnhancement[key];
    if(!hasAction(spellRollMessage, actionName) ) {
        console.warn(`SpellRollMessage has no action ${actionName}, will not render option for ${key}!`)
        return null;
    }
    if(spellRollMessage.totalDegreesOfSuccess < degreeOfSuccessOptionConfig.degreesOfSuccess) {
        console.debug(`SpellRollMessage has not enough degrees of success for ${key}, will not render option for ${key}!`)
        return null;
    }
    return {
        id: `${key}-${new Date().getTime()}`,
        text: `${degreeOfSuccessOptionConfig.degreesOfSuccess} EG ${chatFeatureApi.localize(degreeOfSuccessOptionConfig.textTemplate)}`,
        action: actionName,
        checked: spellRollMessage.degreeOfSuccessOptionIsChecked(key),
        disabled: !spellRollMessage.degreeOfSuccessOptionIsCheckable(key)
    }
}

/**
 * @param {object} object
 * @param {string} action
 * @return {boolean}
 */
function hasAction(object, action) {
    return (action in object || action in Object.getPrototypeOf(object)) && typeof object[action] === "function";
}

