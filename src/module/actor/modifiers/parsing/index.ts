import {parseModifiers} from "./parser";
import {normalizeModifiers} from "./normalizer";
import {createExpressions} from "./expressionCreator";
import {FoundryRoll} from "../../../api/Roll";

export type ErrorMessage = string;

export interface ParsedModifier {
    path:string
    attributes: Record<string, Value>
}

export type Value = ParsedExpression|number|FoundryRoll|string
export interface ParsedExpression {
    original:string
    propertyPath:string
    sign: -1|1;
}

export {parseModifiers,normalizeModifiers, createExpressions};