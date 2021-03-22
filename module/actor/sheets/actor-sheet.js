import * as Dice from "../../util/dice.js"

export default class SplittermondActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "actor"]
        });
    }

    getData() {
        const sheetData = super.getData();

        if (sheetData.data.attributes) {
            for (let [attrId, attr] of Object.entries(sheetData.data.attributes)) {
                attr.label = {
                    short: `splittermond.attribute.${attrId}.short`,
                    long: `splittermond.attribute.${attrId}.long`
                };
            }
        }

        if (sheetData.data.derivedAttributes) {
            for (let [attrId, attr] of Object.entries(sheetData.data.derivedAttributes)) {
                attr.label = {
                    short: `splittermond.derivedAttribute.${attrId}.short`,
                    long: `splittermond.derivedAttribute.${attrId}.long`
                };
            }
        }

        if (sheetData.data.skills) {
            for (let [skillId, skill] of Object.entries(sheetData.data.skills)) {
                skill.label = `splittermond.skillLabel.${skillId}`;
            }
            sheetData.data.fightingSkills = {};
            CONFIG.splittermond.skillGroups.fighting.forEach(skill => {
                if (!sheetData.data.skills[skill]) {
                    sheetData.data.skills[skill] = {
                        points: 0
                    }
                }
                sheetData.data.fightingSkills[skill] = duplicate(sheetData.data.skills[skill]);
                sheetData.data.fightingSkills[skill].label = `splittermond.skillLabel.${skill}`;

            });
            sheetData.data.generalSkills = {};
            CONFIG.splittermond.skillGroups.general.forEach(skill => {
                if (!sheetData.data.skills[skill]) {
                    sheetData.data.skills[skill] = {
                        points: 0
                    }
                }
                sheetData.data.generalSkills[skill] = duplicate(sheetData.data.skills[skill]);
                sheetData.data.generalSkills[skill].label = `splittermond.skillLabel.${skill}`;
                sheetData.data.generalSkills[skill].attribute1 = {
                    label: `splittermond.attribute.${CONFIG.splittermond.skillAttributes[skill][0]}.short`
                }
                sheetData.data.generalSkills[skill].attribute2 = {
                    label: `splittermond.attribute.${CONFIG.splittermond.skillAttributes[skill][1]}.short`
                }
            });
            sheetData.data.magicSkills = {};
            CONFIG.splittermond.skillGroups.magic.forEach(skill => {
                if (!sheetData.data.skills[skill]) {
                    sheetData.data.skills[skill] = {
                        points: 0
                    }
                }
                sheetData.data.magicSkills[skill] = duplicate(sheetData.data.skills[skill]);
                sheetData.data.magicSkills[skill].label = `splittermond.skillLabel.${skill}`;
                sheetData.data.magicSkills[skill].attribute1 = {
                    label: `splittermond.attribute.${CONFIG.splittermond.skillAttributes[skill][0]}.short`
                }
                sheetData.data.magicSkills[skill].attribute2 = {
                    label: `splittermond.attribute.${CONFIG.splittermond.skillAttributes[skill][1]}.short`
                }
            });
        }
        this._prepareItems(sheetData);



        console.log("getData()");


        return sheetData;
    }

    _prepareItems(data) {
        data.itemsByType = data.items.reduce((result, item) => {
            if (!(item.type in result)) {
                result[item.type] = [];
            }
            result[item.type].push(item);
            return result;
        }, {});

        if (data.itemsByType.mastery) {
            data.masteriesBySkill = data.itemsByType.mastery.reduce((result, item) => {
                let skill = item.data.skill || "none";
                if (!(skill in result)) {
                    result[skill] = {
                        label: `splittermond.skillLabel.${skill}`,
                        masteries: []
                    };
                }
                result[skill].masteries.push(item);
                return result;
            }, {});
        }
        data.spellsBySkill = {};
        if (data.itemsByType.spell) {
            data.spellsBySkill = data.itemsByType.spell.reduce((result, item) => {
                let skill = item.data.skill || "none";
                if (!(skill in result)) {
                    result[skill] = {
                        label: `splittermond.skillLabel.${skill}`,
                        skillValue: data.data.skills[skill]?.value || 0,
                        spells: []
                    };
                }
                result[skill].spells.push(item);
                return result;
            }, {});
        }

        CONFIG.splittermond.skillGroups.magic.forEach(skill => {
            if (data.data.skills[skill].points > 0 && !(skill in data.spellsBySkill)) {
                data.spellsBySkill[skill] = {
                    label: `splittermond.skillLabel.${skill}`,
                    skillValue: data.data.skills[skill].value,
                    spells: []
                };
            };
        });

    }

    _getClosestData(jQObject, dataName, defaultValue = "") {
        let value = jQObject.closest(`[data-${dataName}]`)?.data(dataName);
        return (value) ? value : defaultValue;
    }


    activateListeners(html) {
        html.find('input.autoexpand').on('input', function () {
            let dummyElement = $('<span id="autoexpanddummy"/>').hide();
            $(this).after(dummyElement);
            dummyElement.text($(this).val() || $(this).text() || $(this).attr('placeholder'));
            $(this).css({
                width: dummyElement.width()
            })
            dummyElement.remove();
        }).trigger('input');

        html.find('[data-action="add-item"]').click(event => {
            const itemType = this._getClosestData($(event.currentTarget), 'item-type');
            const renderSheet = Boolean((event.currentTarget.dataset.renderSheet || "true") === "true");
            let itemData = {
                name: game.i18n.localize("splittermond." + itemType),
                type: itemType
            };

            if (itemType === "mastery") {
                const skill = this._getClosestData($(event.currentTarget), 'skill');
                if (skill) {
                    itemData.data = {
                        skill: skill
                    }
                }
            }
            return this.actor.createOwnedItem(itemData, { renderSheet: renderSheet });
        });


        html.find('[data-action="delete-item"]').click(event => {
            const itemId = this._getClosestData($(event.currentTarget), 'item-id');
            this.actor.deleteOwnedItem(itemId);
        });

        html.find('[data-action="edit-item"]').click(event => {
            const itemId = this._getClosestData($(event.currentTarget), 'item-id');
            this.actor.getOwnedItem(itemId).sheet.render(true);
        });

        html.find('[data-action="toggle-equipped"]').click(event => {
            const itemId = this._getClosestData($(event.currentTarget), 'item-id');
            const item = this.actor.getOwnedItem(itemId);

            item.update({ "data.equipped": !item.data.data.equipped });
        });

        html.find('[data-field]').change(event => {
            const element = event.currentTarget
            const itemId = this._getClosestData($(event.currentTarget), 'item-id');
            const field = element.dataset.field;
            this.actor.getOwnedItem(itemId).update({ [field]: element.value });
        });

        html.find('[data-array-field]').change(event => {
            const element = event.currentTarget
            const idx = parseInt(this._getClosestData($(event.currentTarget), 'index', "0"));
            const array = this._getClosestData($(event.currentTarget), 'array');
            const field = this._getClosestData($(event.currentTarget), 'array-field');
            let newValue = [];
            if (!(idx >= 0 && array !== "")) return;
            if (field) {
                newValue = array.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, this.actor.data);
                newValue[idx][field] = element.value;
            } else {
                newValue = array.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, this.actor.data);
                newValue[idx] = element.value;
            }
            this.actor.update({ [array]: newValue });
        });

        html.find('[data-action="delete-array-element"]').click(event => {
            const element = event.currentTarget
            const idx = parseInt(this._getClosestData($(event.currentTarget), 'index', "0"));
            const array = this._getClosestData($(event.currentTarget), 'array');
            if (!(idx >= 0 && array !== "")) return;
            let arrayData = array.split('.').reduce(function (prev, curr) {
                return prev ? prev[curr] : null
            }, this.actor.data);
            let updateData = {}
            if (array === "data.focus.channeled.entries") {
                this.actor.data.data.focus.exhausted.value = parseInt(this.actor.data.data.focus.exhausted.value) + parseInt(arrayData[idx].costs);
                updateData["data.focus.exhausted.value"] = this.actor.data.data.focus.exhausted.value;
            }

            arrayData.splice(idx, 1);
            updateData[array] = arrayData;
            this.actor.update(updateData);
        });

        html.find('[data-action="add-channeled-focus"]').click(event => {
            this.actor.data.data.focus.channeled.entries.push({
                description: game.i18n.localize("splittermond.description"),
                costs: 1
            });
            this.actor.update({ "data.focus.channeled.entries": this.actor.data.data.focus.channeled.entries });
        });

        html.find('[data-action="add-channeled-health"]').click(event => {
            this.actor.data.data.health.channeled.entries.push({
                description: game.i18n.localize("splittermond.description"),
                costs: 1
            });
            this.actor.update({ "data.health.channeled.entries": this.actor.data.data.health.channeled.entries });
        });

        html.find('[data-action="long-rest"]').click(event => {
            this.actor.longRest();
        });

        html.find('[data-action="short-rest"]').click(event => {
            this.actor.shortRest();
        });


        html.find(".rollable").click(event => {
            const type = this._getClosestData($(event.currentTarget), 'roll-type');
            if (type === "skill") {
                const skill = this._getClosestData($(event.currentTarget), 'skill');
                this.actor.rollSkill(skill);
            }

            if (type === "attack") {
                const itemId = this._getClosestData($(event.currentTarget), 'item-id');
                this.actor.rollAttack(this.actor.data.items.find(el => el._id === itemId));
            }
            if (type === "spell") {
                const itemId = this._getClosestData($(event.currentTarget), 'item-id');
                this.actor.rollSpell(this.actor.data.items.find(el => el._id === itemId));
            }

            if (type === "damage") {
                const damage = event.currentTarget.dataset.damage;
                const features = event.currentTarget.dataset.features;
                Dice.damage(damage, features);
            }

            if (type === "activeDefense") {
                const itemId = this._getClosestData($(event.currentTarget), 'item-id');
                const defenseType = this._getClosestData($(event.currentTarget), 'defense-type');
                this.actor.rollActiveDefense(defenseType, this.actor.data.data.activeDefense[defenseType].find(el => el._id === itemId));
            }
        });

        html.find(".add-tick").click(event => {
            let value = this._getClosestData($(event.currentTarget), 'ticks');
            let message = this._getClosestData($(event.currentTarget), 'message');

            this.actor.addTicks(value, message);
        })

        html.find(".consume").click(event => {
            const type = this._getClosestData($(event.currentTarget), 'type');
            const value = this._getClosestData($(event.currentTarget), 'value');
            if (type === "focus") {
                const description = this._getClosestData($(event.currentTarget), 'description');
                this.actor.consumeCost(type, value, description);
            }
        })

        $(".draggable").on("dragstart", event => {
            const itemId = event.currentTarget.dataset.itemId;
            if (itemId) {
                const itemData = this.actor.data.items.find(el => el._id === itemId);
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "Item",
                    data: itemData,
                    actorId: this.actor._id
                }));
                event.stopPropagation();
                return;
            }

            const skill = event.currentTarget.dataset.skill;
            if (skill) {
                const skill = this._getClosestData($(event.currentTarget), 'skill');
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "skill",
                    skill: skill,
                    actorId: this.actor_id
                }));
                event.stopPropagation();
                return;
            }
            /*
            const type = this._getClosestData($(event.currentTarget), 'roll-type');
            if (type === "skill") {
                const skill = this._getClosestData($(event.currentTarget), 'skill');
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "skill",
                    skill: skill
                }));
            }

            if (type === "attack") {
                const itemId = this._getClosestData($(event.currentTarget), 'item-id');
                const item = this.actor.data.items.find(el => el._id === itemId);
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "attack",
                    actor: this.actor._id,
                    item: item
                }));
            }

            if (type === "spell") {
                const itemId = this._getClosestData($(event.currentTarget), 'item-id');
                const item = this.actor.data.items.find(el => el._id === itemId);
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "spell",
                    actor: this.actor._id,
                    item: item
                }));
            }
            */

        }).attr('draggable', true);


        super.activateListeners(html);
    }








}