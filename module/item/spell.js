import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

import {getSpellAvailabilityParser} from "./availabilityParser.js";
import {produceSpellAvailabilityTags} from "./tags/spellTags.js";
import {parseCostString} from "../util/costs/costParser.js";
import {calculateReducedEnhancementCosts, calculateReducedSpellCosts} from "../util/costs/spellCosts.js";

export default class SplittermondSpellItem extends AttackableItem(SplittermondItem) {

    constructor(
        data,
        context = {},
        availabilityParser = getSpellAvailabilityParser(game.i18n, CONFIG.splittermond.skillGroups.magic)
    ) {
        super(data, context);
        this.availabilityParser = availabilityParser;
    }


    /** @return {string} */
    get costs() {
        return this.actor ?
            calculateReducedSpellCosts(this.system, this.actor.system.spellCostReduction) :
            this.system.costs;
    }

    /** @return {string} */
    get enhancementCosts() {
        if (this.actor){
            const requiredDegreesOfSuccess = /([1-9][0-9]*\s*[Ee][Gg])/.exec(this.system.enhancementCosts)[0] ?? "";
            const reducedCosts = calculateReducedEnhancementCosts(this.system, this.actor.system.spellEnhancedCostReduction)
            return `${requiredDegreesOfSuccess}/+${reducedCosts}`
        } else {
            return this.system.enhancementCosts;
        }
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


    get skill() {
        return this.actor?.skills[this.system.skill];
    }

    get enoughFocus() {
        let costData = parseCostString(this.costs);
        let costTotal = costData.channeled + costData.exhausted + costData.consumed;
        return costTotal <= this.actor?.system.focus.available.value;
    }

    get difficulty() {
        return this.system.difficulty;
    }

    get castDuration() {
        return this.system.castDuration;
    }

    get range() {
        return this.system.range;
    }

    get effectDuration() {
        return this.system.effectDuration;
    }

    get description() {
        return this.system.description;
    }

    get enhancementDescription() {
        return this.system.enhancementDescription;
    }

    get degreeOfSuccessOptions() {
        return this.system.degreeOfSuccessOptions;
    }

    get spellType() {
        return this.system.spellType + "";
    }

    get spellTypeList() {
        return this.spellType?.split(",").map(str => str.trim());
    }

    get damage() {
        return this.system.damage;
    }

    get availableInList(){
        return produceSpellAvailabilityTags(this.system, this.availabilityParser);
    }

    async roll(options) {
        if (!this.actor) return false;

        options = duplicate(options);
        options.type = "spell";
        options.subtitle = this.name;
        options.difficulty = this.difficulty;
        options.preSelectedModifier = this.spellType.split(",");
        options.checkMessageData = {
            spell: {
                id: this.id,
                name: this.name,
                spellType: this.spellType,
                description: this.description,
                enhancementDescription: this.enhancementDescription,
                degreeOfSuccessOptions: this.degreeOfSuccessOptions,
                costs: this.costs,
                enhancementCosts: this.enhancementCosts,
                skill: this.skill.toObject(),
                difficulty: this.difficulty,
                castDuration: this.castDuration,
                range: this.range,
                effectDuration: this.effectDuration,
                spellTypeList: this.spellTypeList,
                damage: this.damage
            }
        };

        return this.skill.roll(options);
    }

}