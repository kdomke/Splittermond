import {parseCostString} from "../../costs/costParser.js";
import {Cost} from "../../costs/Cost.js";
import {AgentReference} from "../AgentReference.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SpellMessageActionsManager,never>}
 * @property {CostAction} focus
 * @property {TickAction} ticks
 * @property {CostAction} damage
 * @property {MessageAction} splinterPoint
 * @property {MessageAction} magicFumble
 * @property {AgentReference} casterReference
 */
export class SpellMessageActionsManager extends foundry.abstract.DataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {CheckReport} checkReport
     * @return {SpellMessageActionsManager}
     */
    static initialize(spell,checkReport) {

        const spellActionManagerData = {
            casterReference: AgentReference.initialize(spell.actor),
            focus: {
                original: spell.system.costs,
                adjusted: spell.system.costs
            },
            ticks: {original: 3, adjusted: 3},
            damage: {
                original: spell.system.damage ? spell.system.damage : "0",
                adjusted: spell.system.damage ? spell.system.damage : "0",
                available: !!spell.system.damage && spell.system.damage !== "0",
            },
            splinterPoint: UseSplinterpointsAction.initialize(spell.actor, checkReport),
            magicFumble: MagicFumbleAction.initialize(checkReport)
        };
        return new SpellMessageActionsManager(spellActionManagerData);
    }

    static defineSchema() {
        return {
            casterReference: new fields.EmbeddedDataField(AgentReference, {required: true, blank: false, nullable: false}),
            //target
            focus: new fields.EmbeddedDataField(FocusAction, {required: true, blank: false, nullable: false}),
            ticks: new fields.EmbeddedDataField(TickAction, {required: true, blank: false, nullable: false}),
            damage: new fields.EmbeddedDataField(DamageAction, {required: true, blank: false, nullable: false}),
            splinterPoint: new fields.EmbeddedDataField(UseSplinterpointsAction, {required: true, blank: false, nullable: false}),
            magicFumble: new fields.EmbeddedDataField(MagicFumbleAction, {required: true, blank: false, nullable: false}),
        }
    }

    applyDamage() {
        this.damage.updateSource({used:true});
    }

    advanceToken() {
        this.ticks.updateSource({used:true});
    }

    consumeFocus() {
        this.focus.updateSource({used:true});
    }

    /**
     * @return {number} the updated roll result granted by the splinterpoint
     */
    useSplinterPoint() {
        const caster = this.casterReference.getAgent();
        this.splinterPoint.updateSource({used:true});
        return caster.spendSplinterpoint().getBonus(this.splinterPoint.skill)
    }

    rollFumble() {
        this.magicFumble.updateSource({used:true});
        //const eg = this.parent.degreeOfSuccessManager.totalDegreesOfSuccess;
        //const costs = this.focus.original;
        //const skill = $(event.currentTarget).closestData("skill");
        //actor.rollMagicFumble(eg, costs, skill);
    }
}

/**
 * @template T
 * @template U
 * @extends {foundry.abstract.DataModel<T,U>}
 * @property {boolean} used
 * @property {boolean} available
 */
class MessageAction extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
            available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        }
    }
}

/**
 * @extends {MessageAction<UseSplinterpointsAction,never>}
 * @property {string} skillId
 */
class UseSplinterpointsAction extends MessageAction {
    /**
     * @param {SplittermondActor} caster
     * @param {CheckReport} checkReport
     * @return {UseSplinterpointsAction}
     */
    static initialize(caster, checkReport) {
       const available = !checkReport.isFumble && caster.splinterpoints?.value > 0;
       return new UseSplinterpointsAction({used: false, available, skillName: checkReport.skill.id});
    }

    static defineSchema(){
        return {
            ...MessageAction.defineSchema(),
            skillName: new fields.StringField({required: true, blank: false, nullable: false})
        }
    }
}

class MagicFumbleAction extends MessageAction {
    /**
     * @param {CheckReport} checkReport
     * @return {MagicFumbleAction}
     */
    static initialize(checkReport) {
        return new MagicFumbleAction({used: false, available: checkReport.isFumble});
    }
}

/**
 * @extends {MessageAction<TickAction,never>}
 * @property {number} original
 * @property {number} adjusted
 * @property {boolean} used
 */
class TickAction extends MessageAction {
    static defineSchema() {
        return {
            original: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
            adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
        }
    }

    /** @param {number} amount */
    add(amount) {
        if (this.used) {
            console.warn("Attempt alter a used action");
            return;
        }
        this.adjusted += amount;
    }

    /** @param {number} amount */
    subtract(amount) {
        if (this.used) {
            console.warn("Attempt alter a used action");
            return;
        }
        this.adjusted -= amount;
    }

    get cost() {
        return `${this.adjusted > 0 ? this.adjusted : 1}`;
    }

}

/**
 * @extends {MessageAction<CostAction,never>}
 * @property {string} original
 * @property {string} adjusted
 */
class CostAction extends MessageAction {
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
        if (this.used) {
            console.warn("Attempt alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost, true);
        this.adjusted = parseCostString(this.adjusted).add(costAdjustment).toString();
    }

    /** @param {string} cost */
    subtractCost(cost) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost);
        this.adjusted = parseCostString(this.adjusted).subtract(costAdjustment).toString();
    }

    get cost() {
        throw new Error("Override me!")
    }

}


class FocusAction extends CostAction {

    get cost() {
        let cost = parseCostString(this.adjusted);
        if (cost.isZero()) {
            cost = cost.add(new Cost(1, 0, false));
        }
        return cost.render();
    }

}

class DamageAction extends CostAction {

    get cost() {
        return parseCostString(this.adjusted).render();
    }
}