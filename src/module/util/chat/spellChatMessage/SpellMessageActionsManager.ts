import {Cost, CostModifier} from "module/util/costs/Cost";
import {AgentReference} from "module/data/references/AgentReference";
import {DamageRoll} from "module/util/damage/DamageRoll";
import * as Dice from "module/util/dice";
import {ItemReference} from "module/data/references/ItemReference";
import {fields, SplittermondDataModel} from "module/data/SplittermondDataModel";
import {OnAncestorReference} from "module/data/references/OnAncestorReference";
import {referencesUtils} from "module/data/references/referencesUtils";
import {foundryApi} from "module/api/foundryApi";
import SplittermondSpellItem from "../../../item/spell";
import {CheckReport} from "../../../actor/CheckReport";
import {DataModelSchemaType} from "../../../data/SplittermondDataModel";

function SpellMessageActionsManagerSchema() {
    return {
        focus: new fields.EmbeddedDataField(FocusAction, {required: true, nullable: false}),
        ticks: new fields.EmbeddedDataField(TickAction, {required: true, nullable: false}),
        damage: new fields.EmbeddedDataField(DamageAction, {required: true, nullable: false}),
        activeDefense: new fields.EmbeddedDataField(ActiveDefenseAction, {required: true, nullable: false}),
        splinterPoint: new fields.EmbeddedDataField(UseSplinterpointsAction, {
            required: true,
            nullable: false
        }),
        magicFumble: new fields.EmbeddedDataField(MagicFumbleAction, {
            required: true,
            nullable: false
        }),
    }
}

type SpellMessageActionsManagerType = DataModelSchemaType<typeof SpellMessageActionsManagerSchema>;

export class SpellMessageActionsManager extends SplittermondDataModel<SpellMessageActionsManagerType> {
    static defineSchema = SpellMessageActionsManagerSchema;

    static initialize(spellReference: ItemReference<SplittermondSpellItem>, checkReportReference: OnAncestorReference<CheckReport>): SpellMessageActionsManager {

        const casterReference = AgentReference.initialize(spellReference.getItem().actor);
        const spellActionManagerData = {
            focus: FocusAction.initialize(casterReference, spellReference, checkReportReference).toObject(),
            ticks: new TickAction({actorReference: casterReference.toObject(), adjusted: 3,used:false, available:true}).toObject(),
            damage: DamageAction.initialize(spellReference, checkReportReference).toObject(),
            activeDefense: new ActiveDefenseAction({
                itemReference: spellReference.toObject(),
                checkReportReference: checkReportReference.toObject(),
                used:false,
                available:true,
            }).toObject(),
            splinterPoint: UseSplinterpointsAction.initialize(casterReference, checkReportReference).toObject(),
            magicFumble: MagicFumbleAction.initialize(casterReference, spellReference, checkReportReference).toObject(),
        };
        return new SpellMessageActionsManager(spellActionManagerData);
    }


    applyDamage(): Promise<void> {
        return this.damage.applyDamage();
    }

    advanceToken(): void {
        this.ticks.advanceToken()
    }

    consumeFocus(): void {
        this.focus.consumeFocus();
    }

    useSplinterPoint(): number {
        return this.splinterPoint.useSplinterpoint();
    }

    rollMagicFumble(): void {
        this.magicFumble.rollFumble();
    }

    defend(): void {
        this.activeDefense.activeDefense();
    }
}

interface MessageActionType {
   readonly used: boolean;
   readonly available: boolean;
}

function ActiveDefenseActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            nullable: false
        }),
        itemReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            nullable: false
        }),
    }
}

type ActiveDefenseActionType = DataModelSchemaType<typeof ActiveDefenseActionSchema>;

class ActiveDefenseAction extends SplittermondDataModel<ActiveDefenseActionType> implements MessageActionType {
    static defineSchema = ActiveDefenseActionSchema;

    get available() {
        //will fail if the difficulty is not a number, which should only happen if the difficulty is a target property
        return Number.isNaN(Number.parseFloat(this.itemReference.getItem().difficulty));
    }

    set available(__) {
    }

    activeDefense() {
        try {
            const actorReference = referencesUtils.findBestUserActor();
            actorReference.getAgent().activeDefenseDialog(this.itemReference.getItem().difficulty)
        } catch (e) {
            foundryApi.informUser("splittermond.pleaseSelectAToken")
        }
    }
}

function UseSplinterpointsActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            nullable: false
        }),
        actorReference: new fields.EmbeddedDataField(AgentReference, {
            required: true,
            blank: false,
            nullable: false
        }),
    }
}

type UseSplinterpointsActionType = DataModelSchemaType<typeof UseSplinterpointsActionSchema>;

class UseSplinterpointsAction extends SplittermondDataModel<UseSplinterpointsActionType> implements MessageActionType {

    static initialize(actorReference: AgentReference, checkReportReference: OnAncestorReference<CheckReport>): UseSplinterpointsAction {
        return new UseSplinterpointsAction({
            checkReportReference: checkReportReference.toObject(),
            actorReference: actorReference.toObject(),
            used: false
        });
    }

    static defineSchema = UseSplinterpointsActionSchema;

    get available() {
        return !this.checkReportReference.get().isFumble && this.actorReference.getAgent().splinterpoints?.value > 0;
    }

    get skillName() {
        //@ts-expect-error name extists, but we haven't typed this yet
        return this.checkReportReference.get().skill.name;
    }

    useSplinterpoint() {
        this.updateSource({used: true});
        //@ts-expect-error name extists, but we haven't typed this yet
        return this.actorReference.getAgent().spendSplinterpoint().getBonus(this.checkReportReference.get().skill.name);
    }
}

function MagicFumbleActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        casterReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            nullable: false
        }),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            nullable: false
        }),
    }
}

type MagicFumbleActionType = DataModelSchemaType<typeof MagicFumbleActionSchema>;

class MagicFumbleAction extends SplittermondDataModel<MagicFumbleActionType> implements MessageActionType {
    static defineSchema = MagicFumbleActionSchema;

    static initialize(casterReference: AgentReference, spellReference: ItemReference<SplittermondSpellItem>, checkReportReference: OnAncestorReference<CheckReport>): MagicFumbleAction {
        return new MagicFumbleAction({
            used: false,
            casterReference: casterReference.toObject(),
            spellReference: spellReference.toObject(),
            checkReportReference: checkReportReference.toObject()
        });
    }

    get available() {
        return this.checkReportReference.get().isFumble;
    }

    rollFumble() {
        this.updateSource({used: true});
        const eg = -this.checkReportReference.get().degreeOfSuccess
        const costs = this.spellReference.getItem().costs
        const skill = this.checkReportReference.get().skill.id;
        this.casterReference.getAgent().rollMagicFumble(eg, costs, skill);
    }
}

function TickActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        actorReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
        adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
    }
}

type TickActionType = DataModelSchemaType<typeof TickActionSchema>;

class TickAction extends SplittermondDataModel<TickActionType> implements MessageActionType {
    static defineSchema = TickActionSchema

    add(amount: number): void {
        if (this.used) {
            console.warn("Attempt alter a used action");
            return;
        }
        this.updateSource({adjusted: this.adjusted + amount});
    }

    subtract(amount: number) {
        if (this.used) {
            console.warn("Attempt alter a used action");
            return;
        }
        this.updateSource({adjusted: this.adjusted - amount});
    }

    get cost() {
        return `${this.adjusted > 0 ? this.adjusted : 1}`;
    }

    advanceToken() {
        this.updateSource({used: true});
        this.actorReference.getAgent().addTicks(this.adjusted, "", false);//we don't wait for the promise, because we're done.
    }

}

function FocusActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        casterReference: new fields.EmbeddedDataField(AgentReference, {required: true, nullable: false}),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            nullable: false
        }),
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {
            required: true,
            blank: false,
            nullable: false
        }),
        adjusted: new fields.EmbeddedDataField(CostModifier, {
            required: true,
            blank: false,
            nullable: false
        }),
    }
}

type FocusActionType = DataModelSchemaType<typeof FocusActionSchema>;

class FocusAction extends SplittermondDataModel<FocusActionType> implements MessageActionType {
    static defineSchema = FocusActionSchema

    static initialize(casterReference: AgentReference, spellReference: ItemReference<SplittermondSpellItem>, checkReportReference: OnAncestorReference<CheckReport>) {
        return new FocusAction({
            casterReference: casterReference.toObject(),
            spellReference: spellReference.toObject(),
            checkReportReference: checkReportReference.toObject(),
            adjusted: new Cost(0, 0, false, false).asModifier().toObject(),
            used: false,
            available: true
        });
    }

    addCost(cost:CostModifier) {
        if (this.used) {
            console.warn("Attempt alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted.add(cost)});
    }

    subtractCost(cost:CostModifier) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted.subtract(cost)});
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

    consumeFocus() {
        this.updateSource({used: true});
        //@ts-expect-error name exists, but we haven't typed this yet
        this.casterReference.getAgent().consumeCost("focus", this.cost, this.spellReference.getItem().name);
    }

}

function DamageActionSchema() {
    return {
        used: new fields.BooleanField({required: true, blank: false, nullable: false, initial: false}),
        available: new fields.BooleanField({required: true, blank: false, nullable: false, initial: true}),
        itemReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {required: true, blank: false, nullable: false}),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {required: true, nullable: false}),
        adjusted: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
    }
}
type DamageActionType = DataModelSchemaType<typeof DamageActionSchema>;

class DamageAction extends SplittermondDataModel<DamageActionType> implements MessageActionType{

    static defineSchema = DamageActionSchema;

    static initialize(itemReference:ItemReference<SplittermondSpellItem>, checkReportReference:OnAncestorReference<CheckReport>) {
        return new DamageAction({
            itemReference: itemReference.toObject(),
            checkReportReference: checkReportReference.toObject(),
            adjusted:0,
            used:false,
            available:true,
        });
    }

    get available() {
        return !!this.itemReference.getItem().damage &&
            this.itemReference.getItem().damage !== "0" &&
            this.checkReportReference.get().succeeded;
    }

    set available(__) {
    }

    addDamage(amount:number) {
        if (this.used) {
            console.warn("Attempt to alter a used cost action");
            return;
        }
        this.updateSource({adjusted: this.adjusted + amount});
    }

    subtractDamage(amount:number) {
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

    applyDamage() {
        this.updateSource({used: true});
        //@ts-expect-error name and system exist, but we haven't typed this yet
        return Dice.damage(this.cost, this.itemReference.getItem().system.features, this.itemReference.getItem().name); //we don't wait for the promise, because we're done.
    }
}