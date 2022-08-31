import SplittermondSpeciesWizard from "../../apps/wizards/species.js"
import SplittermondActorSheet from "./actor-sheet.js"
import * as Dice from "../../util/dice.js"
import CheckDialog from "../../apps/dialog/check-dialog.js";


export default class SplittermondNPCSheet extends SplittermondActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/actor/npc-sheet.hbs",
            classes: ["splittermond", "sheet", "actor", "npc"],
            tabs: [{ navSelector: ".sheet-navigation[data-group='primary']", contentSelector: "main", initial: "general" },
            { navSelector: ".subnav[data-group='fight-action-type']", contentSelector: "section div.tab-list", initial: "attack" }],
            scrollY: [".tab[data-tab='general']", ".tab[data-tab='spells']", ".tab[data-tab='inventory']"],
            submitOnClose: false,
            overlays: ["#health", "#focus"]
        });
    }

    getData() {
        const sheetData = super.getData();

        return sheetData;
    }
    activateListeners(html) {

        html.find('input[name^="derivedAttributes"]').change(this._onChangeDerivedAttribute.bind(this));
        html.find('input[name="damageReduction"]').change(this._onChangeDamageReduction.bind(this));

        html.find('input[name^="data.skills"]').change(this._onChangeSkill.bind(this));

        super.activateListeners(html);
    }
    _onChangeDerivedAttribute(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = event.currentTarget;
        const value = parseInt(input.value);
        const attrBaseName = input.name.split('.')[1];
        const newValue = (value - parseInt(this.actor.derivedValues[attrBaseName].value || 0)) +
            parseInt(this.actor.system.data.derivedAttributes[attrBaseName].value || 0);
        this.actor.update({
            [`data.derivedAttributes.${attrBaseName}.value`]: newValue
        });
    }

    _onChangeDamageReduction(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = event.currentTarget;
        const value = parseInt(input.value);
        const newValue = (value - parseInt(this.actor.system.damageReduction.value || 0)) +
            parseInt(this.actor.actorData()._source.data.damageReduction.value || 0);
        this.actor.update({
            [`data.damageReduction.value`]: newValue
        });
    }

    _onChangeSkill(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = event.currentTarget;
        const skillBaseName = input.name.split('.')[2];
        if (input.value) {
            const value = parseInt(input.value);

            const newValue = (value - this.actor.skills[skillBaseName].value) +
                parseInt(this.actor.skills[skillBaseName].points || 0);
            this.actor.update({
                [`data.skills.${skillBaseName}.points`]: newValue,
                [`data.skills.${skillBaseName}.value`]: 0
            });
        } else {
            this.actor.update({
                [`data.skills.${skillBaseName}.points`]: 0
            });
        }

    }

    async _onDropItemCreate(itemData) {

        if (["mastery", "npcfeature", "spell", "weapon", "equipment", "shield", "armor", "statuseffect", "spelleffect", "npcattack"].includes(itemData.type)) {
            return super._onDropItemCreate(itemData);
        }

    }



}