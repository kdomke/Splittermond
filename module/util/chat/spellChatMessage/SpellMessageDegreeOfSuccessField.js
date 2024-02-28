import {SpellDegreesOfSuccessManager} from "./SpellDegreesOfSuccessManager.js";

const fields = foundry.data.fields;

/**
 * @extends {foundry.abstract.DataModel<SpellMessageDegreeOfSuccessField, SpellDegreesOfSuccessManager>}
 * @property {number} degreeOfSuccessCosts the amount of degrees of success this option costs
 * @property {boolean} checked whether the user has elected to use this option
 * @property {boolean} used whether the effect of this option has been used in an action.
 * @property {boolean} isDegreeOfSuccessOption whether the spell defines this as a degree of success option
 */
export class SpellMessageDegreeOfSuccessField extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            degreeOfSuccessCosts: new fields.NumberField({required: true, blank: false, nullable: false}),
            checked: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
            used: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
            isDegreeOfSuccessOption: new fields.BooleanField({required: true, blank: false, initial: false, nullable: false}),
        }
    }

    constructor(...args) {
        super(...args);
        if (!this.parent || !this.parent instanceof SpellDegreesOfSuccessManager){
            throw new Error("DegreeOfSuccessField is an embedded data field for SpellDegreesOfSuccessManager defined as such");
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
            || this.degreeOfSuccessCosts <= this.parent.openDegreesOfSuccess);
    }

    isAvailable(){
        return this.isDegreeOfSuccessOption && this.degreeOfSuccessCosts <= this.parent.totalDegreesOfSuccess;
    }
}