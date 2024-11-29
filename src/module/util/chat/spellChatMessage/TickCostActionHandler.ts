import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../data/SplittermondDataModel";
import {
    ActionHandler,
    DegreeOfSuccessAction,
    DegreeOfSuccessOptionSuggestion,
    isDegreeOfSuccessOptionData,
    ValuedAction
} from "./interfaces";
import {NumberDegreeOfSuccessOptionField} from "./NumberDegreeOfSuccessOptionField";
import {AgentReference} from "../../../data/references/AgentReference";
import {splittermond} from "../../../config";
import {ItemReference} from "../../../data/references/ItemReference";
import SplittermondSpellItem from "../../../item/spell";

const castDurationConfig = splittermond.spellEnhancement.castDuration;

function TickCostActionHandlerSchema() {
    return {
        used: new fields.BooleanField({required: true, nullable: false, initial: false}),
        tickReduction: new fields.NumberField({required: true, nullable: false, initial: 0}),
        actorReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
        baseTickCost: new fields.NumberField({required: true, nullable: false}),
        options: new fields.EmbeddedDataField(NumberDegreeOfSuccessOptionField, {required: true, nullable: false})
    }
}

type TickCostActionHandlerType = DataModelSchemaType<typeof TickCostActionHandlerSchema>;

export class TickCostActionHandler extends SplittermondDataModel<TickCostActionHandlerType> implements ActionHandler {

    static defineSchema = TickCostActionHandlerSchema;

    static initialize(actorReference: AgentReference, spellReference: ItemReference<SplittermondSpellItem>, baseTickCost: number): TickCostActionHandler {
        return new TickCostActionHandler({
            used: false,
            tickReduction: 0,
            actorReference: actorReference,
            baseTickCost,
            options: NumberDegreeOfSuccessOptionField.initialize(
                spellReference.getItem().degreeOfSuccessOptions.castDuration,
                castDurationConfig.degreesOfSuccess,
                castDurationConfig.castDurationReduction,
                castDurationConfig.textTemplate)
        });
    }

    public readonly handlesDegreeOfSuccessOptions = ["castDurationUpdate"]

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
        const option = this.options.forMultiplicity(multiplicity);
        return {
            usedDegreesOfSuccess: option.cost,
            action: () => {
                option.check()
                if (option.isChecked()) {
                    this.updateSource({tickReduction: this.tickReduction + option.effect});
                } else {
                    this.updateSource({tickReduction: this.tickReduction - option.effect});
                }
            }
        }
    }

    private optionHandledByUs(option: string): option is typeof this.handlesDegreeOfSuccessOptions[number] {
        return this.handlesDegreeOfSuccessOptions.includes(option);
    }

    renderDegreeOfSuccessOptions(): DegreeOfSuccessOptionSuggestion[] {
        if (!this.options.isOption) {
            return [];
        }
        return this.options.getMultiplicities()
            .map(m => this.options.forMultiplicity(m))
            .filter(m => m.isChecked() || !this.reducesCostPastMinimum(m.effect))
            .map(m => ({
                render: {
                    ...m.render(),
                    disabled: this.used,
                    action: "castDurationUpdate",
                },
                cost: m.isChecked() ? -m.cost : m.cost
            }));
    }

    private reducesCostPastMinimum(effect: number): boolean {
        return this.baseTickCost - effect < 1;
    }

    public readonly handlesActions = ["advanceToken"];

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
        return this.actorReference.getAgent().addTicks(this.tickCost, "", false);
    }

    private actionHandledByUs(action: string): action is typeof this.handlesActions[number] {
        return (this.handlesActions as readonly string[]).includes(action);
    }

    renderActions(): ValuedAction[] {
        if(!this.options.isOption){
            return [];
        }
        return [
            {
                type: "advanceToken",
                value: `${this.tickCost}`,
                disabled: this.used,
                isLocal: false
            }
        ]
    }

    get tickCost() {
        const adjusted = this.baseTickCost - this.tickReduction;
        return adjusted > 0 ? adjusted : 1;
    }
}