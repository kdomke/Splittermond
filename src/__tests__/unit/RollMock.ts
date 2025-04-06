import {Die, FoundryRoll, NumericTerm, OperatorTerm} from "module/api/Roll";
import {foundryApi} from "../../module/api/foundryApi";
import sinon, {SinonSandbox} from "sinon";

// roll.mock.ts
class MockDie implements Die {
    modifier:string[]=[]
    constructor(
        public number:number,
        public faces: number,
        public results: Array<{ active: boolean; result: number }>,
        public _evaluated = false
    ) {}
}

class MockOperatorTerm implements OperatorTerm {
    constructor(
        public operator: string,
        public _evaluated = false
    ) {}
}

class MockNumericTerm implements NumericTerm {
    constructor(
        public number: number,
        public _evaluated = false
    ) {}

    get total(){
        return this.number;
    }

    get expression(){
        return `${this.number}`
    }
}

export class MockRoll implements FoundryRoll{
    /**@internal*/_evaluated: boolean;
    /**@internal*/_total: number;
    terms: Array<Die | OperatorTerm | NumericTerm>;
    dice: Die[];

    constructor(
        public formula: string,
    ) {
        this._evaluated = false;
        this._total = 0;
        this.terms = [];
        this.dice = [];

        // Simple formula parsing for common cases
        const match = formula.replace(/ /g, "").match(/(\d+)d(\d+)([+-]\d+)?/);
        if (match) {
            const diceCount = parseInt(match[1]);
            const faces = parseInt(match[2]);
            const modifier = match[3] ? parseInt(match[3]) : null;

            // Create dice terms
            const dieResults = Array.from({ length: diceCount }, () => ({
                active: true,
                result: Math.floor(Math.random() * faces) + 1
            }));

            const die = new MockDie(diceCount, faces, dieResults);
            this.terms.push(die);
            this.dice.push(die);

            if (modifier !== null) {
                this.terms.push(
                    new MockOperatorTerm(modifier > 0 ? '+' : '-'),
                    new MockNumericTerm(Math.abs(modifier))
                );
            }
        }
    }

    get result(): string {
        return this.terms
            .map(term => {
                if ('results' in term) return term.results.map(r => r.result).join(' + ');
                if ('operator' in term) return term.operator;
                return term.number.toString();
            })
            .join(' ');
    }

    get total(): number {
        return this._evaluated ? this._total : 0;
    }

    async evaluate(): Promise<MockRoll> {
        return Promise.resolve(this.evaluateSync());
    }

    evaluateSync(){
        if (!this._evaluated) {
            this._total = this.terms.reduce((sum, term) => {
                if ('results' in term) {
                    return sum + term.results.reduce((dSum, r) => dSum + r.result, 0);
                }
                if ('number' in term) {
                    return sum + term.number;
                }
                return sum;
            }, 0);

            this._evaluated = true;
            this.terms.forEach(term => term._evaluated = true);
        }
        return this;
    }
    clone(){
        const roll = new MockRoll(this.formula);
        roll.terms = this.terms;
        roll.dice = this.dice;
        roll._total = this._total
        roll._evaluated = this._evaluated;
        return roll;
    }

    async getTooltip(): Promise<string> {
        return `<div class="dice-tooltip">${this.formula} = ${this.total}</div>`;
    }

    static fromTerms(terms: Array<Die | OperatorTerm | NumericTerm>): MockRoll {
        const formula = terms
            .map(term => {
                if ('faces' in term) return `${term.number}d${term.faces}`;
                if ('operator' in term) return term.operator;
                return term.number.toString();
            })
            .join(' ');
        const roll = new MockRoll(formula);
        roll.terms = terms;
        roll.dice = terms.filter(term => "faces" in term);
        return roll;
    }
}

// Test utility functions
export function createTestRoll(
    formula: `${number}d${number}`|`${number}d${number}+${number}`,
    results: number[],
    modifier = 0
): FoundryRoll{
    const terms: Array<Die | OperatorTerm | NumericTerm> = [];
    const dice: Die[] = [];

    if (results.length > 0) {
        const die = new MockDie(
            results.length,
            parseInt(/(?<=d)\d/.exec(formula)![0]),
            results.map(result => ({ active: true, result })),
            true
        );
        terms.push(die);
        dice.push(die);
    }

    if (modifier !== 0) {
        terms.push(
            new MockOperatorTerm(modifier > 0 ? '+' : '-'),
            new MockNumericTerm(Math.abs(modifier))
        );
    }

    const roll = new MockRoll(formula);
    roll.terms = terms;
    roll.dice = dice;
    roll._total = results.reduce((a, b) => a + b, 0) + modifier;
    roll._evaluated = true;

    return roll;
}

// Sinon stub setup helper
export function stubFoundryRoll(rollInstance: FoundryRoll, sandbox:SinonSandbox=sinon) {
    return sandbox.stub(foundryApi, 'roll').returns(rollInstance);
}
