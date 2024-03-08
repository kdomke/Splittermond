import {parseCostString} from "./costParser.js";

const fields = foundry.data.fields;

/**
 * Represents the initial tax on an actor's health or focus pool.
 * Must not be negative
 *
 * @extends {foundry.abstract.DataModel<BaseCost>}
 * @property {number} _nonConsumed  the non-consumed portion (that is exhausted or channeled minus consumed) of the costs
 * @property {number} _consumed the exclusive consumed portion of the costs
 * @property {boolean} _isChanneled whether these costs represent channeled costs
 */
export class BaseCost extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            _nonConsumed: new fields.NumberField({
                required: true, blank: false, nullable: false,
                validate: (value) => value >= 0
            }),
            _consumed: new fields.NumberField({
                required: true, blank: false, nullable: false,
                validate: (value) => value >= 0
            }),
            _isChanneled: new fields.BooleanField({required: true, blank: false, nullable: false}),
        }
    }

    static parse(costString) {
        const parsedCost = parseCostString(costString);
        return new BaseCost.fromCost(parsedCost);
    }

    /**
     * @param {Cost} cost
     * @return {BaseCost}
     */
    static fromCost(cost) {
        return new BaseCost({
            _nonConsumed: cost.nonConsumed,
            _consumed: cost._consumed,
            _isChanneled: cost.isChanneled,
            _strict: cost.strict
        });
    }

    get isChanneled() {
        return this._isChanneled;
    }

    /**
     * Returns the exhausted cost. Will default to 1 if no costs are present and this represents ordinary costs.
     * @return {number}
     */
    get exhausted() {
        return this.isChanneled ? 0 : this._nonConsumed;
    }

    /**
     * Returns the channeled costs.
     * @return {number}
     */
    get channeled() {
        return this.isChanneled ? this._nonConsumed : 0;
    }

    get consumed() {
        return this._consumed;
    }

    /**
     * @param {Cost} costs
     */
    add(costs) {
        if ((costs.strict) && this._isChanneled !== costs.isChanneled) {
            return new this.constructor({_nonConsumed: this._nonConsumed, _consumed: this._consumed, _isChanneled: this._isChanneled});
        }
        const rawConsumed = this._consumed += costs._consumed;
        const remainder = rawConsumed < 0 ? rawConsumed : 0; //overflow of consumed costs for non consumed costs
        const consumed = Math.max(rawConsumed, 0);

        const rawNonConsumed = this._nonConsumed += costs.nonConsumed + remainder;
        const nonConsumed = Math.max(rawNonConsumed, 0); //we don't store negative cost values.
        return new this.constructor({_nonConsumed: nonConsumed, _consumed: consumed, _isChanneled: this._isChanneled});
    }

    /**
     * @param {Cost} costs
     */
    subtract(costs) {
        return this.add(costs.negate());
    }

    /**
     * @returns {boolean}
     */
    isZero() {
        return this._nonConsumed === 0 && this._consumed === 0;
    }

    /**
     * @override
     * @return {string}
     */
    toString() {
        return this.render();
    }

    /**
     * Converts this object into a splittermond string Representation
     * @override
     * @return {string}
     */
    render(){
        const totalCost = this.consumed + this.channeled + this.exhausted
        const channeledModifier = this.isChanneled && totalCost !== 0 ? "K" : "";
        const consumedModifier = this._consumed !== 0 ? `V${Math.abs(this._consumed)}` : "";
        return `${channeledModifier}${Math.abs(totalCost)}${consumedModifier}`;
    }
}