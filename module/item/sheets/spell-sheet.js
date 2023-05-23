import SplittermondItemSheet from "./item-sheet.js";

export default class SplittermondSpellSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "spell"]
        });
    }

    _getStatBlock(item) {

        let availableIn = item.system.availableIn;
        CONFIG.splittermond.skillGroups.magic.forEach(i => {
            availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase(), i);
        });
        availableIn  = availableIn.split(",").map(i => {
            let data = i.trim().split(" ");
            return game.i18n.localize(`splittermond.skillLabel.${data[0].trim()}`) + " " + data[1];
        }).join(", ");
        
        return [
            {
                label: "splittermond.skill",
                value: item.skill?.label || availableIn
            },
            {
                label: "splittermond.spellType",
                value: item.spellType
            },
            {
                label: "splittermond.difficulty",
                value: item.difficulty
            },
            {
                label: "splittermond.focusCosts",
                value: item.costs
            },
            {
                label: "splittermond.castDuration",
                value: item.castDuration
            },
            {
                label: "splittermond.range",
                value: item.range
            }
        ];
            
    }

}