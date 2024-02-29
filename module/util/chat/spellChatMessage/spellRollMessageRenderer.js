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
            title: spellRollMessage.messageTitle,
            rollResultClass: "success",
            totalDegreesOfSuccess: spellRollMessage.degreeOfSuccessManager.totalDegreesOfSuccess,
            usedDegreesOfSuccess: spellRollMessage.degreeOfSuccessManager.usedDegreesOfSuccess,
            openDegreesOfSuccess: spellRollMessage.degreeOfSuccessManager.openDegreesOfSuccess,
            degreeOfSuccessOptions: renderDegreeOfSuccessOptions(spellRollMessage),
            actions: renderActions(spellRollMessage),
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
    if (!hasAction(spellRollMessage, actionName)) {
        console.warn(`SpellRollMessage has no action ${actionName}, will not render option for ${key}!`)
        return null;
    }
    if (!spellRollMessage.degreeOfSuccessManager.isAvailable(key)) {
        return null;
    }
    return {
        id: `${key}-${new Date().getTime()}`,
        text: `${degreeOfSuccessOptionConfig.degreesOfSuccess} EG ${chatFeatureApi.localize(degreeOfSuccessOptionConfig.textTemplate)}`,
        action: actionName,
        checked: spellRollMessage.degreeOfSuccessManager.isChecked(key),
        disabled: !spellRollMessage.degreeOfSuccessManager.isCheckable(key)
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

/** @param {SplittermondSpellRollMessage} spellRollMessage */
function renderActions(spellRollMessage) {
    const renderedOptions = {};
    const actions = ["applyDamage", "advanceToken", "consumeCosts", "useSplinterpoint"]
    const applyDamageRender = renderApplyDamage(spellRollMessage)
    const advanceTokenRender = renderAdvanceToken(spellRollMessage)
    const consumeCostsRender = renderConsumeCosts(spellRollMessage)
    const useSplinterpointRender = renderUseSplinterpoint(spellRollMessage)
    if (applyDamageRender) {
        renderedOptions["applyDamage"] = applyDamageRender;
    }
    if (advanceTokenRender) {
        renderedOptions["advanceToken"] = advanceTokenRender;
    }
    if (consumeCostsRender) {
        renderedOptions["consumeCosts"] = consumeCostsRender;
    }
    if (useSplinterpointRender) {
        renderedOptions["useSplinterpoint"] = useSplinterpointRender;
    }
    return renderedOptions;
}

/** @param {SplittermondSpellRollMessage} spellRollMessage */
function renderApplyDamage(spellRollMessage) {
    if (!spellRollMessage.actionManager.damage.available) {
        return null;
    }
    return {
        value: spellRollMessage.actionManager.damage.cost,
        disabled: spellRollMessage.actionManager.damage.used,
    };
}

function renderAdvanceToken(spellRollMessage) {
    return {
        value: spellRollMessage.actionManager.ticks.cost,
        disabled: spellRollMessage.actionManager.ticks.used,
    }
}

function renderConsumeCosts(spellRollMessage) {
    return {
        value: spellRollMessage.actionManager.focus.cost,
        disabled: spellRollMessage.actionManager.focus.used,
    }
}

function renderUseSplinterpoint(spellRollMessage) {
    if (!spellRollMessage.actionManager.splinterPoint.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.splinterPoint.used,
    }
}
