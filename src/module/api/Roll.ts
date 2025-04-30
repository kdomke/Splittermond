import {foundryApi} from "./foundryApi";

/*
    Note: There also exist 'FunctionalTerm' and 'StringTerm' in the foundry codebase. But the former is too
    complicated to handle for us (we'll just have functional terms remain as rolls) and what the latter does
    I do not yet understand (It might be for descriptions, which we don't need).
 */
export type RollTerm = Die | OperatorTerm | NumericTerm | ParentheticTerm

export interface Die {
    number: number;
    faces: number;
    readonly formula:string
    /**
     * Contains dice postprocessing, like keep lowest or similar
     */
    modifiers: string[]
    results: { active: boolean, result: number }[]

    /**@internal*/_evaluated: boolean;
}

export interface OperatorTerm {
    operator: string;
    readonly formula:string
    /**@internal*/_evaluated: boolean;

}

export interface ParentheticTerm {
    roll: FoundryRoll;
    /**@internal*/_evaluated: boolean;
}

export interface NumericTerm {
    number: number;
    readonly expression: string;
    readonly total: number;
    readonly formula:string

    /**@internal*/_evaluated: boolean;
}

export declare class Roll {
    evaluate: () => Promise<Roll>;
    /** Can only be used to evaluate deterministic roll will otherwise it throws an error
     * or returns 0 if not strict.
     */
    evaluateSync: (options?: { strict: boolean }) => Roll;

    clone(): Roll;

    /** Will contain all definite (evaluated and constant) components of the roll*/
    readonly result: string;
    readonly formula: string
    /**@internal*/_evaluated: boolean
    /**@internal*/_total: number
    readonly total: number
    dice: Die[]
    terms: (Die | OperatorTerm | NumericTerm | ParentheticTerm)[]

    getTooltip(): Promise<string>;

    resetFormula(): void;

    static validate(formula:string):boolean

    static fromTerms(terms: RollTerm[]): Roll;

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
        "result" in value && typeof value.result === "string" &&
        "formula" in value && typeof value.formula === "string" &&
        "total" in value && typeof value.total === "number" &&
        "evaluate" in value && typeof value.evaluate === "function" &&
        "evaluateSync" in value && typeof value.evaluateSync === "function" &&
        "getTooltip" in value && typeof value.getTooltip === "function";
}

export function isNumericTerm(value: RollTerm): value is NumericTerm {
    return "number" in value && !("faces" in value) && !("operator" in value) && !("roll" in value);
}

export function isOperatorTerm(value: RollTerm): value is OperatorTerm {
    return "operator" in value && !("faces" in value) && !("number" in value) && !("roll" in value);
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

    const terms: (Die | OperatorTerm | NumericTerm | ParentheticTerm)[] = []
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
            evaluatedAddTerm = foundryApi.rollInfra.plusTerm()
            evaluatedAddTerm._evaluated = true;
        }
        return evaluatedAddTerm
    }

    export function getUnevaluatedAddTerm(): OperatorTerm {
        if (unEvaluatedAddTerm === null) {
            unEvaluatedAddTerm = foundryApi.rollInfra.plusTerm()
        }
        return unEvaluatedAddTerm
    }
}