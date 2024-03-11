import {parseCostString} from "../../costs/costParser.js";
import {Cost, CostModifier} from "../../costs/Cost.js";
import {AgentReference} from "../../../data/references/AgentReference.js";
import {DamageRoll} from "../../damage/DamageRoll.js";
import * as Dice from "../../dice.js";
import {ItemReference} from "../../../data/references/ItemReference.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.js";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference.js";

/**
 * @extends {SplittermondDataModel<SpellMessageActionsManager,never>}
 * @property {FocusAction} focus
 * @property {TickAction} ticks
 * @property {DamageAction} damage
 * @property {MessageAction} splinterPoint
 * @property {MessageAction} magicFumble
 */
export class SpellMessageActionsManager extends SplittermondDataModel {

    /**
     * @param {ItemReference<SplittermondSpellItem>} spellReference
     * @param {OnAncestorReference<CheckReport>} checkReportReference
     * @return {SpellMessageActionsManager}
     */
    static initialize(spellReference, checkReportReference) {

        const casterReference = AgentReference.initialize(spellReference.getItem().actor);
        const spellActionManagerData = {
            focus: FocusAction.initialize(casterReference, spellReference, checkReportReference).toObject(),
            ticks: {actorReference:casterReference.toObject(),  adjusted: 3},
            damage: DamageAction.initialize(spellReference, checkReportReference).toObject(),
            splinterPoint: UseSplinterpointsAction.initialize(casterReference, checkReportReference).toObject(),
            magicFumble: MagicFumbleAction.initialize(checkReportReference).toObject(),
        };
        return new SpellMessageActionsManager(spellActionManagerData);
    }

    static defineSchema() {
        return {
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
        return this.damage.applyDamage();
    }

    advanceToken() {
        this.ticks.advanceToken()
    }

    consumeFocus() {
        this.focus.consumeFocus();
    }

    /**
     * @return {number} the updated roll result granted by the splinterpoint
     */
    useSplinterPoint() {
        return this.splinterPoint.useSplinterpoint();
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
class MessageAction extends SplittermondDataModel {
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
     * @param {AgentReference} actorReference
     * @param {OnAncestorReference<CheckReport>} checkReportReference
     * @return {UseSplinterpointsAction}
     */
    static initialize(actorReference, checkReportReference) {
        return new UseSplinterpointsAction({
            checkReportReference: checkReportReference.toObject(),
            actorReference: actorReference.toObject(),
        });
    }

    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {required: true, nullable: false}),
            actorReference: new fields.EmbeddedDataField(AgentReference, {
                required: true,
                blank: false,
                nullable: false
            }),
        }
    }

    get available() {
        return this.checkReportReference.get().isFumble && this.actorReference.getActor().splinterpoints?.value > 0;
    }
    set available(__){}

    get skillName() {
        return this.checkReportReference.get().skill.name;
    }

    useSplinterpoint(){
        this.updateSource({used: true});
        return this.actorReference.getAgent().spendSplinterpoint().getBonus(this.checkReportReference.get().skill.name);
    }
}

class MagicFumbleAction extends MessageAction {
    static defineSchema(){
        return {
            ...MessageAction.defineSchema(),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {required: true, nullable: false}),
        }
    }
    /**
     * @param {OnAncestorReference<CheckReport>} checkReportReference
     * @return {MagicFumbleAction}
     */
    static initialize(checkReportReference) {
        return new MagicFumbleAction({used: false, checkReportReference});
    }

    get available(){
        return this.checkReportReference.get().isFumble;
    }
    set available(__){}
}

/**
 * @extends {MessageAction<TickAction,SpellMessageActionsManager>}
 * @property {AgentReference} actorReference
 * @property {number} adjusted
 * @property {boolean} used
 */
class TickAction extends MessageAction {
    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            actorReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
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

    advanceToken(){
        this.updateSource({used: true});
        this.actorReference.getAgent().addTicks(this.adjusted, "", false);//we don't wait for the promise, because we're done.
    }

}

/**
 * @extends {MessageAction<FocusAction,SpellMessageActionsManager>}
 * @property {AgentReference} casterReference
 * @property {OnAncestorReference<CheckReport>} checkReportReference
 * @property {ItemReference<SplittermondSpellItem>} spellReference
 * @property {CostModifier} adjusted
 */
class FocusAction extends MessageAction {
    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            casterReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {required: true, nullable: false}),
            spellReference: new fields.EmbeddedDataField(ItemReference, {
                required: true,
                blank: false,
                nullable: false
            }),
            adjusted: new fields.EmbeddedDataField(CostModifier, {
                required: true,
                blank: false,
                nullable: false,
                initial: new Cost(0, 0, false, false).asModifier()
            }),
        }
    }

    static initialize(casterReference, spellReference, checkReportReference) {
        return new FocusAction({
            casterReference: casterReference.toObject(),
            spellReference: spellReference.toObject(),
            checkReportReference: checkReportReference.toObject()
        });
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
        const checkReport = this.checkReportReference.get();
        let cost = this.spellReference.getItem().getCostsForFinishedRoll(checkReport.degreeOfSuccess, checkReport.succeeded)
            .add(this.adjusted)
        if (cost.isZero()) {
            cost = cost.add(new Cost(1, 0, false).asModifier());
        }
        return cost.render();
    }

    consumeFocus(){
        this.updateSource({used: true});
        this.casterReference.getAgent().consumeCost("focus", this.cost, this.spellReference.getItem().name);
    }

}

/**
 * @extends {MessageAction<DamageAction,never>}
 * @property {ItemReference<{damage:string, name:string}>} itemReference
 * @property {number} adjusted
 */
class DamageAction extends MessageAction {

    static defineSchema() {
        return {
            ...MessageAction.defineSchema(),
            itemReference: new fields.EmbeddedDataField(ItemReference, {required: true, blank: false, nullable: false}),
            checkReportReference: new fields.EmbeddedDataField(OnAncestorReference, {required: true, nullable: false}),
            adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
        }
    }

    static initialize(itemReference, checkReportReference) {
        return new DamageAction({
            itemReference: itemReference.toObject(),
            checkReportReference: checkReportReference.toObject()
        });
    }

    get available() {
        return !!this.itemReference.getItem().damage &&
            this.itemReference.getItem().damage !== "0" &&
            this.checkReportReference.get().succeeded;
    }
    set available(__){}

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
        const damage = DamageRoll.parse(this.itemReference.getItem().damage, "");
        damage.increaseDamage(this.adjusted);
        return damage.getDamageFormula()
    }

    applyDamage(){
        this.updateSource({used: true});
        return Dice.damage(this.cost, "", this.itemReference.getItem().name); //we don't wait for the promise, because we're done.
    }
}