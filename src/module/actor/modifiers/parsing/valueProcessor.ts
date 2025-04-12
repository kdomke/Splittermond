import {ErrorMessage, FocusModifier, ParsedModifier, ScalarModifier, Value} from "./index";
import {AmountExpression, Expression, ref, roll, times} from "module/actor/modifiers/expressions/scalar/definitions";
import {normalizeValue} from "./normalizer";
import {isRoll} from "../../../api/Roll";
import {validateReference} from "./validators";
import {foundryApi} from "../../../api/foundryApi";
import {parseCostString} from "../../../util/costs/costParser";
import {asString, Expression as ScalarExpression, of} from "../expressions/scalar";
import {CostExpression, of as ofCost} from "../expressions/cost";
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
        const processedValue = processValue(value, refSource);
        if (Array.isArray(processedValue)) {
            result.errors.push(...processedValue);
            continue;
        }
        //I have no clue why I have to duplicate the obj
        if (typeof processedValue === "string") {
            const valueProcessedModifier: FocusModifier = {
                path: modifier.path,
                attributes: {...modifier.attributes},
                value: ofCost(parseCostString(processedValue).asModifier()),
            };
            delete valueProcessedModifier.attributes.value;
            result.vectorModifiers.push(valueProcessedModifier);
        } else if (modifier.path.toLowerCase().startsWith("foreduction")) {
            const mappedValue = mapScalarToVector(processedValue);
            if (typeof mappedValue === "string") {
                result.errors.push(mappedValue);
            } else {
                const valueProcessedModifier: FocusModifier = {
                    path: modifier.path,
                    attributes: {...modifier.attributes},
                    value: mappedValue,
                };
                delete valueProcessedModifier.attributes.value;
                result.vectorModifiers.push(valueProcessedModifier);
            }
        } else {
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

function processValue(value: Value, refSource: object): Expression | string | ErrorMessage[] {
    const normalized = normalizeValue(value);
    return setUpExpression(normalized, refSource);
}

function setUpExpression(expression: Value, source: object): Expression | string | ErrorMessage[] {
    if (typeof expression === "number") {
        return of(expression);
    } else if (isRoll(expression)) {
        return roll(expression);
    } else if (typeof expression === "object") {
        const validationFailures = validateReference(expression.propertyPath, source);
        if (validationFailures.length > 0) {
            return validationFailures;
        }
        const reference = ref(expression.propertyPath, source, expression.original);
        return times(of(expression.sign), reference)
    } else {
        return expression;
    }
}

function mapScalarToVector(expression: ScalarExpression): CostExpression | ErrorMessage {
    if (expression instanceof AmountExpression) {
        return ofCost(new Cost(expression.amount, 0, false).asModifier());
    }
    return foundryApi.format("splittermond.modifiers.parseMessages.foNoCost", {expression: asString(expression)});

}
