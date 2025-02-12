export interface DamageMessageData {
    source: string|null;
    features: {active: boolean, name: string, value:string}[];
    formula: string;
    total: number;
    tooltip: string;
    actions: DamageAction[];

}

export interface DamageAction {
    classes: string;
    data: Record<string, string>
    icon: string;
    name: string;
}