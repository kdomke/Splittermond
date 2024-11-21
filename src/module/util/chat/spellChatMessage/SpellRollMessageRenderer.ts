import {SplittermondSpellRollMessage} from "./SplittermondSpellRollMessage";
import {foundryApi} from "module/api/foundryApi";
import {splittermond} from "../../../config.js";
import {RollResultRenderer} from "../RollResultRenderer";
import {DataModelSchemaType, fields, SplittermondDataModel} from "module/data/SplittermondDataModel";
import {OnAncestorReference} from "module/data/references/OnAncestorReference";
import {ItemReference} from "module/data/references/ItemReference";
import {parseCostString} from "../../costs/costParser.js";
import {CheckReport} from "../../../actor/CheckReport";
import SplittermondSpellItem from "../../../item/spell";
import {SpellMessageDegreeOfSuccessField} from "./SpellMessageDegreeOfSuccessField";
import {ManagedSpellOptions} from "./SpellMessageDegreesOfSuccessManager";
import {SpellDegreesOfSuccessOptions} from "../../../../../public/template";

/**
 * @extends {SplittermondDataModel<SplittermondSpellRollMessageRenderer, SplittermondSpellRollMessage>}
 * @property {OnAncestorReference<CheckReport>} checkReportReference
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 */
interface SpellDegreesOfSuccessRenderedData {
    id: string;
    text: string;
    action: string;
    checked: boolean;
    disabled: boolean;
    multiplicity: number;
}

interface SplittermondSpellRollMessageRenderedData {
    header: {
        title: string;
        rollTypeMessage: string;
        difficulty: string;
        hideDifficulty: boolean;
    }
    rollResultClass: string;
    rollResult: {
        rollTotal: number;
        skillAndModifierTooltip: { type: string; classes: string; value: string; description: string; }[];
        rollTooltip: string;
        actionDescription: string;
    };
    degreeOfSuccessDisplay: {
        degreeOfSuccessMessage: string;
        totalDegreesOfSuccess: number;
        usedDegreesOfSuccess: number;
        openDegreesOfSuccess: number;
    };
    degreeOfSuccessOptions: SpellDegreesOfSuccessRenderedData[] | null;
    actions: object;
}

function SplittermondSpellRollMessageSchema() {
    return {
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            blank: false,
            nullable: false
        }),
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            blank: false,
            nullable: false
        }),
    }
}

type SplittermondSpellRollMessageType = DataModelSchemaType<typeof SplittermondSpellRollMessageSchema>

export class SplittermondSpellRollMessageRenderer extends SplittermondDataModel<SplittermondSpellRollMessageType, SplittermondSpellRollMessage> {

    static defineSchema = SplittermondSpellRollMessageSchema;

    get template() {
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }

    renderData(): SplittermondSpellRollMessageRenderedData {
        const checkReport = this.checkReportReference.get();
        const spell = this.spellReference.getItem();
        return {
            rollResultClass: getRollResultClass(checkReport),
            header: {
                // @ts-expect-error spell is not typed yet
                title: spell.name,
                rollTypeMessage: foundryApi.localize(`splittermond.rollType.${checkReport.rollType}`),
                difficulty: this.createDifficulty(),
                hideDifficulty: checkReport.hideDifficulty
            },
            rollResult: new RollResultRenderer(spell.description, checkReport).render(),
            degreeOfSuccessDisplay: {
                degreeOfSuccessMessage: getDegreeOfSuccessMessage(checkReport.degreeOfSuccess, checkReport.succeeded),
                totalDegreesOfSuccess: this.getParent().degreeOfSuccessManager.totalDegreesOfSuccess,
                usedDegreesOfSuccess: this.getParent().degreeOfSuccessManager.usedDegreesOfSuccess,
                openDegreesOfSuccess: this.getParent().degreeOfSuccessManager.openDegreesOfSuccess,
            },
            degreeOfSuccessOptions: this.badlyPostfixRenderedOptions(renderDegreeOfSuccessOptions(this.getParent())),
            actions: renderActions(this.getParent()),
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
     */
    badlyPostfixRenderedOptions(spellDegreesOfSuccessRenderedData: SpellDegreesOfSuccessRenderedData[] | null): SpellDegreesOfSuccessRenderedData[] | null {
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
                } else if (Number.parseInt(this.getParent().actionManager.ticks.cost) <= renderedData.multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction) {
                    spellDegreesOfSuccessRenderedData.splice(i, 1);
                    i--;
                }
            } else if (renderedData.action.includes("channelizedFocus")) {
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

    #getSubstractedCost(enhancementType: keyof typeof splittermond.spellEnhancement, multiplicity: number) {
        const adjustedCost = parseCostString(this.getParent().actionManager.focus.cost).asPrimaryCost();
        const modifier = this.#calcFocusCostReduction(splittermond.spellEnhancement[enhancementType].focusCostReduction, multiplicity)
            .subtract(parseCostString("2V1", false).asModifier())
        return adjustedCost.subtract(modifier);


    }

    #calcFocusCostReduction(costString: string, multiplicity: number) {
        return parseCostString(costString).asModifier().multiply(multiplicity);
    }

    private getParent() {
        if (this.parent === null) {
            throw new Error("SplittermondSpellRollMessageRenderer needs to be accessed as embedded data, because it needs a parent");
        }
        return this.parent;
    }

}

function getDegreeOfSuccessMessage(degreeOfSuccess: number, succeeded: boolean): string {
    const messageType = `${succeeded ? "success" : "fail"}Message`;
    const messageExtremity = Math.min(Math.abs(degreeOfSuccess), 5);
    return foundryApi.localize(`splittermond.${messageType}.${messageExtremity}`);
}

function getRollResultClass(checkReport: CheckReport): string {
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

function renderDegreeOfSuccessOptions(spellRollMessage: SplittermondSpellRollMessage): SpellDegreesOfSuccessRenderedData[] | null {
    const renderedOptions = [];
    for (const key in splittermond.spellEnhancement) {
        const fieldsForKey = spellRollMessage.degreeOfSuccessManager.getMultiplicities(key as keyof typeof splittermond.spellEnhancement);
        for (const field of fieldsForKey) {
            const renderedOption = renderDegreeOfSuccessOption(field, key as keyof typeof splittermond.spellEnhancement);
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


function renderSpellEnhancementOption(spellRollMessage: SplittermondSpellRollMessage, key: Exclude<ManagedSpellOptions, SpellDegreesOfSuccessOptions>) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(spellRollMessage.degreeOfSuccessManager[key], key);
    if (!commonConfig) {
        return null;
    }
    return {
        ...commonConfig,
        text: `${spellRollMessage.spellReference.getItem().enhancementCosts}: ${spellRollMessage.spellReference.getItem().enhancementDescription}`
    };
}

function renderDegreeOfSuccessOption(field: SpellMessageDegreeOfSuccessField, key: keyof typeof splittermond.spellEnhancement) {
    const commonConfig = commonRenderDegreeOfSuccessOptions(field, key)
    if (!commonConfig) {
        return null;
    }
    const degreeOfSuccessOptionConfig = splittermond.spellEnhancement[key];
    return {
        ...commonConfig,
        text: `${field.degreeOfSuccessCosts} EG ${field.multiplicity > 1 ? field.multiplicity : ""} ${foundryApi.localize(degreeOfSuccessOptionConfig.textTemplate)}`,
    };
}

function commonRenderDegreeOfSuccessOptions(degreeOfSuccessField: SpellMessageDegreeOfSuccessField, key: ManagedSpellOptions) {
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


function hasAction(obj: Object, action: string): boolean {
    return (action in obj || action in Object.getPrototypeOf(obj))
        && typeof obj[action as keyof typeof obj/*We have just proven that action is a key*/] === "function";
}

function renderActions(spellRollMessage: SplittermondSpellRollMessage) {
    const renderedOptions: Record<string, object> = {};
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

function renderApplyDamage(spellRollMessage: SplittermondSpellRollMessage) {
    if (!spellRollMessage.actionManager.damage.available) {
        return null;
    }
    return {
        value: spellRollMessage.actionManager.damage.cost,
        disabled: spellRollMessage.actionManager.damage.used,
    };
}

function renderAdvanceToken(spellRollMessage: SplittermondSpellRollMessage) {
    return {
        value: spellRollMessage.actionManager.ticks.cost,
        disabled: spellRollMessage.actionManager.ticks.used,
    }
}

function renderConsumeCosts(spellRollMessage: SplittermondSpellRollMessage) {
    return {
        value: spellRollMessage.actionManager.focus.cost,
        disabled: spellRollMessage.actionManager.focus.used,
    }
}

function renderUseSplinterpoint(spellRollMessage: SplittermondSpellRollMessage) {
    if (!spellRollMessage.actionManager.splinterPoint.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.splinterPoint.used,
    }
}

function renderRollFumble(spellRollMessage: SplittermondSpellRollMessage) {
    if (!spellRollMessage.actionManager.magicFumble.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.magicFumble.used
    };
}

function renderActiveDefense(spellRollMessage: SplittermondSpellRollMessage) {
    if (!spellRollMessage.actionManager.activeDefense.available) {
        return null;
    }
    return {
        disabled: spellRollMessage.actionManager.activeDefense.used,
        difficulty: spellRollMessage.actionManager.activeDefense.itemReference.getItem().difficulty
    };

}
