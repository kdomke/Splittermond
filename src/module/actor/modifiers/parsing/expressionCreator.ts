import {ErrorMessage, ParsedModifier, Value} from "./index";
import {Expression, expressions, ReferenceExpression} from "../expressions/definitions";
import {validateReference} from "./validators";

const {of, times} = expressions;

export function createExpressions(modifiers: ParsedModifier[], source: object): {modifiers: EvaluatedModifier[], errors:ErrorMessage[]} {
    const errors:ErrorMessage[]=[]
    const evaluatedModifiers: EvaluatedModifier[] = [];
    for (const modifier of modifiers){
        const evaluationResult= createExpression(modifier, source)
        if(Array.isArray(evaluationResult)){
            errors.push(...evaluationResult);
        }else {
            evaluatedModifiers.push(evaluationResult)
        }
    }
    return {modifiers:evaluatedModifiers, errors};
}

function createExpression(modifier: ParsedModifier, source: object): EvaluatedModifier|ErrorMessage[]{
    const attributes: Record<string, Expression | string> = {};

    for (const key in modifier.attributes) {
        const expression  = setUpExpression(modifier.attributes[key], source);
        if(Array.isArray(expression)) {
            return expression
        }
        attributes[key] = expression;
    }
    return {path: modifier.path, attributes};
}

function setUpExpression(expression: Value, source: object): Expression | string |ErrorMessage[]{
    if (typeof expression === "number") {
        return expressions.of(expression);
    } else if (typeof expression === "object") {
        const validationFailures = validateReference(expression.propertyPath,source);
        if(validationFailures.length > 0){
            return validationFailures;
        }
        const reference = new ReferenceExpression(expression.propertyPath, source, expression.original);
        return times(of(expression.sign), reference)
    } else {
        return expression;
    }
}

interface EvaluatedModifier {
    path: string;
    attributes: Record<string, Expression | string>;
}