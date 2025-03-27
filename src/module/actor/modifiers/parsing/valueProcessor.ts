import {ErrorMessage, FocusModifier, ParsedModifier, ScalarModifier, Value} from "./index";
import {Expression, expressions, ReferenceExpression, RollExpression} from "../expressions/definitions";
import {normalizeValue} from "./normalizer";
import {isRoll} from "../../../api/Roll";
import {validateReference} from "./validators";

const {of, times} = expressions;

export function processValues(modifiers: ParsedModifier[], actor: Actor) {
    const result = {
        scalarModifiers: [] as ScalarModifier[],
        vectorModifiers: [] as FocusModifier[],
        errors: [] as string[]
    }
    for (const modifier of [...modifiers]) {
        const value = modifier.attributes.value;
        if (!value) {
            result.errors.push(`Modifier '${modifier.path}' contains no declaration of value`);
            continue;
        }
        const processedValue = processValue(value, actor);
        if (Array.isArray(processedValue)) {
            result.errors.push(...processedValue);
            continue;
        }
        //I have no clue why I have to duplicate the obj
        if (typeof processedValue === "string") {
            const valueProcessedModifier: FocusModifier = {
                path: modifier.path,
                attributes: {...modifier.attributes},
                value: processedValue
            };
            delete valueProcessedModifier.attributes.value;
            result.vectorModifiers.push(valueProcessedModifier);
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

function processValue(value: Value, actor: Actor): Expression | string | ErrorMessage[] {
    const normalized = normalizeValue(value);
    const transformed = setUpExpression(normalized, actor);
    return transformed;
}

function setUpExpression(expression: Value, source: object): Expression | string | ErrorMessage[] {
    if (typeof expression === "number") {
        return expressions.of(expression);
    } else if (isRoll(expression)) {
        return new RollExpression(expression);
    } else if (typeof expression === "object") {
        const validationFailures = validateReference(expression.propertyPath, source);
        if (validationFailures.length > 0) {
            return validationFailures;
        }
        const reference = new ReferenceExpression(expression.propertyPath, source, expression.original);
        return times(of(expression.sign), reference)
    } else {
        return expression;
    }
}
