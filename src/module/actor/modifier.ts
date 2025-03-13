import SplittermondActor from "./actor";
import SplittermondItem from "../item/item";
import {TooltipFormula} from "../util/tooltip";

export interface IModifier<T=number> {
   readonly value:T;
   addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix?:string, malusPrefix?:string):void;
   readonly groupId:string;
   readonly selectable:boolean;
   readonly type:string;
   readonly origin:SplittermondItem|SplittermondActor|null;
   readonly name:string;
}

export default class Modifier implements IModifier {
    public readonly value:number;
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
        value:string|number,
        public readonly origin:SplittermondItem|SplittermondActor|null = null,
        public readonly type:string = "",
        public readonly selectable = false) {
        this.value = typeof value === "number" ? value :parseInt(value);
        this.selectable = selectable;
        this.name = name;
        this.type = type;
    }


    get isMalus() {
        return this.value < 0;
    }

    get isBonus() {
        return this.value > 0;
    }

    addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix = "+", malusPrefix = "-") {
        let val = Math.abs(this.value);
        if (this.isBonus) {
            formula.addBonus(bonusPrefix+val, this.name);
        } else {
            formula.addMalus(malusPrefix+val, this.name);
        }
    }

    equals(other:Modifier) {
        return this.path === other.path;
    }



    get groupId(){
        return this.path
    }

}