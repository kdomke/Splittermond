import SplittermondSpeciesWizard from "../../apps/wizards/species.js"
import SplittermondActorSheet from "./actor-sheet.js"
import * as Dice from "../../util/dice.js"
import CheckDialog from "../../apps/dialog/check-dialog.js";


export default class SplittermondNPCSheet extends SplittermondActorSheet {

    constructor(...args) {
        super(...args);

        this._hideSkills = true;
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/sheets/actor/npc-sheet.hbs",
            classes: ["splittermond", "sheet", "actor", "npc"],
            tabs: [{ navSelector: ".tabs[data-group='primary']", contentSelector: "main", initial: "general" },
            { navSelector: ".tabs[data-group='fight-action-type']", contentSelector: "section div.tab-list", initial: "attack" }],
            scrollY: [".tab.general", ".tab.spells", ".tab.inventory"],
            submitOnClose: false
        });
    }

    getData() {
        const sheetData = super.getData();

        sheetData.hideSkills = this._hideSkills;


        for (let [attrId, attr] of Object.entries(sheetData.data.derivedAttributes)) {
            attr.editable = true;
        }

        sheetData.data.damageReduction.editable = true;

        CONFIG.splittermond.skillGroups.general.forEach(skill => {
            sheetData.data.generalSkills[skill].isVisible = ["acrobatics", "athletics", "determination", "stealth", "perception", "endurance"].includes(skill) ||
                (parseInt(sheetData.data.generalSkills[skill].points) > 0) || !this._hideSkills;
        });

        CONFIG.splittermond.skillGroups.magic.forEach(skill => {
            sheetData.data.magicSkills[skill].isVisible = parseInt(sheetData.data.magicSkills[skill].points) > 0 || !this._hideSkills;
        });

        sheetData.data.attacks.forEach(attack => {
            attack.skill.editable = true;
        });



        //this._prepareItems(sheetData);

        //sheetData.config = CONFIG.splittermond;

        console.log("getData()");


        return sheetData;
    }
    activateListeners(html) {

        html.find('.attribute input[name^="data.derivedAttributes"]').change(this._onChangeDerivedAttribute.bind(this));
        html.find('input[name^="data.damageReduction"]').change(this._onChangeDamageReduction.bind(this));

        html.find('input[name^="data.skills"]').change(this._onChangeSkill.bind(this));

        html.find('[data-action="show-hide-skills"]').click(event => {
            this._hideSkills = !this._hideSkills;
            $(event.currentTarget).attr("data-action", "hide-skills");
            this.render();
        });


        super.activateListeners(html);
    }
    _onChangeDerivedAttribute(event) {
        event.preventDefault();
        event.stopPropagation();

        const input = event.currentTarget;
        const value = parseInt(input.value);
        const attrBaseName = input.name.split('.')[2];
        const newValue = (value - parseInt(this.actor.data.data.derivedAttributes[attrBaseName].value || 0)) +
            parseInt(this.actor._data.data.derivedAttributes[attrBaseName].value || 0);
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
            parseInt(this.actor._data.data.damageReduction.value || 0);
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
                    [`data.skills.${skillBaseName}.points`]: newValue
                });
            } else {
                const newValue = (value - parseInt(this.actor.data.data.skills[skillBaseName].value || 0)) +
                    parseInt(this.actor.data.data.skills[skillBaseName].points || 0);
                this.actor.update({
                    [`data.skills.${skillBaseName}.points`]: newValue
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