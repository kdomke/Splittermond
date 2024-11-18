import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager"
import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../data/SplittermondDataModel";

function SpellMessageDegreeOfSuccessFieldSchema() {
    return {
        degreeOfSuccessCosts: new fields.NumberField({required: true, blank: false, nullable: false}),
        checked: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
        used: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
        isDegreeOfSuccessOption: new fields.BooleanField({
            required: true,
            blank: false,
            initial: false,
            nullable: false
        }),
        multiplicity: new fields.NumberField({required: true, blank: false, initial: 1, nullable: false}),
    }
}
type SpellMessageDegreeOfSuccessFieldType = DataModelSchemaType<typeof SpellMessageDegreeOfSuccessFieldSchema>

export class SpellMessageDegreeOfSuccessField extends SplittermondDataModel<SpellMessageDegreeOfSuccessFieldType, SpellMessageDegreesOfSuccessManager> {
    static defineSchema = SpellMessageDegreeOfSuccessFieldSchema

    alterCheckState(): void {
        if (this.used || !this.isAvailable()) {
            console.warn(`Tried to check disabled option!`)
            return;
        }
        this.updateSource({checked: !this.checked});
    }

    use() {
        this.updateSource({used: true});
    }

    isCheckable(): boolean {
        return !this.used && (this.checked
            || this.degreeOfSuccessCosts <= this.getParent().openDegreesOfSuccess);
    }

    isAvailable(): boolean {
        return this.isDegreeOfSuccessOption && this.degreeOfSuccessCosts <= this.getParent().totalDegreesOfSuccess;
    }

    getParent(): SpellMessageDegreesOfSuccessManager {
        if (this.parent && this.parent instanceof SpellMessageDegreesOfSuccessManager) {
            return this.parent;
        } else {
            throw new Error("This class must be a child of SpellMessageDegreesOfSuccessManager")
        }

    }
}