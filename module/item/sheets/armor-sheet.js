import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondArmorSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "armor"]
        });
    }

    _getStatBlock(item) {


        
        return [

            {
                label: "splittermond.defenseBonus",
                value: item.system.defenseBonus || 0
            },
            {
                label: "splittermond.tickMalus",
                value: item.system.tickMalus || 0
            },
            {
                label: "splittermond.handicap",
                value: item.system.handicap || 0
            },
            {
                label: "splittermond.damageReduction",
                value: item.system.damageReduction || 0
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