import SplittermondActor from "./actor";
import SplittermondItem from "../item/item";
import {TooltipFormula} from "../util/tooltip";
import {abs, Expression} from "./modifiers/expressions/definitions";
import {condense} from "./modifiers/expressions/condenser";
import {asString} from "./modifiers/expressions/Stringifier";
import {isGreaterZero} from "./modifiers/expressions/Comparator";

export interface ModifierAttributes {
    name:string;
    type:ModifierType
    [x:string]: string|undefined|null;
}

/**
 * The type of item from which the modifier stems. Use
 * <ul>
 *     <li><code>magic</code> for spells, their effects and temporary enchantments</li>
 *     <li><code>equipment</code> for arms, armor and any personal effects</li>
 *     <li><code>innate</code> for strengths, masteries and other permanent effects</li>
 * </ul>
 */
export type ModifierType = "magic"|"equipment"|"innate"|null;
export interface IModifier {
   readonly value:Expression;
   addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix?:string, malusPrefix?:string):void;
   readonly groupId:string;
   readonly selectable:boolean;
   readonly attributes: ModifierAttributes
   readonly origin:SplittermondItem|SplittermondActor|null;
}

export default class Modifier implements IModifier {
    private _isBonus:boolean;
    /**
     *
     * @param {string} path Modifier Path
     * @param {(numeric | string)} value
     * @param attributes secondary selection characteristics of this modifier
     * @param {(Item | Actor)=null} origin
     * @param {boolean=false} selectable is the modifier selectable as a roll option
     */
    constructor(
        public readonly path:string,
        public readonly value:Expression,
        public readonly attributes:ModifierAttributes,
        public readonly origin:SplittermondItem|SplittermondActor|null = null,
        public readonly selectable = false) {
        this.selectable = selectable;
        this._isBonus = isGreaterZero(value) ?? true; //Assume a bonus if no statement can be made
    }


    get isMalus() {
        return !this._isBonus;
    }

    get isBonus() {
        return this._isBonus;
    }

    addTooltipFormulaElements(formula:TooltipFormula, bonusPrefix = "+", malusPrefix = "-") {
        if (this.isBonus) {
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

    /**
     * @deprecated use attribute filters to access these
     */
    get name(){
        return this.attributes.name;
    }

    /**
     * @deprecated use attribute filters to access these
     */
    get type(){
        return this.attributes.type;
    }

}