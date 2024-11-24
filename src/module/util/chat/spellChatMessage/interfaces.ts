export interface Action {
    type:AvailableActions
    disabled:boolean
    isLocal:boolean
}
export interface ValuedAction extends Action {
    type: "applyDamage"|"advanceToken"|"consumeCosts"|"activeDefense";
    /** Text displayed on the  action button*/
    value: string
    /**Only for the active defense action, should be value*/
    difficulty?:string
}

export interface UnvaluedAction extends Action {
   type: "useSplinterpoint"|"rollFumble";
}


/**
 * Available actions as specified in spell-chat-card.hbs
 */
const availableActions = ["activeDefense", "applyDamage", "consumeCosts", "advanceToken", "useSplinterpoint", "rollFumble"] as const  ;
export type AvailableActions = typeof availableActions[number]

export function isAvailableAction(action:string): action is AvailableActions{
   return (availableActions as readonly string[]).includes(action);
}

export interface DegreeOfSuccessOption {
    checked:boolean
    disabled:boolean
    action: string
    multiplicity: string
    text:string

}
export interface DegreeOfSuccessOptionData {
    action: string
    multiplicity: string
}

export function isDegreeOfSuccessOptionData(data:unknown): data is DegreeOfSuccessOptionData {
    return data instanceof Object && "action" in data && "multiplicity" in data;
}

export interface DegreeOfSuccessAction {
    usedDegreesOfSuccess: number
    action: ()=>void
}

export interface DegreeOfSuccessOptionSuggestion{
    render: DegreeOfSuccessOption;
    /**
     * should be positive if the next user action is option selection
     * and negative if the next user acion on the option is deselection.
     */
    cost:number;
}
export interface ActionHandler {
    renderDegreeOfSuccessOptions():DegreeOfSuccessOptionSuggestion[]
    renderActions():(ValuedAction|UnvaluedAction)[]
    readonly handlesActions: readonly string[]
    readonly handlesDegreeOfSuccessOptions: readonly string[]

    useAction(actionData:any):Promise<void>
    useDegreeOfSuccessOption(degreeOfSucccessOptionData:any): DegreeOfSuccessAction
}

export interface SpellRollMessageRenderedData {
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
    degreeOfSuccessOptions: SpellDegreesOfSuccessRenderedData[];
    actions: object;
}

interface SpellDegreesOfSuccessRenderedData {
    id: string;
    text: string;
    action: string;
    checked: boolean;
    disabled: boolean;
    multiplicity: string;
}