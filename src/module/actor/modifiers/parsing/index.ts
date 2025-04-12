import {parseModifiers} from "./parser";
import {FoundryRoll} from "../../../api/Roll";
import {CostExpression, ScalarExpression} from "../expressions";
import {processValues} from "./valueProcessor";

export type ErrorMessage = string;

export interface ParsedModifier {
    path:string
    attributes: Record<string,Value>
}

export type Value = ParsedExpression|number|FoundryRoll|string
export interface ParsedExpression {
    original:string
    propertyPath:string
    sign: -1|1;
}

export type ScalarModifier = ParsedModifier & {value:ScalarExpression}
export type FocusModifier = ParsedModifier & {value:CostExpression}

export {parseModifiers, processValues};