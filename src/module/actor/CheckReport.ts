import {GenericRollEvaluation} from "../util/GenericRollEvaluation";
import {SplittermondSkill} from "../../../public/template";

export interface CheckReport extends Omit<GenericRollEvaluation, "roll"> {
    skill: {
        id: SplittermondSkill;
        attributes: Record<string, number>;
        points: number;
    };
    roll: {
        total: number;
        dice: { total: number }[];
        tooltip: string;
    };
    modifierElements: string[];
    hideDifficulty: boolean;
}