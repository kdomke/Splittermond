import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";

import * as Costs from "../util/costs.js";

export default class SplittermondSpellItem extends AttackableItem(SplittermondItem) {
    prepareActorData() {
        let itemData = duplicate(this);
        itemData.data = !itemData.data ? itemData.system : itemData.data;
        itemData.data.costs = this.costs;
        itemData.data.enhancementCosts = this.enhancementCosts;

        this.actor.systemData().spells.push(itemData);
    }

    get costs() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.systemData(), this.actor.systemData().spellCostReduction), this.systemData().costs);
    }

    get enhancementCosts() {
        return Costs.calcSpellCostReduction(Costs.getReductionsBySpell(this.systemData(), this.actor.systemData().spellEnhancedCostReduction), this.systemData().enhancementCosts, true);
    }

}