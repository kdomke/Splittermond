import {parseModifiers} from "./parser";
import {normalizeModifiers} from "./normalizer";
import {createExpressions} from "./expressionCreator";

export type ErrorMessage = string;

export interface ParsedModifier {
    path:string
    attributes: Record<string, Value>
}

export type Value = ParsedExpression|number|string
export interface ParsedExpression {
    propertyPath:string
    sign: -1|1;
}

export {parseModifiers,normalizeModifiers, createExpressions};