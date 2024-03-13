import {SplittermondSpellRollMessage} from "./SplittermondSpellRollMessage.js";
import {chatFeatureApi} from "../chatActionGameApi.js";
import {splittermond} from "../../../config.js";
import {RollResultRenderer} from "../RollResultRenderer.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.js";

/**
 * @extends {SplittermondDataModel<SplittermondSpellRollMessageRenderer, SplittermondSpellRollMessage>}
 * @property {CheckReport} checkReport
 * @property {string} messageTitle
 * @property {string} spellDescription
 */
export class SplittermondSpellRollMessageRenderer extends SplittermondDataModel{

    static defineSchema() {
        return {
            checkReport: new fields.ObjectField({required: true, blank: false, nullable: false}),
            messageTitle: new fields.StringField({required: true, blank: false, nullable: false}),
            spellDescription: new fields.StringField({required: true, blank: true, nullable: true}),
        }
    }

    constructor(...props) {
        super(...props);

        if (!this.parent || !this.parent instanceof SplittermondSpellRollMessage) {
            throw new Error(`This class is intended exclusively as child of SplittermondSpellRollMessage`)
        }
    }

    get template() {
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
     * @return {SpellDegreessOfSuccessRenderedData}
     */
    renderData() {
        return {
            rollResultClass: getRollResultClass(this.checkReport),
            header: {
                title: this.messageTitle,
                rollTypeMessage: chatFeatureApi.localize(`splittermond.rollType.${this.checkReport.rollType}`),
                difficulty: this.checkReport.difficulty,
                hideDifficulty: this.checkReport.hideDifficulty
            },
            rollResult: new RollResultRenderer(this.spellDescription, this.checkReport).render(),
            degreeOfSuccessDisplay: {
                degreeOfSuccessMessage: getDegreeOfSuccessMessage(this.checkReport.degreeOfSuccess, this.checkReport.succeeded),
                totalDegreesOfSuccess: this.parent.degreeOfSuccessManager.totalDegreesOfSuccess,
                usedDegreesOfSuccess: this.parent.degreeOfSuccessManager.usedDegreesOfSuccess,
                openDegreesOfSuccess: this.parent.degreeOfSuccessManager.openDegreesOfSuccess,
            },
            degreeOfSuccessOptions: renderDegreeOfSuccessOptions(this.parent),
            actions: renderActions(this.parent),
        }
    }
}

/**
 * @param {number} degreeOfSuccess
 * @param {boolean} succeeded
 * @return {string}
 */
function getDegreeOfSuccessMessage(degreeOfSuccess,succeeded) {
    const messageType= `${succeeded ? "success" : "fail"}Message`;
    const messageExtremity = Math.min(Math.abs(degreeOfSuccess), 5);
    return chatFeatureApi.localize(`splittermond.${messageType}.${messageExtremity}`);
}

/**
 * @param {CheckReport} checkReport
 * @returns {"success"|""|"critical"|"fumble"}
 */
function getRollResultClass(checkReport) {
    const resultClasses = [];
    if (checkReport.isCrit) {
        resultClasses.push("critical");
    }
    if (checkReport.isFumble) {
        resultClasses.push("fumble");
    }
    if (checkReport.succeeded) {
        resultClasses.push("success");
    }
    return resultClasses.join(" ")
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
    const renderedOptionsAreEmpty =  Object.keys(renderedOptions).length === 0;
    return renderedOptionsAreEmpty ? null : renderedOptions;
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
        text: `${spellRollMessage.spellReference.getItem().enhancementCosts}: ${spellRollMessage.spellReference.getItem().enhancementDescription}`
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
    const applyDamageRender = renderApplyDamage(spellRollMessage);
    const advanceTokenRender = renderAdvanceToken(spellRollMessage);
    const consumeCostsRender = renderConsumeCosts(spellRollMessage);
    const useSplinterpointRender = renderUseSplinterpoint(spellRollMessage);
    const rollFumbleRender = renderRollFumble(spellRollMessage);
    const activeDefenseRender = renderActiveDefense(spellRollMessage);
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
    if (rollFumbleRender){
        renderedOptions["rollFumble"] = rollFumbleRender;
    }
    if(activeDefenseRender){
        renderedOptions["activeDefense"] = activeDefenseRender;
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

function renderRollFumble(spellRollMessage) {
    if(!spellRollMessage.actionManager.magicFumble.available){
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.magicFumble.used
    };
}

function renderActiveDefense(spellRollMessage){
    if(!spellRollMessage.actionManager.activeDefense.available){
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.activeDefense.used,
        difficulty: spellRollMessage.actionManager.activeDefense.itemReference.getItem().difficulty
    };

}
