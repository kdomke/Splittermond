import {
    DataModelConstructorInput,
    DataModelSchemaType,
    fields,
    SplittermondDataModel
} from "../../../data/SplittermondDataModel";
import {CheckReport} from "../../../actor/CheckReport";
import {SplittermondChatMessage} from "../../../data/SplittermondChatCardModel";
import {FocusCostHandler} from "./FocusCostActionHandler";
import SplittermondSpellItem from "../../../item/spell";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference";
import {ItemReference} from "../../../data/references/ItemReference";
import {AgentReference} from "../../../data/references/AgentReference";
import {addToRegistry} from "../chatMessageRegistry";
import {ActionHandler, isAvailableAction, SpellRollMessageRenderedData} from "./interfaces";
import {foundryApi} from "../../../api/foundryApi";

const constructorRegistryKey = "SpellRollMessage";

function SpellRollMessageSchema() {
    return {
        checkReport: new fields.ObjectField({required: true, nullable: false}),
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            nullable: false
        }),
        openDegreesOfSuccess: new fields.NumberField({required: true, nullable: false}),
        constructorKey: new fields.StringField({required: true, trim: true, blank: false, nullable: false}),
        focusCostHandler: new fields.EmbeddedDataField(FocusCostHandler, {required: true, nullable: false}),
    };
}

type SpellRollMessageType = Omit<DataModelSchemaType<typeof SpellRollMessageSchema>, "checkReport"> & {
    checkReport: CheckReport
}

export class SpellRollMessage extends SplittermondDataModel<SpellRollMessageType> implements SplittermondChatMessage {

    static defineSchema = SpellRollMessageSchema;

    static initialize(spell: SplittermondSpellItem, checkReport: CheckReport) {
        const reportReference = OnAncestorReference
            .for(SpellRollMessage).identifiedBy("constructorKey", constructorRegistryKey)
            .references("checkReport");
        const spellReference = ItemReference.initialize(spell)
        const actorReference = AgentReference.initialize(spell.actor);
        return new SpellRollMessage({
            checkReport: checkReport,
            spellReference: spellReference,
            constructorKey: constructorRegistryKey,
            focusCostHandler: FocusCostHandler.initialize(actorReference, reportReference, spellReference),
            openDegreesOfSuccess: checkReport.degreeOfSuccess,
        });
    }

    private readonly optionsHandlerMap = new Map<string, ActionHandler>();
    private readonly actionsHandlerMap = new Map<string, ActionHandler>();
    private readonly handlers: ActionHandler[] = [];

    constructor(data: DataModelConstructorInput<SpellRollMessageType>, ...args: any[]) {
        super(data, ...args);
        this.handlers.push(this.focusCostHandler);
        this.handlers.forEach(handler => this.registerHandler(handler));
    }

    private registerHandler(handler: ActionHandler) {
        handler.handlesDegreeOfSuccessOptions.forEach(value => this.optionsHandlerMap.set(value, handler));
        handler.handlesActions.forEach(value => this.actionsHandlerMap.set(value, handler));
    }

    getData(): SpellRollMessageRenderedData {
        return {
            header: {
                difficulty: `${this.checkReport.difficulty}`,
                hideDifficulty: this.checkReport.hideDifficulty,
                rollTypeMessage: "",
                //@ts-expect-error We haven't typed spell yet
                title: this.spellReference.getItem().name,
            },
            degreeOfSuccessDisplay: {
                degreeOfSuccessMessage: this.checkReport.degreeOfSuccessMessage,
                openDegreesOfSuccess: this.openDegreesOfSuccess,
                totalDegreesOfSuccess: this.checkReport.degreeOfSuccess,
                usedDegreesOfSuccess: this.checkReport.degreeOfSuccess - this.openDegreesOfSuccess
            },
            rollResult: {
                actionDescription: "",
                rollTooltip: "",
                rollTotal: 0,
                skillAndModifierTooltip: []
            },
            rollResultClass: getRollResultClass(this.checkReport),
            degreeOfSuccessOptions: this.handlers
                .flatMap(handler => handler.renderDegreeOfSuccessOptions())
                .filter(option => option.cost <= this.openDegreesOfSuccess)
                .map(option => option.render)
                .map(option => ({...option, id: `${option.action}-${option.multiplicity}-${new Date().getTime()}`})),
            actions: this.handlers
                .flatMap(handler => handler.renderActions())
        }
    }

    async handleGenericAction(optionData: Record<string,unknown> & { action: string }) {
        const degreeOfSuccessOption = this.optionsHandlerMap.get(optionData.action);
        const action = this.actionsHandlerMap.get(optionData.action);
        if(!action && !degreeOfSuccessOption ) {
            //TODO: localize
            foundryApi.warnUser("No handler found for action");
        } else if(!!action && !!degreeOfSuccessOption){
            foundryApi.warnUser("Ambiguous action, please report this bug");
        } else if (action) {
            return this.handleActions(action, optionData);
        } else if (degreeOfSuccessOption){
            const preparedOption = degreeOfSuccessOption.useDegreeOfSuccessOption(optionData);
            if(preparedOption.usedDegreesOfSuccess <= this.openDegreesOfSuccess){
                try {
                    preparedOption.action();
                    this.updateSource({openDegreesOfSuccess: this.openDegreesOfSuccess - preparedOption.usedDegreesOfSuccess});
                } catch (e){
                   return Promise.reject(e)
                }
            }
        }
    }

    private async handleActions(action: ActionHandler, actionData:Record<string, unknown> & {action:string}){
        const actionKeyword = actionData.action;
        if(isAvailableAction(actionKeyword)){
            return action.useAction({...actionData, action:actionKeyword})
        } else{
            throw new Error("Somehow action is not a keyword that is in AvailableActions. This should never happen.")
        }
    }

    get template() {
        return "systems/splittermond/templates/chat/spell-chat-card.hbs";
    }
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

addToRegistry("SpellRollMessage", SpellRollMessage);