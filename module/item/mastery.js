import SplittermondItem from "./item.js";
import {getMasteryAvailabilityParser} from "./availabilityParser.js";

export default class SplittermondMasteryItem extends SplittermondItem {

    /**
     *
     * @param data
     * @param context
     * @param {MasteryAvailabilityParser} availabilityParser
     */
    constructor(data, context = {},
                availabilityParser = getMasteryAvailabilityParser(game.i18n, CONFIG.splittermond.skillGroups.all)) {
        super(data, context);
        this.availabilityParser = availabilityParser;
    }

    get availableIn() {
        return this.availabilityParser.toDisplayRepresentation(this.system.availableIn);
    }

    /**
     * @override
     */
    update(data, context) {
        if ("availableIn" in data) {
            data["system.availableIn"] = this.availabilityParser.toInternalRepresentation(data.availableIn);
            delete data.availableIn;
        }
        return super.update(data, context);
    }

    /**
     * @returns {{skillId: string, label: string}[]}
     */
    get availableInList() {
        const availableInIsUsable = this.system.availableIn && typeof this.system.availableIn === "string";
        const transformedAvailabilities = this.availabilityParser.toDisplayRepresentation(availableInIsUsable ? this.system.availableIn: null);
        const transformedSkill = this.availabilityParser.toDisplayRepresentation(this.system.skill);

        let list = [];
        if (transformedAvailabilities) {
            transformedAvailabilities.split(",").forEach(item => list.push(item.trim()));
        }
        if (transformedSkill && !list.includes(transformedSkill)) {
            list.push(transformedSkill);
        }
         return list.map(item => ({label: item}));

    }
}