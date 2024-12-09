import {TooltipFormula} from "../tooltip.js";
import {foundryApi} from "../../api/foundryApi.ts";


export class RollResultRenderer {

    /**
     * @param {string} actionDescription
     * @param {CheckReport} checkReport
     *
     */
    constructor (actionDescription, checkReport){
        this.actionDescription = actionDescription;
        this.checkReport = checkReport;
    }


    render(){
        return {
            rollTotal: this.checkReport.roll.total,
            skillAndModifierTooltip: renderSkillAndModifiers(this.checkReport),
            rollTooltip: this.checkReport.roll.tooltip,
            actionDescription:this.actionDescription
        }
    }
}

/**
 * @param {CheckReport} checkReport
 */
function renderSkillAndModifiers(checkReport){
    let tooltip = new TooltipFormula();
    const attributeKeys = Object.keys(checkReport.skill.attributes);
    tooltip.addParts(Object.entries(checkReport.skill.attributes).map(entry=> ({
        value: `${entry[1]}`,
        description: foundryApi.localize(`splittermond.attribute.${entry[0]}.short`)
    })), "+");

    tooltip.addOperator("+")
    tooltip.addPart(checkReport.skill.points, game.i18n.localize(`splittermond.skillPointsAbbrev`));
    checkReport.modifierElements.forEach(e => {
        const val = Math.abs(e.value);
        if (e.value > 0) {
            tooltip.addBonus(val, e.description);
        } else {
            tooltip.addMalus(val, e.description);
        }
    });
    return tooltip.getData();
}