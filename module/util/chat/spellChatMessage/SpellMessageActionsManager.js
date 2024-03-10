import {parseCostString} from "../../costs/costParser.js";
import {Cost, CostModifier} from "../../costs/Cost.js";
import {AgentReference} from "../../../data/references/AgentReference.js";
import {DamageRoll} from "../../damage/DamageRoll.js";
import * as Dice from "../../dice.js";
import {ItemReference} from "../../../data/references/ItemReference.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SpellMessageActionsManager,never>}
 * @property {FocusAction} focus
 * @property {TickAction} ticks
 * @property {DamageAction} damage
 * @property {MessageAction} splinterPoint
 * @property {MessageAction} magicFumble
 * @property {AgentReference} casterReference
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 */
export class SpellMessageActionsManager extends foundry.abstract.DataModel {

    /**
     * @param {SplittermondSpellItem} spell
     * @param {CheckReport} checkReport
     * @return {SpellMessageActionsManager}
     */
    static initialize(spell, checkReport) {

        const spellActionManagerData = {
            casterReference: AgentReference.initialize(spell.actor),
            spellReference: ItemReference.initialize(spell),
            focus: {
                degreeOfSuccess: checkReport.degreeOfSuccess,
                succeeded: checkReport.succeeded,
            },
            ticks: {original: 3, adjusted: 3},
            damage: {
                available: !!spell.system.damage && spell.system.damage !== "0" && checkReport.succeeded,
            },
            splinterPoint: UseSplinterpointsAction.initialize(spell.actor, checkReport),
            magicFumble: MagicFumbleAction.initialize(checkReport)
        };
        return new SpellMessageActionsManager(spellActionManagerData);
    }

    static defineSchema() {
        return {
            casterReference: new fields.EmbeddedDataField(AgentReference, {
                required: true,
                blank: false,
                nullable: false
            }),
            //target
            spellReference: new fields.EmbeddedDataField(ItemReference, {required:true, blank:false, nullable:false}),
            focus: new fields.EmbeddedDataField(FocusAction, {required: true, blank: false, nullable: false}),
            ticks: new fields.EmbeddedDataField(TickAction, {required: true, blank: false, nullable: false}),
            damage: new fields.EmbeddedDataField(DamageAction, {required: true, blank: false, nullable: false}),
            splinterPoint: new fields.EmbeddedDataField(UseSplinterpointsAction, {
                required: true,
                blank: false,
                nullable: false
            }),
            magicFumble: new fields.EmbeddedDataField(MagicFumbleAction, {
                required: true,
                blank: false,
                nullable: false
            }),
        }
    }

    applyDamage() {
        this.damage.updateSource({used: true});
        return Dice.damage(this.damage.cost, "", this.spellReference.getItem().name); //we don't wait for the promise, because we're done.
    }

    advanceToken() {
        this.ticks.updateSource({used: true});
        this.casterReference.getAgent().addTicks(this.ticks.adjusted);//we don't wait for the promise, because we're done.
    }

    consumeFocus() {
        this.focus.updateSource({used: true});
        this.casterReference.getAgent().consumeCost("focus", this.focus.cost, this.spellReference.getItem().name);
    }

    /**
     * @return {number} the updated roll result granted by the splinterpoint
     */
    useSplinterPoint() {
        const caster = this.casterReference.getAgent();
        this.splinterPoint.updateSource({used: true});
        return caster.spendSplinterpoint().getBonus(this.splinterPoint.skill)
    }

    rollFumble() {
        this.magicFumble.updateSource({used: true});
        const eg = this.parent.degreeOfSuccess
        const costs = this.focus.original;
        const skill = this.splinterPoint.skillName;
        this.casterReference.getAgent().rollMagicFumble(eg, costs, skill);
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

    static defineSchema() {
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
 * @extends {MessageAction<TickAction,SpellMessageActionsManager>}
 * @property {number} original
 * @property {number} adjusted
 * @property {boolean} used
 */
class TickAction extends MessageAction {
    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
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
 * @extends {MessageAction<FocusAction,SpellMessageActionsManager>}
 * @property {number} degreeOfSuccess
 * @property {boolean} succeeded
 * @property {CostModifier} adjusted
 */
class FocusAction extends MessageAction {
    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            degreeOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false}),
            adjusted: new fields.EmbeddedDataField(CostModifier,{required: true, blank: false, nullable: false, initial:new Cost(0,0,false, false).asModifier()}),
            succeeded: new fields.BooleanField({required: true, blank: false, nullable: false}),
        }
    }

    /** @param {string} cost a Splittermond cost string ( e.g. K2V1)*/
    addCost(cost) {
        if (this.used) {
            console.warn("Attempt alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost, true).asModifier();
        this.updateSource({adjusted: this.adjusted.add(costAdjustment)});
    }

    /** @param {string} cost a Splittermond cost string ( e.g. K2V1)*/
    subtractCost(cost) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        const costAdjustment = parseCostString(cost, true).asModifier();
        this.updateSource({adjusted: this.adjusted.subtract(costAdjustment)});
    }

    get cost() {
        let cost = this.parent.spellReference.getItem().getCostsForFinishedRoll(this.degreeOfSuccess, this.succeeded)
            .add(this.adjusted)
        if (cost.isZero()) {
            cost = cost.add(new Cost(1, 0, false).asModifier());
        }
        return cost.render();
    }

}

class DamageAction extends MessageAction {

    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial:0}),
        }
    }

    /**@param {number} amount*/
    addDamage(amount) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted + amount});
    }
    /**@param {number} amount*/
    subtractDamage(amount) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted - amount});
    }

    get cost() {
        const damage = DamageRoll.parse(this.parent.spellReference.getItem().damage, "");
        damage.increaseDamage(this.adjusted);
        return damage.getDamageFormula()
    }
}