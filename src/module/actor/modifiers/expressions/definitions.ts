import {FoundryRoll, isRoll, RollTerm} from "../../../api/Roll";
import {foundryApi} from "../../../api/foundryApi";

export type Expression =
    AmountExpression
    | ZeroExpression
    | OneExpression
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
    if (amount === 0) {
        return new ZeroExpression()
    } else if (amount === 1) {
        return new OneExpression();
    } else {
        return new AmountExpression(amount)
    }
}

export function plus(left: Expression, right: Expression) {
    if (left instanceof ZeroExpression) {
        return right;
    } else if (right instanceof ZeroExpression) {
        return left;
    } else {
        return new AddExpression(left, right);
    }
}

export function minus(left: Expression, right: Expression) {
    if (left instanceof ZeroExpression) {
        return times(of(-1), right);
    } else if (right instanceof ZeroExpression) {
        return left;
    } else {
        return new SubtractExpression(left, right);
    }
}

export function times(left: Expression, right: Expression) {
    if (left instanceof ZeroExpression) {
        return of(0)
    } else if (left instanceof OneExpression) {
        return right;
    } else if (right instanceof ZeroExpression) {
        return of(0)
    } else if (right instanceof OneExpression) {
        return left;
    } else {
        return new MultiplyExpression(left, right);
    }
}

export function dividedBy(left: Expression, right: Expression) {
    if (right instanceof ZeroExpression) {
        throw new Error("Division by zero")
    } else if (left instanceof ZeroExpression) {
        return of(0)
    } else if (right instanceof OneExpression) {
        return left;
    } else {
        return new DivideExpression(left, right);
    }
}


export function abs(arg: Expression) {
    return new AbsExpression(arg);
}

/**
 * Masks the time it actually takes to evaluate a roll, by returning a cheap intermediary, or
 * the last value when that current roll has not yet finished.
 */
export class RollExpression {
    private result: number | null = null;
    private evaluating: boolean = false;

    constructor(public readonly value: FoundryRoll) {
        this.requestProperEvaluation();
    }


    evaluate(): number {
        if (this.result === null) {
            return this.cheapPreliminaryValue();
        }
        const lastResult = this.result;
        this.requestProperEvaluation();
        return lastResult;
    }

    private requestProperEvaluation() {
        if (this.evaluating) {
            return;
        }

        this.evaluating = true;
        const result = this.trySyncEvaluate();
        if (result.success) {
            this.result = result.result;
            this.evaluating = false;
            return;
        } else {
            this.value.clone().evaluate().then(result => {
                this.result = result.total
                this.evaluating = false;
            });
        }
    }

    private trySyncEvaluate() {
        try {
            const result = this.value.clone().evaluateSync({strict: true});
            return {result: result.total, success: true};
        } catch (e) {
            return {result: null, success: false};
        }
    }

    private cheapPreliminaryValue() {
        const preEvaluatedRoll = this.value.clone().terms
            .map(term => this.evaluateDiceTerm(term));
        return foundryApi.rollInfra.rollFromTerms(preEvaluatedRoll).evaluateSync().total;
    }

    private evaluateDiceTerm(term: RollTerm){
        if("roll" in term && isRoll(term.roll)) {
           const simplifiedRoll = foundryApi.rollInfra.rollFromTerms(term.roll.clone().terms.map(t => this.evaluateDiceTerm(t)));
           return foundryApi.rollInfra.numericTerm(simplifiedRoll.evaluateSync().total);
        }
        if ("faces" in term && "number" in term) {
            const cheapResult = Array.from({length: term.number}, (_, __) => this.cheapDiceThrow(term.faces))
                .reduce((a, b) => a + b, 0);
            return foundryApi.rollInfra.numericTerm(cheapResult);
        }
        return term;
    }

    private cheapDiceThrow(faces: number) {
        const minDiceValue = 1
        return Math.floor(Math.random() * (faces - minDiceValue + 1)) + minDiceValue;
    }
}

export class AmountExpression {
    constructor(public readonly amount: number) {
    }
}

class ZeroExpression extends AmountExpression {
    constructor() {
        super(0);
    }
}

class OneExpression extends AmountExpression {
    constructor() {
        super(1);
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

