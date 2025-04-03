import {Die, FoundryRoll, NumericTerm, OperatorTerm} from "module/api/Roll";
import {foundryApi} from "../../module/api/foundryApi";
import sinon, {SinonSandbox} from "sinon";

// roll.mock.ts
class MockDie implements Die {
    constructor(
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
}

export class MockRoll implements FoundryRoll{
    /**@internal*/_evaluated: boolean;
    /**@internal*/_total: number;
    terms: Array<Die | OperatorTerm | NumericTerm>;
    dice: Die[];

    constructor(
        public formula: string,
        public data?: Record<string, string>,
        public options?: Record<string, any>
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

            const die = new MockDie(faces, dieResults);
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
        return new MockRoll(this.formula, this.data, this.options);
    }

    async getTooltip(): Promise<string> {
        return `<div class="dice-tooltip">${this.formula} = ${this.total}</div>`;
    }

    static fromTerms(terms: Array<Die | OperatorTerm | NumericTerm>): MockRoll {
        const formula = terms
            .map(term => {
                if ('faces' in term) return `${term.results.length}d${term.faces}`;
                if ('operator' in term) return term.operator;
                return term.number.toString();
            })
            .join(' ');
        return new MockRoll(formula);
    }
}

// Test utility functions
export function createTestRoll(
    formula: string,
    results: number[],
    modifier = 0
): FoundryRoll{
    const terms: Array<Die | OperatorTerm | NumericTerm> = [];
    const dice: Die[] = [];

    if (results.length > 0) {
        const die = new MockDie(
            Math.max(...results),
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
