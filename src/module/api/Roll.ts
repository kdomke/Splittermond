export interface Die {
    faces: number;
    /**@internal*/_evaluated: boolean;
    results: { active: boolean, result: number }[]
}

export interface OperatorTerm {
    operator: string;
    /**@internal*/_evaluated: boolean;

}

export interface NumericTerm {
    number: number;
    /**@internal*/_evaluated: boolean;
}

export declare class Roll {
    evaluate: () => Promise<Roll>;
    /** Can only be used to evaluate deterministic roll will otherwise it throws an error
     * or returns 0 if not strict.
     */
    evaluateSync: (options?:{strict:boolean}) => Roll;
    clone(): Roll;
    /** Will contain all definite (evaluated and constant) components of the roll*/
    readonly result: string;
    readonly formula: string
    /**@internal*/_evaluated: boolean
    /**@internal*/_total: number
    readonly total: number
    dice: Die[]
    terms: (Die | OperatorTerm | NumericTerm)[]

    getTooltip(): Promise<string>;

    static fromTerms(terms: (Die | OperatorTerm | NumericTerm)[]): Roll;

    /**
     * @param formula a roll formula. Supports named parameters with @
     * @param data pass values to fill the formula template
     * @param options
     */
    constructor(formula: string, data?: Record<string, string>, options?: Record<string, any>)
}

export type FoundryRoll = InstanceType<typeof Roll>

export function isRoll(value: unknown): value is FoundryRoll {
    //We're not using instanceof, because the Roll class is only available when we have foundry
    return !!value && typeof value === "object" &&
        "result" in value &&  typeof value.result === "string" &&
        "formula" in value &&  typeof value.formula === "string" &&
        "total" in value && typeof value.total === "number" &&
        "evaluate" in value && typeof value.evaluate === "function" &&
        "evaluateSync" in value && typeof value.evaluateSync === "function" &&
        "getTooltip" in value && typeof value.getTooltip === "function";
}


export function addRolls(one: Roll, other: Roll): Roll {
    const oneTerms = one.terms
    const otherTerms = other.terms

    /*
     *Workaround for foundry bug https://github.com/foundryvtt/foundryvtt/issues/12080
     *
     * Since foundry allows that either all terms are evaluated or none, we don't need to bother checking 'other'
     */
    //TODO: Remove with Foundry V13
    const isEvaluated = one._evaluated;
    const addTerm = isEvaluated ? Terms.getEvaluatedAddTerm() : Terms.getUnevaluatedAddTerm();
    if (isEvaluated) {
        oneTerms.forEach(term => term._evaluated = true)
        otherTerms.forEach(term => term._evaluated = true)
    }
    return Roll.fromTerms([...oneTerms, addTerm, ...otherTerms])
}

export function sumRolls(rolls: Roll[]): Roll {
    if (rolls.length === 0) {
        return new Roll("0")
    }

    //TODO: Remove with Foundry V13, see above
    const isEvaluated = rolls.some(r => r._evaluated);
    const addTerm = isEvaluated ? Terms.getEvaluatedAddTerm() : Terms.getUnevaluatedAddTerm();

    const terms: (Die | OperatorTerm | NumericTerm)[] = []
    rolls.map(r => r.terms)
        .forEach(r => {
            terms.push(...r);
            terms.push(addTerm)
        })
    terms.pop()
    terms.forEach(term => term._evaluated = isEvaluated) //TODO: Remove with Foundry V13, see above

    return Roll.fromTerms(terms);
}

namespace Terms {
    let evaluatedAddTerm: OperatorTerm | null = null;
    let unEvaluatedAddTerm: OperatorTerm | null = null;

    export function getEvaluatedAddTerm(): OperatorTerm {
        if (evaluatedAddTerm === null) {
            evaluatedAddTerm = new Roll("0d0+0").terms[1] as OperatorTerm
            evaluatedAddTerm._evaluated = true;
        }
        return evaluatedAddTerm
    }

    export function getUnevaluatedAddTerm(): OperatorTerm {
        if (unEvaluatedAddTerm === null) {
            unEvaluatedAddTerm = new Roll("0d0+0").terms[1] as OperatorTerm
        }
        return unEvaluatedAddTerm
    }
}