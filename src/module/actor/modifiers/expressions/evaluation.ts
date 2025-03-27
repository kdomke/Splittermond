// noinspection SuspiciousTypeOfGuard

import {
    AbsExpression,
    AddExpression,
    AmountExpression, DivideExpression,
    Expression,
    MultiplyExpression,
    ReferenceExpression, RollExpression,
    SubtractExpression
} from "./definitions";
import {exhaustiveMatchGuard} from "./util";

export function evaluate(expression: Expression): number {
    return doEvaluate(expression) ?? 0
}

function doEvaluate(expression: Expression): number | null {
    if (expression instanceof AmountExpression) {
        return expression.amount
    } else if (expression instanceof ReferenceExpression) {
        return new PropertyResolver().numberOrNull(expression.propertyPath, expression.source)
    } else if (expression instanceof AddExpression) {
        return (doEvaluate(expression.left) ?? 0) + (doEvaluate(expression.right) ?? 0)
    } else if (expression instanceof SubtractExpression) {
        return (doEvaluate(expression.left) ?? 0) - (doEvaluate(expression.right) ?? 0)
    } else if (expression instanceof MultiplyExpression) {
        return (doEvaluate(expression.left) ?? 1) * (doEvaluate(expression.right) ?? 1)
    } else if (expression instanceof DivideExpression) {
        return (doEvaluate(expression.left) ?? 1) / (doEvaluate(expression.right) ?? 1)
    } else if (expression instanceof RollExpression) {
        return expression.value.evaluateSync().total
    } else if (expression instanceof AbsExpression) {
        return Math.abs(evaluate(expression.arg))
    }
    exhaustiveMatchGuard(expression)
}

class PropertyResolver {
    numberOrNull(propertyPath: string | null | undefined, source: object): number | null {
        const value = this.resolve(propertyPath, source);
        if (typeof value === "number") {
            return value;
        }
        return null;
    }

    resolve(propertyPath: string | null | undefined, source: object): unknown {
        if (!propertyPath) {
            return source;
        }

        const individualParts = propertyPath.split(".");
        let current: unknown = source;
        for (const part of individualParts) {
            if (this.hasPart(current, part)) {
                const compilerDeconfuser:Record<string,unknown> =current;
                current = compilerDeconfuser[part]
            } else {
                return undefined;
            }
        }
        return current;
    }
    private hasPart(current: unknown, part: string): current is Record<string,unknown> {
        return current !== null && typeof current === "object" && part in current;
    }
}