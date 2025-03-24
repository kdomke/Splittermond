export type Expression =
    AmountExpression
    | AddExpression
    | SubtractExpression
    | MultiplyExpression
    | DivideExpression
    | ReferenceExpression

export const expressions = {
    of(amount:number){
        return new AmountExpression(amount)
    },
    plus(left:Expression, right:Expression){
        return new AddExpression(left, right)
    },
    minus(left:Expression, right:Expression){
        return new SubtractExpression(left, right)
    },
    times(left:Expression, right:Expression){
        return new MultiplyExpression(left, right)
    },
    dividedBy(left:Expression, right:Expression){
        return new DivideExpression(left, right)
    },
}

export class AmountExpression {
    constructor(public readonly amount: number) {
    }
}

export class ReferenceExpression {
    constructor(public readonly propertyPath: string, public readonly source: object) {
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

