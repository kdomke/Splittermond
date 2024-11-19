import {SplittermondDataModel} from "../../../data/SplittermondDataModel";
import {CheckReport} from "../../../actor/CheckReport";
import {ItemReference} from "../../../data/references/ItemReference";
import SplittermondSpellItem from "../../../item/spell";
import {OnAncestorReference} from "../../../data/references/OnAncestorReference";

declare class SpellMessageDegreesOfSuccessManager extends SplittermondDataModel<SpellMessageDegreeOfSuccessManagerDataType> {
    static fromRoll(spellReference: ItemReference<SplittermondSpellItem>, checkReportReference: OnAncestorReference<CheckReport>): SpellMessageDegreesOfSuccessManager;
    static defineSchema(): SpellMessageDegreeOfSuccessManagerDataType;
    get totalDegreesOfSuccess(): number;
    get openDegreesOfSuccess(): number;
    getMultiplicities(key: ManagedSpellOptions): SpellMessageDegreeOfSuccessField[];
    isCheckable(key: ManagedSpellOptions, multiplicity: number): boolean;
    isChecked(key: ManagedSpellOptions, multiplicity: number): boolean;
    isAvailable(key: ManagedSpellOptions, multiplicity: number): boolean;
    isUsed(key: ManagedSpellOptions): boolean;
    use(key: ManagedSpellOptions): void;
    alterCheckState(key: ManagedSpellOptions, multiplicity: number): void;
}

//This is temporary, because we don't want to touch the JS impl yet.
type SpellMessageDegreeOfSuccessManagerDataType = {
    spellReference: ItemReference<SplittermondSpellItem>,
    checkReportReference: OnAncestorReference<CheckReport>
    usedDegreesOfSuccess: number;
}

export {SpellMessageDegreesOfSuccessManager};