import SplittermondActor from "./actor";
import SplittermondItem from "../item/item";
import {TooltipFormula} from "../util/tooltip";
import {Expression} from "./modifiers/expressions/definitions";
import {evaluate} from "./modifiers/expressions/evaluation";
import {condense} from "./modifiers/expressions/condenser";
import {abs} from "./modifiers/expressions/definitions";
import {asString} from "./modifiers/expressions/Stringifier";


export interface IModifier {
   readonly value:Expression;
   addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix?:string, malusPrefix?:string):void;
   readonly groupId:string;
   readonly selectable:boolean;
   readonly type:string;
   readonly origin:SplittermondItem|SplittermondActor|null;
   readonly name:string;
}

export default class Modifier implements IModifier {
    /**
     * 
     * @param {string} path Modifier Path
     * @param {string} name name of modification
     * @param {(numeric | string)} value 
     * @param {(Item | Actor)=null} origin 
     * @param {string=""} type "equipment", "magic" etc.
     * @param {boolean=false} selectable is the modifier selectable as a roll option
     */
    constructor(
        public readonly path:string,
        public readonly name:string,
        public readonly value:Expression,
        public readonly origin:SplittermondItem|SplittermondActor|null = null,
        public readonly type:string = "",
        public readonly selectable = false) {
        this.selectable = selectable;
        this.name = name;
        this.type = type;
    }


    get isMalus() {
        return evaluate(this.value) < 0;
    }

    get isBonus() {
        return evaluate(this.value) > 0;
    }

    addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix = "+", malusPrefix = "-") {
        let evaluated = evaluate(this.value);
        if (evaluated > 0) {
            const term = `${bonusPrefix}${asString(abs(condense(this.value)))}`
            formula.addBonus(term, this.name);
        } else {
            const term = `${malusPrefix}${asString(abs(condense(this.value)))}`
            formula.addMalus(term, this.name);
        }
    }

    equals(other:Modifier) {
        return this.path === other.path;
    }



    get groupId(){
        return this.path
    }

}