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

export const expressions = {
    of(amount: number) {
        return new AmountExpression(amount)
    },
    plus(left: Expression, right: Expression) {
        return new AddExpression(left, right)
    },
    minus(left: Expression, right: Expression) {
        return new SubtractExpression(left, right)
    },
    times(left: Expression, right: Expression) {
        return new MultiplyExpression(left, right)
    },
    dividedBy(left: Expression, right: Expression) {
        return new DivideExpression(left, right)
    },
    abs(arg: Expression) {
        return new AbsExpression(arg)
    }
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

