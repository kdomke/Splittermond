/**
 * Represents a tax on an actor's health or focus pool.
 */
export class Cost {
    /**
     * Accepts the split portions of a Splittermond cost string. The numeric components must have an equal sign
     * @param {number} nonConsumed  the non-consumed portion (that is exhausted or channeled minus consumed) of the costs
     * @param {number} consumed the exclusive consumed portion of the costs
     * @param {boolean} isChanneled whether these costs represent channeled costs
     * @param {boolean} strict flag to enforce that this cost only applies to costs with the same channeled flag
     */
    constructor(nonConsumed, consumed, isChanneled,strict=false) {
        const rawNonConsumed =  Number.isFinite(nonConsumed)&& nonConsumed !== 0 ? nonConsumed: 0;
        const rawConsumed =  Number.isFinite(consumed) && consumed !== 0 ? consumed: 0;
        const sameSign = rawNonConsumed <= 0 && rawConsumed <= 0 || rawNonConsumed >= 0 && rawConsumed >= 0;
        this.nonConsumed =  sameSign ? rawNonConsumed : 0; //the exclusive non consumed costs
        this._consumed = sameSign ? rawConsumed : 0; //the exclusive consumed costs
        this.isChanneled = !!isChanneled;
        this.strict = !!strict;
    }


    #renderNonConsumed(){ //jshint ignore:line
        return this._consumed <= 0 && this.nonConsumed <= 0? 0:this.nonConsumed;
    }
    /**
     * Returns the exhosted cost. Will default to 1 if no costs are present and this represents ordinary costs.
     * @return {number}
     */
    get exhausted() {
        return this.isChanneled ? 0 : this.#renderNonConsumed(); //jshint ignore:line
    }

    /**
     * Returns the channeled costs. Will default to 1 if no costs are present and this represents channeled costs.
     * @return {number}
     */
    get channeled() {
        return this.isChanneled ? this.#renderNonConsumed(): 0; //jshint ignore:line
    }

    get consumed() {
        return this._consumed < 0 ? 0 : this._consumed;
    }

    /**
     * @param {Cost} costs
     */
    add(costs) {
        if ((this.strict || costs.strict) && this.isChanneled !== costs.isChanneled){
           return new this.constructor(this.nonConsumed, this._consumed, this.isChanneled, this.strict);
        }
        const rawConsumed = this._consumed += costs._consumed;
        const remainder = rawConsumed < 0 ? rawConsumed : 0; //overflow of consumed costs for non consumed costs
        const consumed = Math.max(rawConsumed, 0);

        const rawNonConsumed = this.nonConsumed += costs.nonConsumed + remainder;
        const nonConsumed = Math.max(rawNonConsumed, 0); //we don't store negative cost values.
        return new this.constructor(nonConsumed, consumed, this.isChanneled, this.strict);
    }

    /**
     * @param {Cost} costs
     */
    subtract(costs) {
        return this.add(costs.negate());
    }

    negate() {
        return new this.constructor(-this.nonConsumed, -this._consumed, this.isChanneled);
    }

    /**
     * @returns {boolean}
     */
    isZero(){
        return this.nonConsumed === 0 && this._consumed === 0;
    }

    /**
     * Renders the costs as they would affect the respective pool of the actor.
     * @return {string}
     */
    render() {
        const totalCost = this.#renderNonConsumed() + this.consumed; //jshint ignore:line
        const channeledModifier = this.isChanneled && totalCost !== 0 ? "K" : "";
        const consumedModifier = this.consumed !== 0 ? `V${this.consumed}` : "";
        return `${channeledModifier}${totalCost}${consumedModifier}`;
    }

    /**
     * Give a faithful string representation of the costs, as in it will display zero costs and negative costs
     * Use the render method if you want to display costs to the user.
     * @override
     * @return {string}
     */
    toString() {
        const totalCost = this._consumed + this.nonConsumed;
        const channeledModifier = this.isChanneled && totalCost !== 0? "K" : "";
        const consumedModifier = this._consumed !== 0 ? `V${Math.abs(this._consumed)}` : "";
        return `${totalCost<0?"-":""}${channeledModifier}${Math.abs(totalCost)}${consumedModifier}`;
    }
}
