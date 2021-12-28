import SplittermondSpeciesWizard from "../../apps/wizards/species.js"
import SplittermondActorSheet from "./actor-sheet.js"
import * as Dice from "../../util/dice.js"
import CheckDialog from "../../apps/dialog/check-dialog.js";


export default class SplittermondCharacterSheet extends SplittermondActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/actor/character-sheet.hbs",
            classes: ["splittermond", "sheet", "actor"],
            tabs: [{ navSelector: ".sheet-navigation[data-group='primary']", contentSelector: "main", initial: "general" },
            { navSelector: ".subnav[data-group='fight-action-type']", contentSelector: "section div.tab-list", initial: "attack" }],
            scrollY: [, ".tab[data-tab='general']", ".list.skills", ".list.masteries", ".tab[data-tab='spells']", ".tab[data-tab='inventory']", ".tab[data-tab='status']"],
            overlays: ["#health","#focus"],
            width: 750
        });
    }

    getData() {
        const sheetData = super.getData();

        sheetData.data.experience.heroLevelName = game.i18n.localize(`splittermond.heroLevels.${sheetData.data.experience.heroLevel}`);

        sheetData.items.forEach(i => {
            if (i.type === "strength") {
                i.multiple = i.data.quantity > 1;
            }
        })


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

        if (itemData.type === "moonsign") {
            const moonsignIds = this.actor.items.filter(i => i.type === "moonsign")?.map(i => i.id);
            if (moonsignIds) {
                const deleted = await this.actor.deleteEmbeddedDocument("Item", moonsignIds);
            }

        }

        if (["mastery", "strength", "weakness", "resource", "spell", "weapon", "equipment", "shield", "armor", "moonsign", "culturelore", "statuseffect", "spelleffect"].includes(itemData.type)) {
            return super._onDropItemCreate(itemData);
        }
        W
    }

    activateListeners(html) {


        html.find('.attribute input[name$="value"]').change(this._onChangeAttribute.bind(this));
        html.find('.attribute input[name$="start"]').change((event) => {
            event.preventDefault();

            const input = event.currentTarget;
            const value = parseInt(input.value);
            const attrBaseName = input.name.split('.')[2];
            const speciesValue = parseInt(getProperty(this.actor.data, `data.attributes.${attrBaseName}.species`));
            this.actor.update({
                [`data.attributes.${attrBaseName}.initial`]: value - speciesValue
            });
        });

        

        super.activateListeners(html);
    }

    _onChangeAttribute(event) {
        event.preventDefault();

        const input = event.currentTarget;
        const value = parseInt(input.value);
        const attrBaseName = input.name.split('.')[2];
        const initialValue = parseInt(getProperty(this.actor.data, `data.attributes.${attrBaseName}.initial`));
        const speciesValue = parseInt(getProperty(this.actor.data, `data.attributes.${attrBaseName}.species`));
        this.actor.update({
            [`data.attributes.${attrBaseName}.advances`]: value - initialValue - speciesValue
        });
    }


}