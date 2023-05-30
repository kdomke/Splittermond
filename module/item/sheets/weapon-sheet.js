import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondWeaponSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "weapon"]
        });
    }

    _getStatBlock(item) {


        
        return [

            {
                label: "splittermond.damage",
                value: item.system.damage
            },
            {
                label: "splittermond.range",
                value: item.system.range
            },
            {
                label: "splittermond.weaponSpeed",
                value: item.system.weaponSpeed
            },
            {
                label: "splittermond.features",
                value: item.system.features || "-"
            }
        ];
            
    }

}