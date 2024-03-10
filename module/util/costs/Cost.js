import {PrimaryCost} from "./PrimaryCost.js";
import {fields, SplittermondDataModel} from "../../data/SplittermondDataModel.js";

/**
 * Represents a tax on an actor's health or focus pool.
 * in form of a parsed statement. It has to be classified as {@link PrimaryCost }or {@link CostModifier} before
 * it can be used in calculations. Only {@link PrimaryCost} can be applied to a health or focus pool.
 */
export class Cost {
    /**
     * Accepts the split portions of a Splittermond cost string. The numeric components must have an equal sign
     * @param {number} nonConsumed  the non-consumed portion (that is exhausted or channeled minus consumed) of the costs
     * @param {number} consumed the exclusive consumed portion of the costs
     * @param {boolean} isChanneled whether these costs represent channeled costs
     * @param {boolean} strict flag to enforce that this cost only applies to costs with the same channeled flag
     */
    constructor(nonConsumed, consumed, isChanneled, strict = false) {
        const rawNonConsumed = Number.isFinite(nonConsumed) && nonConsumed !== 0 ? nonConsumed : 0;
        const rawConsumed = Number.isFinite(consumed) && consumed !== 0 ? consumed : 0;
        const sameSign = rawNonConsumed <= 0 && rawConsumed <= 0 || rawNonConsumed >= 0 && rawConsumed >= 0;
        this.nonConsumed = sameSign ? rawNonConsumed : 0; //the exclusive non consumed costs
        this._consumed = sameSign ? rawConsumed : 0; //the exclusive consumed costs
        this.isChanneled = !!isChanneled;
        this.strict = !!strict;
    }

    asPrimaryCost() {
        if (this.nonConsumed < 0 || this._consumed < 0) {
            throw new Error("Primary costs must not be negative");
        }
        return new PrimaryCost({
            _nonConsumed: this.nonConsumed,
            _consumed: this._consumed,
            _isChanneled: this.isChanneled,
            _strict: this.strict
        });
    }

    asModifier() {
        return new CostModifier({
            /**@type number*/ _channeled: (this.isChanneled || !this.strict) ? this.nonConsumed : 0,
            /**@type number*/ _channeledConsumed: (this.isChanneled || !this.strict) ? this._consumed : 0,
            /**@type number*/ _exhausted: (!this.isChanneled || !this.strict) ? this.nonConsumed : 0,
            /**@type number*/ _consumed: (!this.isChanneled || !this.strict) ? this._consumed : 0,
        });
    }

    /**
     * Give a faithful string representation of the costs, as in it will display zero costs and negative costs
     * Use the render method if you want to display costs to the user.
     * @override
     * @return {string}
     */
    toString() {
        const totalCost = this._consumed + this.nonConsumed;
        const channeledModifier = this.isChanneled && totalCost !== 0 ? "K" : "";
        const consumedModifier = this._consumed !== 0 ? `V${Math.abs(this._consumed)}` : "";
        return `${totalCost < 0 ? "-" : ""}${channeledModifier}${Math.abs(totalCost)}${consumedModifier}`;
    }
}

export class CostModifier extends SplittermondDataModel{
    static defineSchema() {
        return {
            _channeled: new foundry.data.fields.NumberField({required: true, nullable: false}),
            _channeledConsumed: new foundry.data.fields.NumberField({required: true, nullable: false}),
            _exhausted: new foundry.data.fields.NumberField({required: true, nullable: false}),
            _consumed: new foundry.data.fields.NumberField({required: true, nullable: false}),
        }
    }

    /**
     * @param {CostModifier} costs
     * @return {CostModifier}
     */
    add(costs) {
        const newChanneled = this._channeled + costs._channeled;
        const newChanneledConsumed = this._channeledConsumed + costs._channeledConsumed;
        const newExhausted = this._exhausted + costs._exhausted;
        const newConsumed = this._consumed + costs._consumed;
        return new this.constructor({
                _channeled: newChanneled,
                _channeledConsumed: newChanneledConsumed,
                _exhausted: newExhausted,
                _consumed: newConsumed
            }
        );
    }

    /**
     * @param {CostModifier} cost
     */
    subtract(cost) {
        return this.add(cost.negate());
    }

    negate() {
        return new this.constructor({
            _channeled: -1 * this._channeled,
            _channeledConsumed: -1 * this._channeledConsumed,
            _exhausted: -1 * this._exhausted,
            _consumed: -1 * this._consumed,
        });
    }

    /**
     * @param {PrimaryCost} primaryCost
     * @returns {number}
     */
    getConsumed(primaryCost) {
        return primaryCost.isChanneled ? this._channeledConsumed : this._consumed;
    }

    /**
     * @param {PrimaryCost} primaryCost
     * @returns {number}
     */
    getNonConsumed(primaryCost) {
        return primaryCost.isChanneled ? this._channeled : this._exhausted;
    }
}
