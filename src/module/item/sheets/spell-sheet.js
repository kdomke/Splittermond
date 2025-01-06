import SplittermondItemSheet from "./item-sheet.js";
import {foundryApi} from "../../api/foundryApi";

export default class SplittermondSpellSheet extends SplittermondItemSheet {
    static get defaultOptions() {
        return foundryApi.mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "item", "spell"]
        });
    }

    _getStatBlock() {


        
        return [
            {
                label: "splittermond.difficulty",
                value: this.item.difficulty
            },
            {
                label: "splittermond.focusCosts",
                value: this.item.costs
            },
            {
                label: "splittermond.castDuration",
                value: this.item.castDuration
            },
            {
                label: "splittermond.range",
                value: this.item.range
            }
        ];
            
    }

}