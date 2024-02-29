import {parseCostString} from "../../costs/costParser.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SpellMessageActionsManager,never>}
 * @property {CostAction} focus
 * @property {TickAction} ticks
 * @property {CostAction} damage
 * @property {{used:boolean}} splinterPoint
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
            focus: new fields.EmbeddedDataField(CostAction, {required: true, blank: false, nullable: false}),
            ticks: new fields.EmbeddedDataField(TickAction, {required: true, blank: false, nullable: false}),
            damage: new fields.EmbeddedDataField(CostAction, {required: true, blank: false, nullable: false}),
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
        this.adjusted += amount;
    }

    /** @param {number} amount */
    subtract(amount) {
        this.adjusted -= amount;
    }

    get cost(){
        return `${this.adjusted}`;
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
        const costAdjustment = parseCostString(cost, true);
        this.adjusted = parseCostString(this.adjusted).add(costAdjustment).toString();
    }

    /** @param {string} cost */
    subtractCost(cost) {
        const costAdjustment = parseCostString(cost);
        this.adjusted = parseCostString(this.adjusted).subtract(costAdjustment).toString();
    }

    get cost(){
        return parseCostString(this.adjusted).render();
    }
}