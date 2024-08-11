import {GenericRollEvaluation} from "../util/GenericRollEvaluation";

export interface CheckReport extends Omit<GenericRollEvaluation, "roll"> {
    skill: {
        id: string;
        attributes: Record<string, number>;
        points: number;
    };
    roll: {
        total: number;
        dice: { total: number }[];
        tooltip: string;
    };
    modifierElements: string[];
}