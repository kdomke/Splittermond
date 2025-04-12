import {ErrorMessage, FocusModifier, ParsedModifier, ScalarModifier, Value} from "./index";
import {Expression, ref as scalarRef, roll, times} from "module/actor/modifiers/expressions/scalar/definitions";
import {normalizeValue} from "./normalizer";
import {isRoll} from "../../../api/Roll";
import {validateReference} from "./validators";
import {foundryApi} from "../../../api/foundryApi";
import {parseCostString} from "../../../util/costs/costParser";
import {of} from "../expressions/scalar";
import {CostExpression, of as ofCost, ref as costRef, times as timesCost} from "../expressions/cost";
import {Cost} from "../../../util/costs/Cost";

export function processValues(modifiers: ParsedModifier[], refSource: object) {
    const result = {
        scalarModifiers: [] as ScalarModifier[],
        vectorModifiers: [] as FocusModifier[],
        errors: [] as string[]
    }
    for (const modifier of [...modifiers]) {
        const value = modifier.attributes.value;
        if (!value) {
            result.errors.push(foundryApi.format("splittermond.modifiers.parseMessages.noValue", {modifier: modifier.path}));
            continue;
        }
        if (modifiesFocus(modifier.path))  {
            const processedValue = processCost(value, refSource);
            if (Array.isArray(processedValue)) {
                result.errors.push(...processedValue);
                continue;
            }
            const valueProcessedModifier: FocusModifier = {
                path: modifier.path,
                attributes: {...modifier.attributes},
                value: processedValue
            };
            delete valueProcessedModifier.attributes.value;
            result.vectorModifiers.push(valueProcessedModifier);

        } else {
            const processedValue = processValue(value, refSource);
            if (Array.isArray(processedValue)) {
                result.errors.push(...processedValue);
                continue;
            }
            const valueProcessedModifier: ScalarModifier = {
                path: modifier.path,
                attributes: {...modifier.attributes},
                value: processedValue
            };
            delete valueProcessedModifier.attributes.value;
            result.scalarModifiers.push(valueProcessedModifier);
        }
    }
    return result;
}

function processValue(value: Value, refSource: object): Expression | ErrorMessage[] {
    const normalized = normalizeValue(value);
    return setUpExpression(normalized, refSource);
}

function processCost(value: Value, refSource: object): CostExpression | ErrorMessage[] {
    const normalized = normalizeValue(value);
    return setUpCostExpression(normalized, refSource);
}

function setUpExpression(expression: Value, source: object): Expression | ErrorMessage[] {
    if (typeof expression === "number") {
        return of(expression);
    } else if (isRoll(expression)) {
        return roll(expression);
    } else if (typeof expression === "object") {
        const validationFailures = validateReference(expression.propertyPath, source);
        if (validationFailures.length > 0) {
            return validationFailures;
        }
        const reference = scalarRef(expression.propertyPath, source, expression.original);
        return times(of(expression.sign), reference)
    } else {
        return [foundryApi.format("splittermond.modifiers.parseMessages.notANumber", {expression})];
    }
}

function setUpCostExpression(expression: Value, source: object): CostExpression | ErrorMessage[] {
    if (typeof expression === "number") {
        return ofCost(new Cost(expression, 0, false).asModifier());
    } else if (isRoll(expression)) {
        return [foundryApi.format("splittermond.modifiers.parseMessages.foNoCost", {expression: expression.formula})];
    } else if (typeof expression === "object") {
        const validationFailures = validateReference(expression.propertyPath, source);
        if (validationFailures.length > 0) {
            return validationFailures;
        }
        const reference = costRef(expression.propertyPath, source, expression.original);
        return timesCost(of(expression.sign), reference)
    } else {
        return ofCost(parseCostString(expression).asModifier());
    }
}

function modifiesFocus(modifierId: string){
    return modifierId.toLowerCase().startsWith("foreduction")|| modifierId.toLowerCase().startsWith("foenhancedreduction")
}
