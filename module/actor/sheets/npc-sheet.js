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
            overlays: ["#health","#focus"]
        });
    }

    getData() {
        const sheetData = super.getData();

        for (let [attrId, attr] of Object.entries(sheetData.data.derivedAttributes)) {
            attr.editable = true;
        }

        sheetData.data.damageReduction.editable = true;

        sheetData.data.attacks.forEach(attack => {
            attack.skill.editable = true;
        });

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
        const newValue = (value - parseInt(this.actor.data.data.derivedAttributes[attrBaseName].value || 0)) +
            parseInt(this.actor.data._source.data.derivedAttributes[attrBaseName].value || 0);
        this.actor.update({
            [`data.derivedAttributes.${attrBaseName}.value`]: newValue
        });
    }

    _onChangeDamageReduction(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = event.currentTarget;
        const value = parseInt(input.value);
        const newValue = (value - parseInt(this.actor.data.data.damageReduction.value || 0)) +
            parseInt(this.actor.data._source.data.damageReduction.value || 0);
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

            const skillValue = this._getClosestData($(input), 'skill-value');
            if (skillValue) {

                const newValue = (value - parseInt(skillValue)) +
                    parseInt(this.actor.data.data.skills[skillBaseName].points || 0);
                this.actor.update({
                    [`data.skills.${skillBaseName}.points`]: newValue,
                    [`data.skills.${skillBaseName}.value`]: 0
                });
            } else {
                const newValue = (value - parseInt(this.actor.data.data.skills[skillBaseName].value || 0)) +
                    parseInt(this.actor.data.data.skills[skillBaseName].points || 0);
                this.actor.update({
                    [`data.skills.${skillBaseName}.points`]: newValue,
                    [`data.skills.${skillBaseName}.value`]: 0
                });
            }
        } else {
            this.actor.update({
                [`data.skills.${skillBaseName}.points`]: 0
            });
        }

    }

    async _onDropItemCreate(itemData) {

        if (["mastery", "npcfeature", "spell", "weapon", "equipment", "shield", "armor", "statuseffect", "spelleffect"].includes(itemData.type)) {
            return super._onDropItemCreate(itemData);
        }

    }



}