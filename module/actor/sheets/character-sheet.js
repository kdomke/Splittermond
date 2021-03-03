import SplittermondSpeciesWizard from "../../apps/wizards/species.js"
import SplittermondActorSheet from "./actor-sheet.js"
import * as Dice from "../../util/dice.js"
import CheckDialog from "../../apps/dialog/check-dialog.js";


export default class SplittermondCharacterSheet extends SplittermondActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/actor/character-sheet.hbs",
            classes: ["splittermond", "sheet", "actor"],
            tabs: [{ navSelector: ".tabs[data-group='primary']", contentSelector: "main", initial: "general" },
            { navSelector: ".tabs[data-group='fight-action-type']", contentSelector: "section div.tab-list", initial: "attack" }],
            scrollY: [, ".tab.general", ".tab.skills", ".tab.spells", ".tab.inventory"]
        });
    }

    getData() {
        const sheetData = super.getData();



        //this._prepareItems(sheetData);

        //sheetData.config = CONFIG.splittermond;

        console.log("getData()");


        return sheetData;
    }



    async _onDropItemCreate(itemData) {

        if (itemData.type === "species") {

            let wizard = new SplittermondSpeciesWizard(this.actor, itemData);
            wizard.render(true);
            return;
        }


        return super._onDropItemCreate(itemData);
    }


}