// noinspection SuspiciousTypeOfGuard

import {
    AbsExpression,
    AddExpression,
    AmountExpression, DivideExpression,
    Expression, MultiplyExpression,
    ReferenceExpression,
    RollExpression,
    SubtractExpression
} from "./definitions";
import {condense} from "./condenser";
import {evaluate} from "./evaluation";
import {exhaustiveMatchGuard} from "./util";
import {Die, isRoll, NumericTerm, OperatorTerm, RollTerm} from "../../../api/Roll";

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
    } else if (condensed instanceof RollExpression) {
        return evalRolls(condensed);
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

function evalRolls(expression: RollExpression): Range {
    const terms = expression.value.terms;
    if (terms.length === 0) {
        return {min: 0, max: 0};
    } else if (terms.length === 1) {
        if ("operator" in terms[0]) {
            console.warn("Syntax error in term while trying to guess roll expression", terms[0]);
            return {min: Number.NaN, max: Number.NaN};
        }
        return evalNonOperator(terms[0])
    } else if (terms.length % 2 === 0) {
        console.warn("Syntax error while trying to guess roll. Even number of terms", terms);
        return {min: Number.NaN, max: Number.NaN};
    }
    const operators = chainableFromTerms(terms.slice(0, terms.length));

    return operators.reduce((acc, operator) => {
        return operator(acc);

    }, evalNonOperator(terms[terms.length - 1] as Die | NumericTerm/*must be otherwise roll would be invalid*/));
}

/**
 * Takes a list of terms and returns a list of functions that can be used to evaluate the roll.
 */
function chainableFromTerms(terms: RollTerm[]) {
    let operators = [];
    for (let i = 0; i < terms.length - 1; i = i + 2) {
        const prospectiveOperator = terms[i + 1];
        const prospectiveNumeric = terms[i];
        if (!("operator" in prospectiveOperator)) {
            console.warn("Syntax error in term while trying to guess roll expression", terms[i]);
            return [() => ({min: Number.NaN, max: Number.NaN})];
        }
        if (!("number" in prospectiveNumeric || ("roll" in prospectiveNumeric && isRoll(prospectiveNumeric.roll)))) {
            console.warn("Syntax error in term while trying to guess roll expression", terms[i]);
            return [() => ({min: Number.NaN, max: Number.NaN})];
        } else {
            if (prospectiveOperator.operator === "+") {
                operators.push((range: Range) => sortResult(evalNonOperator(prospectiveNumeric), range, (a, b) => a + b));
            } else if (prospectiveOperator.operator === "-") {
                operators.push((range: Range) => sortResult(evalNonOperator(prospectiveNumeric), range, (a, b) => a - b));
            } else if (prospectiveOperator.operator === "*") {
                operators.push((range: Range) => sortResult(evalNonOperator(prospectiveNumeric), range, (a, b) => a * b));
            } else if (prospectiveOperator.operator === "/") {
                operators.push((range: Range) => sortResult(evalNonOperator(prospectiveNumeric), range, (a, b) => a / b));
            }
        }
    }
    return operators;
}

function evalNonOperator(term: Exclude<RollTerm, OperatorTerm>) {
    if ("faces" in term) {
        return {min: term.number, max: term.number * term.faces};
    } else if ("number" in term) {
        return {min: term.number, max: term.number};
    } else if ("roll" in term) {
        const parentheticSubterms = term.roll.terms;
        const numTerms = parentheticSubterms.length;
        const operators:((x:Range)=> Range)[] = chainableFromTerms(term.roll.terms.slice(0, numTerms));
        return reduceTerms(operators, parentheticSubterms[numTerms - 1] as Exclude<RollTerm, OperatorTerm>);

    }
    exhaustiveMatchGuard(term)
}

function reduceTerms(operators: ((x:Range)=> Range)[], term: Exclude<RollTerm, OperatorTerm>): Range {
    return operators.reduce((acc, operator) => {
        return operator(acc);
    }, evalNonOperator(term));
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


