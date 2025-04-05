// noinspection SuspiciousTypeOfGuard

import {
    AbsExpression,
    AddExpression,
    AmountExpression,
    DieExpression,
    DivideExpression,
    Expression,
    MultiplyExpression,
    ReferenceExpression,
    SubtractExpression
} from "./definitions";
import {condense} from "./condenser";
import {evaluate} from "./evaluation";
import {exhaustiveMatchGuard} from "./util";

interface Range {
    min: number;
    max: number;
}

export function isGreaterZero(expression: Expression): boolean | null {
    const result = tentativeEvaluate(expression);
    if (result.min > 0 && result.max > 0) {
        return true;
    } else if (result.min <= 0 && result.max <= 0) {
        return false;
    } else {
        return null;
    }
}

export function isLessThanZero(expression: Expression): boolean | null {
    const result = tentativeEvaluate(expression);
    if (result.min < 0 && result.max < 0) {
        return true;
    } else if (result.min >= 0 && result.max >= 0) {
        return false;
    } else {
        return null;
    }
}

function tentativeEvaluate(expression: Expression): { min: number, max: number } {
    const condensed = condense(expression);
    if (condensed instanceof AmountExpression) {
        const val = evaluate(condensed);
        return {min: val, max: val}
    } else if (condensed instanceof DieExpression) {
        return evalDies(condensed);
    } else if (condensed instanceof ReferenceExpression) {
        return {min: Number.NaN, max: Number.NaN}
    } else if (condensed instanceof AddExpression) {
        return evalBinaries(condensed, (left: number, right: number) => left + right);
    } else if (condensed instanceof SubtractExpression) {
        return evalBinaries(condensed, (left: number, right: number) => left - right);
    } else if (condensed instanceof MultiplyExpression) {
        return evalBinaries(condensed, (left: number, right: number) => left * right);
    } else if (condensed instanceof DivideExpression) {
        return evalBinaries(condensed, (left: number, right: number) => left / right);
    } else if (condensed instanceof AbsExpression) {
        return evalAbs(condensed)
    }
    exhaustiveMatchGuard(condensed);
}
//We are ignoring foundry dice modifiers for now
function evalDies(expression: DieExpression): Range {
    const term = expression.value.terms[0];
    return {min: term.number, max: term.number * term.faces};
}

function evalBinaries(expression: {
    left: Expression,
    right: Expression
}, operation: (a: number, b: number) => number): {
    min: number,
    max: number
} {
    const left = tentativeEvaluate(expression.left);
    const right = tentativeEvaluate(expression.right);
    return sortResult(left, right, operation);
}

function sortResult(one: Range, other: Range, operation: (a: number, b: number) => number): Range {
    if ([one.min, one.max, other.min, other.max].some(isNaN)) {
        return {min: Number.NaN, max: Number.NaN};
    }
    const allResults = [
        operation(one.min, other.min),
        operation(one.min, other.max),
        operation(one.max, other.min),
        operation(one.max, other.max),
    ]
    return {min: Math.min(...allResults), max: Math.max(...allResults)};
}

function evalAbs(expression: AbsExpression) {
    const result = tentativeEvaluate(expression.arg);
    const arrayedResults = [result.min, result.max];
    if (arrayedResults.some(isNaN)) {
        return {min: Number.NaN, max: Number.NaN};
    } else {
        return {min: Math.min(...arrayedResults), max: Math.max(...arrayedResults)};
    }
}


