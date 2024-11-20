import { SpellMessageDegreeOfSuccessField } from "./SpellMessageDegreeOfSuccessField";
import { splittermond } from "../../../config";
import { parseSpellEnhancementDegreesOfSuccess } from "../../costs/costParser";
import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../data/SplittermondDataModel";
import { OnAncestorReference } from "../../../data/references/OnAncestorReference";
import {SpellDegreesOfSuccessOptions} from "../../../../../public/template";
import {ItemReference} from "../../../data/references/ItemReference";
import SplittermondSpellItem from "../../../item/spell";
import {CheckReport} from "../../../actor/CheckReport";


const multiplicities = [1, 2, 4, 8] as const;
type Multiplicity = typeof multiplicities[number];

// Define the ManagedSpellOptions type
export type ManagedSpellOptions = SpellDegreesOfSuccessOptions | "spellEnhancement";

// Define the MultipliedOptions type
type MultipliedOptions = `${SpellDegreesOfSuccessOptions}${Multiplicity}`;

function SpellMessageDegreesOfSuccessManagerSchema() {
    function createDegreesOfSuccessOptionSchema(){
        const schema: Partial<Record<MultipliedOptions, any>> = {};
        for (const key in splittermond.spellEnhancement) {
            for (const multiplicity of multiplicities) {
                schema[multipliedOption(key, multiplicity)] = new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {
                    required: true,
                    blank: false,
                    nullable: false
                });
            }
        }
        return schema as Required<typeof schema>;
    }
    return {
        ...createDegreesOfSuccessOptionSchema(),
        spellEnhancement: new fields.EmbeddedDataField(SpellMessageDegreeOfSuccessField, {
            required: true,
            blank: false,
            nullable: false
        }),
        checkReportReference: new fields.EmbeddedDataField(OnAncestorReference<CheckReport>, {
            required: true,
            blank: false,
            nullable: false
        }),
        usedDegreesOfSuccess: new fields.NumberField({required: true, blank: false, nullable: false, initial: 0}),
    }
}
function multipliedOption(key: string, multiplicity: number): MultipliedOptions {
    if(keyIsManagedSpellOptions(key) && (multiplicities as readonly number[]).includes(multiplicity)){
        return `${key}${multiplicity}` as MultipliedOptions;
    }else {
        throw new Error("Cannot create MultipliedOptions for keys that are not ManagedSpellOptions");
    }
}
export function keyIsManagedSpellOptions(key: string): key is ManagedSpellOptions {
   return key === "spellEnhancement" || key in splittermond.spellEnhancement;
}

type SpellMessageDegreesOfSuccessManagerType = DataModelSchemaType<typeof SpellMessageDegreesOfSuccessManagerSchema>

export class SpellMessageDegreesOfSuccessManager extends SplittermondDataModel<SpellMessageDegreesOfSuccessManagerType> {

    static fromRoll(spellReference: ItemReference<SplittermondSpellItem>, checkReportReference: OnAncestorReference<CheckReport>) {
        const spell = spellReference.getItem();
        const degreeOfSuccessOptions: Partial<Record<MultipliedOptions, SpellMessageDegreeOfSuccessField>> = {};

        for (const key in splittermond.spellEnhancement) {
            for (const multiplicity of multiplicities) {
                degreeOfSuccessOptions[multipliedOption(key, multiplicity)] = new SpellMessageDegreeOfSuccessField({
                    degreeOfSuccessCosts: multiplicity * splittermond.spellEnhancement[key as keyof typeof splittermond.spellEnhancement].degreesOfSuccess,
                    checked: false,
                    used: false,
                    multiplicity: multiplicity,
                    isDegreeOfSuccessOption: spell.degreeOfSuccessOptions[key],
                });
            }
        }

        return new SpellMessageDegreesOfSuccessManager({
            checkReportReference: checkReportReference.toObject(),
            usedDegreesOfSuccess: 0,
            spellEnhancement: new SpellMessageDegreeOfSuccessField({
                degreeOfSuccessCosts: parseSpellEnhancementDegreesOfSuccess(spell.enhancementCosts),
                checked: false,
                used: false,
                isDegreeOfSuccessOption: true,
                multiplicity:1,
            }).toObject(),
            ...degreeOfSuccessOptions as Required<typeof degreeOfSuccessOptions>/*we just filled the record*/,
        });
    }

    static defineSchema = SpellMessageDegreesOfSuccessManagerSchema

    get totalDegreesOfSuccess() {
        return this.checkReportReference.get().degreeOfSuccess;
    }

    get openDegreesOfSuccess(): number {
        return this.totalDegreesOfSuccess - this.usedDegreesOfSuccess;
    }

    getMultiplicities(key: ManagedSpellOptions): SpellMessageDegreeOfSuccessField[] {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        return multiplicities.map(multiplicity => this[key + multiplicity])
            .filter(option => !!option);
    }

    isCheckable(key: ManagedSpellOptions, multiplicity: string): boolean {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        return this[key + multiplicity].isCheckable();
    }

    isChecked(key: ManagedSpellOptions, multiplicity: number): boolean {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        return this[key + multiplicity].checked;
    }

    isAvailable(key: ManagedSpellOptions, multiplicity: number): boolean {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        return this[key + multiplicity].isAvailable();
    }

    isUsed(key: ManagedSpellOptions): boolean {
        //@ts-expect-error the second part is correct, if the key is spellEnhancement
        return this.getMultiplicities(key).some(option => option.used) || this[key]?.used;
    }

    use(key: ManagedSpellOptions): void {
        this.getMultiplicities(key).forEach(option => option.use());
        //@ts-expect-error this is correct, if the key is spellEnhancement
        this[key]?.use();
    }

    alterCheckState(key: ManagedSpellOptions, multiplicity: number): void {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        const isChecked = this[key + multiplicity].checked;
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        isChecked ? this.onUncheck(key + multiplicity) : this.onCheck(key + multiplicity);
    }

    private onCheck(key: MultipliedOptions): void {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        this[key].alterCheckState();
        //@ts-expect-error TS does not understand what kind of object I will get with the keyset
        this.updateSource({ usedDegreesOfSuccess: this.usedDegreesOfSuccess + this[key].degreeOfSuccessCosts });
    }

    private onUncheck(key: ManagedSpellOptions): void {
        //@ts-expect-error TS cannot cope with the js mess of creating the key from input data on the fly
        this[key].alterCheckState();
        //@ts-expect-error TS does not understand what kind of object I will get with the keyset
        this.updateSource({ usedDegreesOfSuccess: this.usedDegreesOfSuccess - this[key].degreeOfSuccessCosts });
    }
}
