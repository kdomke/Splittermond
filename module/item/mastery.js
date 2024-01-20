import SplittermondItem from "./item.js";


export default class SplittermondMasteryItem extends SplittermondItem {

    /**
     *
     * @param data
     * @param context
     * @param {locaclize: (string)=>{string}} i18n
     */
    constructor(data, context = {}, i18n = game.i18n) {
        super(data, context)
        this.i18n= i18n;
    }

    /**
     * @returns {{skillId: string, label: string}[]}
     */
    get availableInList() {
        let list = [];
        if (this.system.availableIn && typeof this.system.availableIn == "string" && this.system.availableIn.trim() !== "") {
            list = this.system.availableIn.split(",").map(str => str.trim());
        }

        let skill = this.system.skill;
        if (skill && !list.includes(skill)) {
            list.push(skill);
        }

        return list.map(skill => ({
            label: this.i18n.localize(`splittermond.skillLabel.${skill}`),
            skillId: skill
        }));
    }
}