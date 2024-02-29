import {parseCostString} from "../../costs/costParser.js";
import {Cost} from "../../costs/Cost.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SpellMessageActionsManager,never>}
 * @property {CostAction} focus
 * @property {TickAction} ticks
 * @property {CostAction} damage
 * @property {{used:boolean, available:boolean}} splinterPoint
 */
export class SpellMessageActionsManager extends foundry.abstract.DataModel {

    /**
     * @param {SplittermondSpellData} spell
     * @return {SpellMessageActionsManager}
     */
    static initialize(spell) {
        const spellActionManagerData = {
            focus: {
                original: spell.costs,
                adjusted: spell.costs
            },
            ticks: {original: 3, adjusted: 3},
            damage: {
                original:  spell.damage ? spell.damage : "0",
                adjusted: spell.damage ? spell.damage : "0",
                available: !!spell.damage && spell.damage !== "0",
            }
        };
        return new SpellMessageActionsManager(spellActionManagerData);
    }

    static defineSchema() {
        return {
            //caster
            //target
            focus: new fields.EmbeddedDataField(FocusAction, {required: true, blank: false, nullable: false}),
            ticks: new fields.EmbeddedDataField(TickAction, {required: true, blank: false, nullable: false}),
            damage: new fields.EmbeddedDataField(DamageAction, {required: true, blank: false, nullable: false}),
            splinterPoint: new fields.SchemaField(
                {
                    used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
                    available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
                }, {required: true, blank: false, nullable: false})
        }
    }

    applyDamage() {
        this.damage.used = true;
    }

    advanceToken() {
        this.ticks.used = true;
    }

    consumeFocus() {
        this.focus.used = true;
    }

    useSplinterPoint() {
        this.splinterPointUsed = true;
    }
}


/**
 * @extends {foundry.abstract.DataModel<TickAction,never>}
 * @property {number} original
 * @property {number} adjusted
 * @property {boolean} used
 */
class TickAction extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            original: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
            adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
            used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        }
    }

    /** @param {number} amount */
    add(amount) {
        if (this.used){
            console.warn("Attempt alter a used action");
            return;
        }
        this.adjusted += amount;
    }

    /** @param {number} amount */
    subtract(amount) {
        if (this.used){
            console.warn("Attempt alter a used action");
            return;
        }
        this.adjusted -= amount;
    }

    get cost(){
        return `${this.adjusted > 0 ? this.adjusted : 1}`;
    }

}

/**
 * @extends {foundry.abstract.DataModel<CostAction,never>}
 * @property {string} original
 * @property {string} adjusted
 * @property {boolean} used
 * @property {boolean} available
 */
class CostAction extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            original: new fields.StringField({required: true, blank: false, nullable: false}),
            adjusted: new fields.StringField({required: true, blank: false, nullable: false}),
            used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
            available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        }
    }

    /** @param {string} cost */
    addCost(cost) {
        if (this.used){
            console.warn("Attempt alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost, true);
        this.adjusted = parseCostString(this.adjusted).add(costAdjustment).toString();
    }

    /** @param {string} cost */
    subtractCost(cost) {
        if (this.used){
            console.warn("Attempt to alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost);
        this.adjusted = parseCostString(this.adjusted).subtract(costAdjustment).toString();
    }

    get cost(){
        throw new Error("Override me!")
    }

}


class FocusAction extends CostAction {

    get cost(){
        let cost = parseCostString(this.adjusted);
        if (cost.isZero()){
            cost = cost.add(new Cost(1,0,false));
        }
        return cost.render();
    }

}

class DamageAction extends CostAction {

    get cost(){
        return parseCostString(this.adjusted).render();
    }
}