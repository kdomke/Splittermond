import {addToRegistry} from "../chatMessageRegistry.js";
import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager.js";
import {SpellMessageActionsManager} from "./SpellMessageActionsManager.js";
import {splittermond} from "../../../config.js";
import {evaluateCheck} from "../../dice.js";
import {ItemReference} from "../../../data/references/ItemReference";
import {OnAncestorReference} from "module/data/references/OnAncestorReference.js";
import {SplittermondSpellRollMessageRenderer} from "./SpellRollMessageRenderer.js";
import {parseCostString} from "../../costs/costParser.js";
import {fields, SplittermondDataModel} from "module/data/SplittermondDataModel.js";
import type {DataModelSchemaType} from "module/data/SplittermondDataModel";
import SplittermondSpellItem from "../../../item/spell";
import {CheckReport} from "../../../actor/CheckReport";

const constructorRegistryKey = "SplittermondSpellRollMessage";

function SplittermondSpellRollSchema() {
    return {
        spellReference: new fields.EmbeddedDataField(ItemReference<SplittermondSpellItem>, {required: true, blank: false, nullable: false}),
        checkReport: new fields.ObjectField({required: true, nullable: false}),
        constructorKey: new fields.StringField({required: true, trim: true, blank: false, nullable: false}),
        renderer: new fields.EmbeddedDataField(SplittermondSpellRollMessageRenderer, {required: true, nullable: false}),
        degreeOfSuccessManager: new fields.EmbeddedDataField(SpellMessageDegreesOfSuccessManager, {
            required: true,
            nullable: false
        }),
        actionManager: new fields.EmbeddedDataField(SpellMessageActionsManager, {required: true, nullable: false}),
    }
}

type SpellRollMessageSchema = Omit<DataModelSchemaType<typeof SplittermondSpellRollSchema>,"checkReport"> & { checkReport: CheckReport };

export class SplittermondSpellRollMessage extends SplittermondDataModel<SpellRollMessageSchema> {

    static defineSchema() {
        return SplittermondSpellRollSchema();
    }

    static createRollMessage(spell: SplittermondSpellItem, checkReport: CheckReport) {
        const reportReference = OnAncestorReference
            //FIX we should not need to declare a generic parameter
            .for(SplittermondSpellRollMessage).identifiedBy("constructorKey", constructorRegistryKey)
            .references("checkReport");
        const spellReference = ItemReference.initialize(spell);
        return new SplittermondSpellRollMessage({
            checkReport: checkReport,
            spellReference: spellReference.toObject(),
            degreeOfSuccessManager: SpellMessageDegreesOfSuccessManager.fromRoll(spellReference, reportReference).toObject(),
            renderer: new SplittermondSpellRollMessageRenderer({
                //@ts-expect-error renderer was not migrated yet so TS probably can not properly infer the components.
                spellReference: spellReference,
                checkReportReference: reportReference
            }).toObject(),
            actionManager: SpellMessageActionsManager.initialize(spellReference, reportReference).toObject(),
            constructorKey: constructorRegistryKey,
        });
    }

    castDurationUpdate(data: { multiplicity: number }) {
        const multiplicity = data.multiplicity;
        if (this.degreeOfSuccessManager.isChecked("castDuration", multiplicity)) {
            //@ts-expect-error not migrated yet
            this.actionManager.ticks.add(multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction)
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.ticks.subtract(multiplicity * splittermond.spellEnhancement.castDuration.castDurationReduction)
        }
        this.#alterCheckState("castDuration", multiplicity);
    }

    exhaustedFocusUpdate(data: { multiplicity: number }) {
        const multiplicity = data.multiplicity;
        const focusCosts = this.#toCostModifier(splittermond.spellEnhancement.exhaustedFocus.focusCostReduction, multiplicity);
        if (this.degreeOfSuccessManager.isChecked("exhaustedFocus", multiplicity)) {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.addCost(focusCosts)
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("exhaustedFocus", multiplicity);
    }

    channelizedFocusUpdate(data: { multiplicity: number }) {
        const multiplicity = data.multiplicity;
        const focusCosts = this.#toCostModifier(splittermond.spellEnhancement.channelizedFocus.focusCostReduction, multiplicity);
        if (this.degreeOfSuccessManager.isChecked("channelizedFocus", data.multiplicity)) {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.addCost(focusCosts)
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("channelizedFocus", multiplicity);
    }

    consumedFocusUpdate(data: { multiplicity: number }) {
        const multiplicity = data.multiplicity;
        const focusCosts = parseCostString(splittermond.spellEnhancement.consumedFocus.focusCostReduction)
            .asModifier()
            .multiply(multiplicity);
        if (this.degreeOfSuccessManager.isChecked("consumedFocus", multiplicity)) {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.addCost(focusCosts)
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.subtractCost(focusCosts)
        }
        this.#alterCheckState("consumedFocus", multiplicity)
    }

    damageUpdate(data: { multiplicity: number }) {
        const multiplicity = data.multiplicity;
        if (this.degreeOfSuccessManager.isChecked("damage", multiplicity)) {
            //@ts-expect-error not migrated yet
            this.actionManager.damage.subtractDamage(multiplicity * splittermond.spellEnhancement.damage.damageIncrease)
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.damage.addDamage(multiplicity * splittermond.spellEnhancement.damage.damageIncrease)
        }
        this.#alterCheckState("damage", multiplicity);
    }

    rangeUpdate(data: { multiplicity: number }) {
        this.#alterCheckState("range", data.multiplicity);
    }

    effectAreaUpdate(data: { multiplicity: number }) {
        this.#alterCheckState("effectArea", data.multiplicity);
    }

    effectDurationUpdate(data: { multiplicity: number }) {
        this.#alterCheckState("effectDuration", data.multiplicity);
    }

    spellEnhancementUpdate() {
        const focusCosts = this.#toCostModifier(this.spellReference.getItem().enhancementCosts, 1);
        if (this.degreeOfSuccessManager.isChecked("spellEnhancement", "" as any)) {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.subtractCost(focusCosts);
        } else {
            //@ts-expect-error not migrated yet
            this.actionManager.focus.addCost(focusCosts);
        }
        this.#alterCheckState("spellEnhancement", "" as any);
    }


    #alterCheckState(key: string, multiplicity: number) {
        this.degreeOfSuccessManager.alterCheckState(key, multiplicity);
    }

    #toCostModifier(cost: string, multiplicity: number) {
        return parseCostString(cost, true).asModifier().multiply(multiplicity);
    }


    applyDamage() {
        this.actionManager.applyDamage();
        this.degreeOfSuccessManager.use("damage")
    }

    consumeCosts() {
        this.actionManager.consumeFocus()
        this.degreeOfSuccessManager.use("exhaustedFocus")
        this.degreeOfSuccessManager.use("consumedFocus")
        this.degreeOfSuccessManager.use("channelizedFocus")
        this.degreeOfSuccessManager.use("spellEnhancement")
    }

    advanceToken() {
        this.actionManager.advanceToken();
        this.degreeOfSuccessManager.use("castDuration")
    }

    async useSplinterpoint() {
        const splinterPointBonus = this.actionManager.useSplinterPoint();
        const checkReport = this.checkReport;
        checkReport.roll.total += splinterPointBonus;
        const updatedReport = await evaluateCheck(Promise.resolve(checkReport.roll), checkReport.skill.points, checkReport.difficulty, checkReport.rollType);
        const newCheckReport: CheckReport = {...checkReport, ...updatedReport, roll:{...updatedReport.roll, tooltip:checkReport.roll.tooltip}};
        this.updateSource({checkReport: newCheckReport});
    }

    rollMagicFumble() {
        this.actionManager.rollMagicFumble();
    }

    activeDefense() {
        this.actionManager.defend();
    }


    get template() {
        return this.renderer.template;
    }

    getData() {
        return this.renderer.renderData();
    }
}

addToRegistry(constructorRegistryKey, SplittermondSpellRollMessage);
