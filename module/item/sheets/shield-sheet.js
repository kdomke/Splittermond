import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondShieldSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "shield"]
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
                label: "splittermond.features",
                value: item.system.features || "-"
            },
            {
                label: "splittermond.minAttributes",
                value: item.system.minAttributes || "-"
            }
        ];
            
    }

}