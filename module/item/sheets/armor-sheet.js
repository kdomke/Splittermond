import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondArmorSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "spell"]
        });
    }

    _getStatBlock(item) {


        
        return [

            {
                label: "splittermond.defenseBonus",
                value: item.system.defenseBonus
            },
            {
                label: "splittermond.tickMalus",
                value: item.system.tickMalus
            },
            {
                label: "splittermond.handicap",
                value: item.system.handicap
            },
            {
                label: "splittermond.damageReduction",
                value: item.system.damageReduction
            },
            {
                label: "splittermond.features",
                value: item.system.features || "-"
            },
            {
                label: "splittermond.minStrength",
                value: item.system.minStrength || "-"
            }
        ];
            
    }

}