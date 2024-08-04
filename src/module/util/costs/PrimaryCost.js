import {parseCostString} from "./costParser.js";
import {fields, SplittermondDataModel} from "../../data/SplittermondDataModel.js";


/**
 * Represents the initial tax on an actor's health or focus pool.
 * Must not be negative
 *
 * @extends {foundry.abstract.DataModel<PrimaryCost>}
 * @property {number} _nonConsumed  the non-consumed portion (that is exhausted or channeled minus consumed) of the costs
 * @property {number} _consumed the exclusive consumed portion of the costs
 * @property {boolean} _isChanneled whether these costs represent channeled costs
 */
export class PrimaryCost extends SplittermondDataModel{
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
        return new PrimaryCost.fromCost(parsedCost);
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
     * @param {CostModifier} costs
     * @return {PrimaryCost}
     */
    add(costs) {
        const modifiyNonConsumed = costs.getNonConsumed(this);
        const modifiyConsumed = costs.getConsumed(this);
        const rawConsumed = this._consumed + modifiyConsumed;
        const remainder = rawConsumed < 0 ? rawConsumed : 0; //overflow of consumed costs for non consumed costs
        const consumed = Math.max(rawConsumed, 0);

        const rawNonConsumed = this._nonConsumed + modifiyNonConsumed + remainder;
        const nonConsumed = Math.max(rawNonConsumed, 0); //we don't store negative cost values.
        return new this.constructor({_nonConsumed: nonConsumed, _consumed: consumed, _isChanneled: this._isChanneled});
    }

    /**
     * @param {CostModifier} costs
     * @return {PrimaryCost}
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
     * alias for render
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