import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

import * as Costs from "../util/costs.js";

export default class SplittermondSpellItem extends AttackableItem(SplittermondItem) {

    get costs() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.systemData(), this.actor.systemData().spellCostReduction), this.systemData().costs);
    }

    get enhancementCosts() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.systemData(), this.actor.systemData().spellEnhancedCostReduction), this.systemData().enhancementCosts, true);
    }

    get skill() {
        return this.actor?.skills[this.systemData().skill];
    }

    get enoughFocus() {
        let costData = Costs.parseCostsString(this.costs);
        let costTotal = costData.channeled + costData.exhausted + costData.consumed;
        return costTotal <= this.actor.systemData().focus.available.value;
    }

    get difficulty() {
        return this.systemData().difficulty;
    }

    get castDuration() {
        return this.systemData().castDuration;
    }

    get range() {
        return this.systemData().range;
    }

    get effectDuration() {
        return this.systemData().effectDuration;
    }

    get description() {
        return this.systemData().description;
    }

    get enhancementDescription() {
        return this.systemData().enhancementDescription;
    }

    get degreeOfSuccessOptions() {
        return this.systemData().degreeOfSuccessOptions;
    }

    get spellType() {
        return this.systemData().spellType + "";
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