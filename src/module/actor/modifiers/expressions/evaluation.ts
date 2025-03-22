// noinspection SuspiciousTypeOfGuard

import {
    AddExpression,
    AmountExpression, DivideExpression,
    Expression,
    MultiplyExpression,
    ReferenceExpression,
    SubtractExpression
} from "./definitions";
import {exhaustiveMatchGuard} from "./util";

export function evaluate(expression: Expression): number | null {
    if (expression instanceof AmountExpression) {
        return expression.amount
    } else if (expression instanceof ReferenceExpression) {
        return new PropertyResolver().numberOrNull(expression.propertyPath, expression.source)
    } else if (expression instanceof AddExpression) {
        return (evaluate(expression.left) ?? 0) + (evaluate(expression.right) ?? 0)
    } else if (expression instanceof SubtractExpression) {
        return (evaluate(expression.left) ?? 0) - (evaluate(expression.right) ?? 0)
    } else if (expression instanceof MultiplyExpression) {
        return (evaluate(expression.left) ?? 1) * (evaluate(expression.right) ?? 1)
    } else if (expression instanceof DivideExpression) {
        return (evaluate(expression.left) ?? 1) / (evaluate(expression.right) ?? 1)
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