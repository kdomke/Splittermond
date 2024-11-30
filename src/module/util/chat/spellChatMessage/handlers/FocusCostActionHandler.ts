import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../../data/SplittermondDataModel";
import {
    ActionHandler,
    DegreeOfSuccessAction,
    DegreeOfSuccessOptionSuggestion,
    isDegreeOfSuccessOptionData,
    ValuedAction
} from "../interfaces";
import {Cost, CostModifier} from "../../../costs/Cost";
import {AgentReference} from "../../../../data/references/AgentReference";
import {OnAncestorReference} from "../../../../data/references/OnAncestorReference";
import {CheckReport} from "../../../../actor/CheckReport";
import {ItemReference} from "../../../../data/references/ItemReference";
import SplittermondSpellItem from "../../../../item/spell";
import {splittermond} from "../../../../config";
import {FocusDegreeOfSuccessOptionField} from "../FocusDegreeOfSuccessOptionField";
import {parseCostString, parseSpellEnhancementDegreesOfSuccess} from "../../../costs/costParser";
import {PrimaryCost} from "../../../costs/PrimaryCost";

const consumedFocusConfig = splittermond.spellEnhancement.consumedFocus;
const channeledFocusConfig = splittermond.spellEnhancement.channelizedFocus;
const exhaustedFocusConfig = splittermond.spellEnhancement.exhaustedFocus;

function FocusCostHandlerSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        casterReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            nullable: false
        }),
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            nullable: false
        }),
        adjusted: new fields.EmbeddedDataField(CostModifier, {required: true, nullable: false}),
        consumed: new fields.EmbeddedDataField(FocusDegreeOfSuccessOptionField, {required: true, nullable: false}),
        exhausted: new fields.EmbeddedDataField(FocusDegreeOfSuccessOptionField, {required: true, nullable: false}),
        channeled: new fields.EmbeddedDataField(FocusDegreeOfSuccessOptionField, {required: true, nullable: false}),
        spellEnhancement: new fields.SchemaField({
            checked: new fields.BooleanField({required: true, nullable: false, initial: false}),
            cost: new fields.NumberField({required: true, nullable: false}),
            effect: new fields.EmbeddedDataField(CostModifier, {required: true, nullable: false}),
        }, {required: true, nullable: false})
    }
}

type FocusCostHandlerType = DataModelSchemaType<typeof FocusCostHandlerSchema>

export class FocusCostHandler extends SplittermondDataModel<FocusCostHandlerType> implements ActionHandler {
    public readonly handlesActions = ["consumeCosts"] as const;
    public readonly handlesDegreeOfSuccessOptions = ["channeledFocusUpdate", "consumedFocusUpdate", "exhaustedFocusUpdate", "spellEnhancement"] as const;
    static defineSchema = FocusCostHandlerSchema;

    static initialize(
        casterReference: AgentReference,
        checkReportReference: OnAncestorReference<CheckReport>,
        spellReference: ItemReference<SplittermondSpellItem>) {
        const focusOptions = spellReference.getItem().degreeOfSuccessOptions;
        return new FocusCostHandler({
            used: false,
            casterReference: casterReference.toObject(),
            checkReportReference: checkReportReference.toObject(),
            spellReference: spellReference.toObject(),
            adjusted: new Cost(0, 0, false, false).asModifier().toObject(),
            consumed: FocusDegreeOfSuccessOptionField.initialize(
                focusOptions.consumedFocus,
                consumedFocusConfig.degreesOfSuccess,
                parseCostString(consumedFocusConfig.focusCostReduction).asModifier(),
                consumedFocusConfig.textTemplate
            ).toObject(),
            channeled: FocusDegreeOfSuccessOptionField.initialize(
                focusOptions.channelizedFocus,
                channeledFocusConfig.degreesOfSuccess,
                parseCostString(channeledFocusConfig.focusCostReduction).asModifier(),
                channeledFocusConfig.textTemplate
            ).toObject(),
            exhausted: FocusDegreeOfSuccessOptionField.initialize(
                focusOptions.exhaustedFocus,
                exhaustedFocusConfig.degreesOfSuccess,
                parseCostString(exhaustedFocusConfig.focusCostReduction).asModifier(),
                exhaustedFocusConfig.textTemplate
            ).toObject(),
            spellEnhancement: {
                checked: false,
                cost: parseSpellEnhancementDegreesOfSuccess(spellReference.getItem().enhancementCosts),
                //TODO: I would like to use toObject(), but the type system complains about missing functions.
                effect: parseCostString(spellReference.getItem().enhancementCosts).asModifier()
            }
        })
    }

    get cost() {
        const checkReport = this.checkReportReference.get();
        let cost = this.spellReference.getItem().getCostsForFinishedRoll(checkReport.degreeOfSuccess, checkReport.succeeded)
            .add(this.adjusted)
        if (cost.isZero()) {
            cost = cost.add(new Cost(1, 0, false).asModifier());
        }
        return cost;
    }

    renderDegreeOfSuccessOptions(): DegreeOfSuccessOptionSuggestion[] {
        const options: DegreeOfSuccessOptionSuggestion[] = [];
        ([["consumed", this.consumed], ["channeled", this.channeled], ["exhausted", this.exhausted]] as const)
            .filter(([__, option]) => (option.isOption))
            .forEach(([affectedFocusPortion, option]) => option
                .getMultiplicities()
                .map(m => option.forMultiplicity(m))
                .filter(m => m.isChecked() || !this.reducesCostPastMinimum(m.effect, affectedFocusPortion))
                .map(m => ({
                    render: {
                        ...m.render(),
                        disabled: this.used,
                        action: this.mapFocusPortionToOption(affectedFocusPortion)
                    },
                    //If an option is already checked then the cost of the action (unchecking) is negative, as it frees DoS
                    cost: m.isChecked() ? -1 * m.cost:m.cost,
                }))
                .forEach(m => options.push(m)));
        return options;
    }

    private mapFocusPortionToOption(portion: "consumed" | "channeled" | "exhausted"): typeof this.handlesDegreeOfSuccessOptions[number] {
        switch (portion) {
            case "consumed":
                return "consumedFocusUpdate";
            case "channeled":
                return "channeledFocusUpdate";
            case "exhausted":
                return "exhaustedFocusUpdate";
        }
    }

    private reducesCostPastMinimum(effect: CostModifier, costType: keyof PrimaryCost): boolean {
        return (this.cost.subtract(effect))[costType] === 0;
    }

    renderActions(): ValuedAction[] {
        if(this.consumed.isOption || this.channeled.isOption || this.exhausted.isOption) {
            return [
                {
                    type: "consumeCosts",
                    value: this.cost.render(),
                    disabled: this.used,
                    isLocal: false
                }
            ]
        }else{
            return [];
        }
    }

    useAction(actionData:any): Promise<void> {
        if (this.used) {
            console.warn("Attempt to use a used cost action");
            return Promise.resolve();
        }
        if(!("action" in actionData)){
            console.warn("Data has no member 'action'");
            return Promise.resolve();
        }
        if (!this.actionHandledByUs(actionData.action)){
            console.warn(`action ${actionData.action} is not handled by this handler`);
            return Promise.resolve();
        }
        this.updateSource({used: true});
        //@ts-expect-error name exists, but we haven't typed this yet
        this.casterReference.getAgent().consumeCost("focus", this.cost, this.spellReference.getItem().name);
        return Promise.resolve();
    }

    private actionHandledByUs(action: string): action is typeof this.handlesActions[number] {
        return (this.handlesActions as readonly string[]).includes(action);
    }
    useDegreeOfSuccessOption(degreeOfSuccessOptionData: any): DegreeOfSuccessAction {
        const noAction = {
            usedDegreesOfSuccess: 0, action: () => {
            }
        };
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return noAction;
        }
        if (!isDegreeOfSuccessOptionData(degreeOfSuccessOptionData)) {
            console.warn("Data passed from HTML object is not a valid degree of success option data");
            return noAction;
        }
        if (!this.optionHandledByUs(degreeOfSuccessOptionData.action)) {
            console.warn("Attempt to perform an action that is not handled by this handler");
            return noAction;
        }
        const multiplicity = Number.parseInt(degreeOfSuccessOptionData.multiplicity);
        switch (degreeOfSuccessOptionData.action) {
            case "channeledFocusUpdate":
                return this.updateFocus("channeled", multiplicity)
            case "consumedFocusUpdate":
                return this.updateFocus("consumed", multiplicity)
            case "exhaustedFocusUpdate":
                return this.updateFocus("exhausted", multiplicity);
            case "spellEnhancement":
                return this.updateSpellEnhancement();
        }
    }


    private optionHandledByUs(option: string): option is typeof this.handlesDegreeOfSuccessOptions[number] {
        return (this.handlesDegreeOfSuccessOptions as readonly string[]).includes(option);
    }

    private updateFocus(type: "consumed" | "exhausted" | "channeled", multiplicity: number) {
        const option = this[type].forMultiplicity(multiplicity);
        return {
            usedDegreesOfSuccess: option.cost,
            action: () => {
                option.check();
                const action = option.isChecked() ? this.subtractCost : this.addCost;
                action.call(this, option.effect);
            }
        }
    }

    private updateSpellEnhancement() {
        return {
            usedDegreesOfSuccess: this.spellEnhancement.cost,
            action: () => {
                this.updateSource({
                    spellEnhancement: {
                        ...this.spellEnhancement,
                        checked: !this.spellEnhancement.checked
                    }
                });
                if (this.spellEnhancement.checked) {
                    this.subtractCost(this.spellEnhancement.effect)
                } else {
                    this.addCost(this.spellEnhancement.effect)
                }
            }
        };
    }

    addCost(cost: CostModifier) {
        if (this.used) {
            console.warn("Attempt alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted.add(cost)});
    }

    subtractCost(cost: CostModifier) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted.subtract(cost)});
    }
}
