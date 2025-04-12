import {
    type Expression as ScalarExpression,
    plus as scalarPlus,
    minus as scalarMinus,
    times as scalarTimes,
    of as scalarOf,
    dividedBy as scalarDividedBy,
} from "./scalar/definitions";
import {evaluate as scalarEvaluate} from "./scalar/evaluation";
import {condense as scalarCondense, isZero as scalarIsZero} from "./scalar/condenser";
import {asString as scalarAsString} from "./scalar/Stringifier";
import {isExpression as isScalarExpression} from "./scalar/definitions";

import {
    type CostExpression,
    of as costOf,
    plus as costPlus,
    minus as costMinus,
    times as costTimes,
} from "./cost/definitions";
import {isExpression as isCostExpression} from "./cost/definitions";
import {evaluate as costEvaluate} from "./cost/evaluation";
import {condense as costCondense, isZero as costIsZero} from "./cost/condenser";
import {asString as costAsString} from "./cost/Stringifier";
import {CostModifier} from "../../../util/costs/Cost";
import {exhaustiveMatchGuard} from "./util";

export {roll, abs, ref as scalarRef, isExpression as isScalarExpression} from "./scalar/definitions"
export * from "./scalar/Comparator"
export {ref as costRef, isExpression as isCostExpression} from "./cost/definitions"
export {CostExpression, ScalarExpression}


export type Expression = ScalarExpression | CostExpression;
type Like<T> = Exclude<T, ScalarExpression> extends never ? ScalarExpression : CostExpression;


export function plus<T extends Expression>(left: T, right: Like<T>): Like<T> {
    if (isScalarExpression(left) && isScalarExpression(right)) {
        return scalarPlus(left, right) as Like<typeof left>;
    } else if (isCostExpression(left) && isCostExpression(right)) {
        return costPlus(left, right) as Like<typeof left>;
    } else {
        throw new Error("Cannot add expressions of different types");
    }
}

export function minus<T extends Expression>(left: T, right: Like<T>): Like<T> {
    if (isScalarExpression(left) && isScalarExpression(right)) {
        return scalarMinus(left, right) as Like<typeof left>;
    } else if (isCostExpression(left) && isCostExpression(right)) {
        return costMinus(left, right) as Like<typeof left>;
    } else {
        throw new Error("Cannot subtract expressions of different types");
    }
}

type Factor<T extends Expression> = Exclude<T, ScalarExpression> extends never ? Expression : ScalarExpression;
type Product<T extends Expression, U extends Expression> = Exclude<T, ScalarExpression> extends never ?
    Exclude<U, ScalarExpression> extends never ? ScalarExpression : CostExpression : CostExpression;

export function times<T extends Expression, U extends Factor<T>>(left: T, right: U): Product<T, U> {
    if (isScalarExpression(left) && isScalarExpression(right)) {
        return scalarTimes(left, right) as Product<typeof left, typeof right>;
    } else if (isScalarExpression(left) && isCostExpression(right)) {
        return costTimes(left, right) as Product<typeof left, typeof right>;
    } else if (isCostExpression(left) && isScalarExpression(right)) {
        return costTimes(right, left) as Product<typeof left, typeof right>;
    } else {
        throw new Error("Multiplication of two costs is ill-defined");
    }
}

export function dividedBy<T>(left: T, right: ScalarExpression): Like<T> {
    if (isScalarExpression(left) && isScalarExpression(right)) {
        return scalarDividedBy(left, right) as Like<typeof left>/*TS compiler fails to understand this*/;
    } else if (isCostExpression(left) && isScalarExpression(right)) {
        return costTimes(scalarDividedBy(of(1), right), left) as Like<typeof left>/*TS compiler fails to understand this*/;
    } else {
        throw new Error("Multiplication of two costs is ill-defined");
    }
}

type ExpressionOf<T extends number | CostModifier> = Exclude<T, number> extends never ? ScalarExpression : CostExpression;

export function of<T extends number | CostModifier>(amount: T): ExpressionOf<T> {
    if (typeof amount === "number") {
        return scalarOf(amount) as ExpressionOf<typeof amount>/*TS compiler fails to see this*/;
    } else if (amount instanceof CostModifier) {
        return costOf(amount) as ExpressionOf<typeof amount>/*TS compiler fails to see this*/;
    }
    exhaustiveMatchGuard(amount);
}

type Evaluated<T> = Exclude<T, ScalarExpression> extends never ? number : CostModifier;

export function evaluate<T extends Expression>(expression: T): Evaluated<T> {
    if (isScalarExpression(expression)) {
        return scalarEvaluate(expression) as Evaluated<typeof expression>;
    } else if (isCostExpression(expression)) {
        return costEvaluate(expression) as Evaluated<typeof expression>;
    }
    exhaustiveMatchGuard(expression);
}

export function condense<T extends Expression>(expression: T): Like<T> {
    if (isScalarExpression(expression)) {
        return scalarCondense(expression) as Like<typeof expression>;
    } else if (isCostExpression(expression)) {
        return costCondense(expression) as Like<typeof expression>;
    }
    exhaustiveMatchGuard(expression);
}

export function asString(expression: Expression): string {
    if (isScalarExpression(expression)) {
        return scalarAsString(expression)
    } else if (isCostExpression(expression)) {
        return costAsString(expression)
    }
    exhaustiveMatchGuard(expression);
}

export function isZero(expression: Expression): boolean {
    if (isScalarExpression(expression)) {
        return scalarIsZero(expression);
    } else if (isCostExpression(expression)) {
        return costIsZero(expression);
    }
    exhaustiveMatchGuard(expression);
}
