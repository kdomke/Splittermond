import {FoundryRoll} from "../../../api/Roll";

export type Expression =
    AmountExpression
    | RollExpression
    | AddExpression
    | SubtractExpression
    | MultiplyExpression
    | DivideExpression
    | ReferenceExpression
    | AbsExpression

export function isExpression(value: unknown): value is Expression {
    return value instanceof AmountExpression
        || value instanceof AddExpression
        || value instanceof SubtractExpression
        || value instanceof MultiplyExpression
        || value instanceof DivideExpression
        || value instanceof ReferenceExpression
        || value instanceof AbsExpression
}

export function of(amount: number) {
    return new AmountExpression(amount)
}

export function plus(left: Expression, right: Expression) {
    return new AddExpression(left, right);
}

export function minus(left: Expression, right: Expression) {
    return new SubtractExpression(left, right);
}

export function times(left: Expression, right: Expression) {
    return new MultiplyExpression(left, right);
}

export function dividedBy(left: Expression, right: Expression) {
    return new DivideExpression(left, right);
}

export function abs(arg: Expression) {
    return new AbsExpression(arg);
}

export class RollExpression {
    constructor(public readonly value: FoundryRoll) {
    }
}

export class AmountExpression {
    constructor(public readonly amount: number) {
    }
}

export class ReferenceExpression {
    constructor(public readonly propertyPath: string, public readonly source: object, public readonly stringRep: string) {
    }
}

export class AddExpression {
    constructor(public readonly left: Expression, public readonly right: Expression) {
    }
}

export class SubtractExpression {
    constructor(public readonly left: Expression, public readonly right: Expression) {
    }
}

export class MultiplyExpression {
    constructor(public readonly left: Expression, public readonly right: Expression) {
    }
}

export class DivideExpression {
    constructor(public readonly left: Expression, public readonly right: Expression) {
    }
}

export class AbsExpression {
    constructor(public readonly arg: Expression) {
    }
}

