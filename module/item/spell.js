import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

import * as Costs from "../util/costs.js";

export default class SplittermondSpellItem extends AttackableItem(SplittermondItem) {

    get costs() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.system, this.actor.system.spellCostReduction), this.system.costs);
    }

    get enhancementCosts() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.system, this.actor.system.spellEnhancedCostReduction), this.system.enhancementCosts, true);
    }

    get skill() {
        return this.actor?.skills[this.system.skill];
    }

    get enoughFocus() {
        let costData = Costs.parseCostsString(this.costs);
        let costTotal = costData.channeled + costData.exhausted + costData.consumed;
        return costTotal <= this.actor.system.focus.available.value;
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

    async roll(options) {
        if (!this.actor) return false;

        options = duplicate(options);
        options.type = "spell";
        options.subtitle = this.name;
        options.difficulty = this.difficulty;
        options.preSelectedModifier = this.spellType.split(",");
        options.checkMessageData = {
            spell: this
        }

        return this.skill.roll(options);
    }

}