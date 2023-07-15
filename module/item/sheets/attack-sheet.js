import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondSpellSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "npcattack"]
        });
    }

    _getStatBlock() {


        
        return [
            {
                label: "splittermond.damage",
                value: this.item.system.damage
            },
            {
                label: "splittermond.range",
                value: this.item.system.range
            },
            {
                label: "splittermond.weaponSpeedAbbrev",
                value: this.item.system.weaponSpeed
            }
        ];
            
    }

}