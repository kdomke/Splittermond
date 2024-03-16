import {SpellMessageDegreesOfSuccessManager} from "./SpellMessageDegreesOfSuccessManager.js";
import {fields, SplittermondDataModel} from "../../../data/SplittermondDataModel.js";

/**
 * @extends {SplittermondDataModel<SpellMessageDegreeOfSuccessField, SpellMessageDegreesOfSuccessManager>}
 * @property {number} degreeOfSuccessCosts the amount of degrees of success this option costs
 * @property {boolean} checked whether the user has elected to use this option
 * @property {boolean} used whether the effect of this option has been used in an action.
 * @property {boolean} isDegreeOfSuccessOption whether the spell defines this as a degree of success option
 */
export class SpellMessageDegreeOfSuccessField extends SplittermondDataModel{
    static defineSchema() {
        return {
            degreeOfSuccessCosts: new fields.NumberField({required: true, blank: false, nullable: false}),
            checked: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
            used: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
            isDegreeOfSuccessOption: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
        }
    }

    alterCheckState() {
        if (this.used || !this.isAvailable()) {
            console.warn(`Tried to check disabled option!`)
            return;
        }
        this.updateSource({checked: !this.checked});
    }

    /**
     * @return {boolean}
     */
    isCheckable() {
        return !this.used && (this.checked
            || this.degreeOfSuccessCosts <= this.getParent().openDegreesOfSuccess);
    }

    isAvailable(){
        return this.isDegreeOfSuccessOption && this.degreeOfSuccessCosts <= this.getParent().totalDegreesOfSuccess;
    }

    getParent(){
        if (this.parent && this.parent instanceof SpellMessageDegreesOfSuccessManager){
            return this.parent;
        }else{
            throw new Error("This class must be a child of SpellMessageDegreesOfSuccessManager")
        }

    }
}