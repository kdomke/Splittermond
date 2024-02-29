import {SplittermondSpellRollMessage} from "./SplittermondSpellRollMessage.js";
import {chatFeatureApi} from "../chatActionGameApi.js";
import {splittermond} from "../../../config.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SplittermondSpellRollMessageRenderer, SplittermondSpellRollMessage>}
 * @
 */
export class SplittermondSpellRollMessageRenderer extends foundry.abstract.DataModel{

    static defineSchema() {
        return {
           checkReport: new fields.ObjectField({required:true, blank:false, nullable:false})
        }
    }

    constructor(...props) {
        super(...props);

        if (! this.parent instanceof SplittermondSpellRollMessage){
            throw new Error(`This class is intended exclusively as child of SplittermondSpellRollMessage`)
        }
    }
    get template(){
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }


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
     * @property {number} usedDegreesOfSuccess
     * @property {number} openDegreesOfSuccess
     * @property {Partial<Record<ManagedSpellOptions,SpellDegreessOfSuccessRenderedData>>} degreeOfSuccessOptions
     * @property {object} actions
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
    {
        const key = "spellEnhancement"
        const spellEnhancement = renderSpellEnhancementOption(spellRollMessage, key);
        if (spellEnhancement) {
            renderedOptions[key] = spellEnhancement;
        }
    }
    return renderedOptions;
}

/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @param {Exclude<ManagedSpellOptions, SpellDegreesOfSuccessOptions>} key
 */
function renderSpellEnhancementOption(spellRollMessage,key) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(spellRollMessage, key);
    if (!commonConfig) {
        return null;
    }
    return {
        ...commonConfig,
        text: `${spellRollMessage.spellEnhancementCosts}: ${spellRollMessage.spellEnhancementDescription}`
    };
}

/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @param {ManagedSpellOptions} key
 */
function renderDegreeOfSuccessOption(spellRollMessage, key) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(spellRollMessage, key)
    if (!commonConfig) {
        return null;
    }
    const degreeOfSuccessOptionConfig = splittermond.spellEnhancement[key];
    return {
        ...commonConfig,
        text: `${degreeOfSuccessOptionConfig.degreesOfSuccess} EG ${chatFeatureApi.localize(degreeOfSuccessOptionConfig.textTemplate)}`,
    };
}

/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @param {ManagedSpellOptions} key
 */
function commonRenderDegreeOfSuccessOptions(spellRollMessage, key) {
    const actionName = `${key}Update`
    if (!hasAction(spellRollMessage, actionName)) {
        console.warn(`SpellRollMessage has no action ${actionName}, will not render option for ${key}!`)
        return null;
    }
    if (!spellRollMessage.degreeOfSuccessManager.isAvailable(key)) {
        return null;
    }
    return {
        id: `${key}-${new Date().getTime()}`,
        action: actionName,
        checked: spellRollMessage.degreeOfSuccessManager.isChecked(key),
        disabled: !spellRollMessage.degreeOfSuccessManager.isCheckable(key)
    };
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
