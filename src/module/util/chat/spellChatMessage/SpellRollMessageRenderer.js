import {SplittermondSpellRollMessage} from "./SplittermondSpellRollMessage.js";
import {foundryApi} from "../../../api/foundryApi.js";
import {splittermond} from "../../../config.js";
import {RollResultRenderer} from "../RollResultRenderer.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.js";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference.js";
import {ItemReference} from "../../../data/references/ItemReference.js";
import {parseCostString} from "../../costs/costParser.js";

/**
 * @extends {SplittermondDataModel<SplittermondSpellRollMessageRenderer, SplittermondSpellRollMessage>}
 * @property {OnAncestorReference<CheckReport>} checkReportReference
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 */
export class SplittermondSpellRollMessageRenderer extends SplittermondDataModel {

    static defineSchema() {
        return {
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {
                required: true,
                blank: false,
                nullable: false
            }),
            spellReference: new fields.EmbeddedDataField(ItemReference, {
                required: true,
                blank: false,
                nullable: false
            }),
            checkReport: new fields.ObjectField({required: true, blank: false, nullable: false}),
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
     * @property {string} multiplicity
     */

    /**
     * @typedef SplittermondSpellRollMessageRenderedData
     * @type object
     * @property {string} title
     * @property {string} rollResultClass
     * @property {number} totalDegreesOfSuccess
     * @property {number} usedDegreesOfSuccess
     * @property {number} openDegreesOfSuccess
     * @property {SpellDegreessOfSuccessRenderedData[]} degreeOfSuccessOptions
     * @property {object} actions
     */
    /**
     * @return {SplittermondSpellRollMessageRenderedData}
     */
    renderData() {
        const checkReport = this.checkReportReference.get();
        const spell = this.spellReference.getItem();
        return {
            rollResultClass: getRollResultClass(checkReport),
            header: {
                title: spell.name,
                rollTypeMessage: foundryApi.localize(`splittermond.rollType.${checkReport.rollType}`),
                difficulty: this.createDifficulty(),
                hideDifficulty: checkReport.hideDifficulty
            },
            rollResult: new RollResultRenderer(spell.description, checkReport).render(),
            degreeOfSuccessDisplay: {
                degreeOfSuccessMessage: getDegreeOfSuccessMessage(checkReport.degreeOfSuccess, checkReport.succeeded),
                totalDegreesOfSuccess: this.parent.degreeOfSuccessManager.totalDegreesOfSuccess,
                usedDegreesOfSuccess: this.parent.degreeOfSuccessManager.usedDegreesOfSuccess,
                openDegreesOfSuccess: this.parent.degreeOfSuccessManager.openDegreesOfSuccess,
            },
            degreeOfSuccessOptions: this.badlyPostfixRenderedOptions(renderDegreeOfSuccessOptions(this.parent)),
            actions: renderActions(this.parent),
        }
    }

    //probably a bad impl. It might make more sense, to pass through a roll result and evaulate here
    createDifficulty() {
        const checkReport = this.checkReportReference.get();
        const spell = this.spellReference.getItem();
        if (Number.isInteger(Number.parseInt(spell.difficulty))) {
            return `${checkReport.difficulty}`
        } else {
            return `${spell.difficulty} (${checkReport.difficulty})`
        }
    }

    /**
     * postfix the available degree of success option to what makes sense at the given point in time.
     * bad Impl. Ideally, the degreeOfSuccessFields should be adapted and manage their multiplicities and respective
     * availablities
     *  @param {SpellDegreessOfSuccessRenderedData[]|null}spellDegreesOfSuccessRenderedData
     * @return {SpellDegreessOfSuccessRenderedData[]}
     */
    badlyPostfixRenderedOptions(spellDegreesOfSuccessRenderedData) {
        if (!spellDegreesOfSuccessRenderedData) {
            return null;
        }
        for (let i = 0; i < spellDegreesOfSuccessRenderedData.length; i++) {
            const renderedData = spellDegreesOfSuccessRenderedData[i];
            if (renderedData.checked) {
                continue;
            }
            if (renderedData.action.includes("castDuration")) {
                if (renderedData.multiplicity > 2) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1)
                    i--;
                } else if (this.parent.actionManager.ticks.cost <= renderedData.multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                }
            } else if (renderedData.action.includes("channelizedFocus") === 0) {
                if (renderedData.multiplicity > 4) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                } else if (this.#getSubstractedCost("channelizedFocus", renderedData.multiplicity).channeled === 0) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                }
            } else if (renderedData.action.includes("exhaustedFocus")) {
                if (this.#getSubstractedCost("exhaustedFocus", renderedData.multiplicity).exhausted === 0) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                }
            } else if (renderedData.action.includes("consumedFocus")) {
                if (renderedData.multiplicity > 4) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                } else if (this.#getSubstractedCost("consumedFocus", renderedData.multiplicity).consumed === 0) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                }
            }
        }
        return spellDegreesOfSuccessRenderedData.length === 0 ? null : spellDegreesOfSuccessRenderedData;
    }

    #getSubstractedCost(costString, multiplicity) {
        const adjustedCost = parseCostString(this.parent.actionManager.focus.cost).asPrimaryCost();
        const modifier = this.#calcFocusCostReduction(splittermond.spellEnhancement[costString].focusCostReduction, multiplicity)
            .subtract(parseCostString("2V1", false).asModifier())
        return adjustedCost.subtract(modifier);


    }

    #calcFocusCostReduction(costString, multiplicity) {
        return parseCostString(costString).asModifier().multiply(multiplicity);
    }

}

/**
 * @param {number} degreeOfSuccess
 * @param {boolean} succeeded
 * @return {string}
 */
function getDegreeOfSuccessMessage(degreeOfSuccess, succeeded) {
    const messageType = `${succeeded ? "success" : "fail"}Message`;
    const messageExtremity = Math.min(Math.abs(degreeOfSuccess), 5);
    return foundryApi.localize(`splittermond.${messageType}.${messageExtremity}`);
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
 * @return {SpellDegreessOfSuccessRenderedData[]}
 */
function renderDegreeOfSuccessOptions(spellRollMessage) {
    const renderedOptions = [];
    for (const key in splittermond.spellEnhancement) {
        const fieldsForKey = spellRollMessage.degreeOfSuccessManager.getMultiplicities(key);
        for (const field of fieldsForKey) {
            const renderedOption = renderDegreeOfSuccessOption(field, key);
            if (renderedOption && hasAction(spellRollMessage, renderedOption.action)) {
                renderedOptions.push(renderedOption);
            }
        }
    }
    {
        const key = "spellEnhancement"
        const spellEnhancement = renderSpellEnhancementOption(spellRollMessage, key);
        if (spellEnhancement) {
            renderedOptions.push(spellEnhancement);
        }
    }
    const renderedOptionsAreEmpty = Object.keys(renderedOptions).length === 0;
    return renderedOptionsAreEmpty ? null : renderedOptions;
}


/**
 * @param {SplittermondSpellRollMessage} spellRollMessage
 * @param {Exclude<ManagedSpellOptions, SpellDegreesOfSuccessOptions>} key
 */
function renderSpellEnhancementOption(spellRollMessage, key) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(spellRollMessage.degreeOfSuccessManager[key], key);
    if (!commonConfig) {
        return null;
    }
    return {
        ...commonConfig,
        text: `${spellRollMessage.spellReference.getItem().enhancementCosts}: ${spellRollMessage.spellReference.getItem().enhancementDescription}`
    };
}

/**
 * @param {SpellMessageDegreeOfSuccessField} field
 * @param {SpellDegreesOfSuccessOptions} key
 */
function renderDegreeOfSuccessOption(field, key) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(field, key)
    if (!commonConfig) {
        return null;
    }
    const degreeOfSuccessOptionConfig = splittermond.spellEnhancement[key];
    return {
        ...commonConfig,
        text: `${field.degreeOfSuccessCosts} EG ${field.multiplicity > 1 ? field.multiplicity:""} ${foundryApi.localize(degreeOfSuccessOptionConfig.textTemplate)}`,
    };
}

/**
 * @param {SpellMessageDegreeOfSuccessField} degreeOfSuccessField
 * @param {ManagedSpellOptions} key
 */
function commonRenderDegreeOfSuccessOptions(degreeOfSuccessField, key) {
    const actionName = `${key}Update`
    if (!degreeOfSuccessField.isAvailable()) {
        return null;
    }
    return {
        id: `${key}-${new Date().getTime()}`,
        action: actionName,
        checked: degreeOfSuccessField.checked,
        disabled: !degreeOfSuccessField.isCheckable(),
        multiplicity: degreeOfSuccessField.multiplicity
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
    if (rollFumbleRender) {
        renderedOptions["rollFumble"] = rollFumbleRender;
    }
    if (activeDefenseRender) {
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
    if (!spellRollMessage.actionManager.magicFumble.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.magicFumble.used
    };
}

function renderActiveDefense(spellRollMessage) {
    if (!spellRollMessage.actionManager.activeDefense.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.activeDefense.used,
        difficulty: spellRollMessage.actionManager.activeDefense.itemReference.getItem().difficulty
    };

}
