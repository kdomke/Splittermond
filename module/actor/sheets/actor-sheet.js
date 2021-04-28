import * as Dice from "../../util/dice.js"

export default class SplittermondActorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "actor"]
        });
    }

    getData() {
        const sheetData = super.getData();

        Handlebars.registerHelper('modifierFormat', (data) => parseInt(data) > 0 ? "+" + parseInt(data) : data);

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
            let text = $(this).val() || $(this).text() || $(this).attr('placeholder');
            $(dummyElement).text(text);
            $(this).css({
                width: dummyElement.width()
            })
            dummyElement.remove();
        }).trigger('input');

        html.find('[data-action="add-item"]').click(event => {
            const itemType = $(event.currentTarget).closestData('item-type');
            const renderSheet = Boolean((event.currentTarget.dataset.renderSheet || "true") === "true");
            let itemData = {
                name: game.i18n.localize("splittermond." + itemType),
                type: itemType
            };

            if (itemType === "mastery") {
                const skill = $(event.currentTarget).closestData('skill');
                if (skill) {
                    itemData.data = {
                        skill: skill
                    }
                }
            }
            return this.actor.createOwnedItem(itemData, { renderSheet: renderSheet });
        });


        html.find('[data-action="delete-item"]').click(event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            this.actor.deleteOwnedItem(itemId);
        });

        html.find('[data-action="edit-item"]').click(event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            this.actor.getOwnedItem(itemId).sheet.render(true);
        });

        html.find('[data-action="toggle-equipped"]').click(event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            const item = this.actor.getOwnedItem(itemId);

            item.update({ "data.equipped": !item.data.data.equipped });
        });

        html.find('[data-field]').change(event => {
            const element = event.currentTarget;
            let value = element.value;
            if (element.type === "checkbox") {
                value = element.checked;
            }
            const itemId = this._getClosestData($(event.currentTarget), 'item-id');
            const field = element.dataset.field;
            this.actor.getOwnedItem(itemId).update({ [field]: value });
        });

        html.find('[data-array-field]').change(event => {
            const element = event.currentTarget
            const idx = parseInt($(event.currentTarget).closestData('index', "0"));
            const array = $(event.currentTarget).closestData('array');
            const field = $(event.currentTarget).closestData('array-field');
            let newValue = [];
            if (!(idx >= 0 && array !== "")) return;
            if (field) {
                newValue = duplicate(array.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, this.actor.data));
                newValue[idx][field] = element.value;
            } else {
                newValue = duplicate(array.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, this.actor.data));
                newValue[idx] = element.value;
            }
            this.actor.update({ [array]: newValue });
        });

        html.find('[data-action="delete-array-element"]').click(event => {
            const element = event.currentTarget
            const idx = parseInt($(event.currentTarget).closestData('index', "0"));
            const array = $(event.currentTarget).closestData('array');
            if (!(idx >= 0 && array !== "")) return;
            let arrayData = duplicate(array.split('.').reduce(function (prev, curr) {
                return prev ? prev[curr] : null
            }, this.actor.data));
            let updateData = {}
            if (array === "data.focus.channeled.entries") {
                let tempValue = parseInt(this.actor.data.data.focus.exhausted.value) + parseInt(arrayData[idx].costs);
                updateData["data.focus.exhausted.value"] = tempValue;
            }

            arrayData.splice(idx, 1);
            updateData[array] = arrayData;
            this.actor.update(updateData);
        });

        html.find('[data-action="add-channeled-focus"]').click(event => {
            let channeledEntries = duplicate(this.actor.data.data.focus.channeled.entries);
            channeledEntries.push({
                description: game.i18n.localize("splittermond.description"),
                costs: 1
            });
            this.actor.update({ "data.focus.channeled.entries": channeledEntries });
        });

        html.find('[data-action="add-channeled-health"]').click(event => {
            let channeledEntries = duplicate(this.actor.data.data.health.channeled.entries);
            channeledEntries.push({
                description: game.i18n.localize("splittermond.description"),
                costs: 1
            });
            this.actor.update({ "data.health.channeled.entries": channeledEntries });
        });

        html.find('[data-action="long-rest"]').click(event => {
            this.actor.longRest();
        });

        html.find('[data-action="short-rest"]').click(event => {
            this.actor.shortRest();
        });


        html.find(".rollable").click(event => {
            const type = $(event.currentTarget).closestData('roll-type');
            if (type === "skill") {
                const skill = $(event.currentTarget).closestData('skill');
                this.actor.rollSkill(skill);
            }

            if (type === "attack") {
                const attackId = $(event.currentTarget).closestData('attack-id');
                this.actor.rollAttack(attackId);
            }
            if (type === "spell") {
                const itemId = $(event.currentTarget).closestData('item-id');
                this.actor.rollSpell(this.actor.data.items.find(el => el._id === itemId));
            }

            if (type === "damage") {
                const damage = event.currentTarget.dataset.damage;
                const features = event.currentTarget.dataset.features;
                Dice.damage(damage, features);
            }

            if (type === "activeDefense") {
                const itemId = $(event.currentTarget).closestData('item-id');
                const defenseType = $(event.currentTarget).closestData('defense-type');
                this.actor.rollActiveDefense(defenseType, this.actor.data.data.activeDefense[defenseType].find(el => el._id === itemId));
            }
        });

        html.find(".add-tick").click(event => {
            let value = $(event.currentTarget).closestData('ticks');
            let message = $(event.currentTarget).closestData('message');

            this.actor.addTicks(value, message);
        })

        html.find(".consume").click(event => {
            const type = $(event.currentTarget).closestData('type');
            const value = $(event.currentTarget).closestData('value');
            if (type === "focus") {
                const description = $(event.currentTarget).closestData('description');
                this.actor.consumeCost(type, value, description);
            }
        })

        $(".draggable").on("dragstart", event => {
            const attackId = event.currentTarget.dataset.attackId;
            if (attackId) {
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "attack",
                    attackId: attackId,
                    actorId: this.actor._id
                }));
                event.stopPropagation();
                return;
            }

            const skill = event.currentTarget.dataset.skill;
            if (skill) {
                const skill = $(event.currentTarget).closestData('skill');
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "skill",
                    skill: skill,
                    actorId: this.actor_id
                }));
                event.stopPropagation();
                return;
            }

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

        }).attr('draggable', true);


        super.activateListeners(html);
    }

    async _onDropItemCreate(itemData) {
        if (itemData.type === "spell") {
            if (itemData.data.availableIn) {
                let availableIn = itemData.data.availableIn.trim().toLowerCase();
                CONFIG.splittermond.skillGroups.magic.forEach(i => {
                    availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase(), i);
                });
                let selectedSkill = "";
                if (availableIn.split(",").length > 1) {
                    let p = new Promise((resolve, reject) => {
                        let buttons = {};


                        availableIn.split(",").forEach(item => {
                            let data = item.trim().toLowerCase().split(" ");
                            if (CONFIG.splittermond.skillGroups.magic.includes(data[0])) {
                                buttons[data[0]] = {
                                    label: game.i18n.localize(`splittermond.skillLabel.${data[0]}`) + " " + data[1],
                                    callback: html => {
                                        resolve(data[0] + " " + data[1])
                                    }
                                }
                            }
                        });
                        buttons["_cancel"] = {
                            label: game.i18n.localize("splittermond.cancel"),
                            callback: html => {
                                resolve("");
                            }
                        }
                        let dialog = new Dialog({
                            title: game.i18n.localize("splittermond.chooseMagicSkill"),
                            content: "",
                            buttons: buttons
                        }, {
                            classes: ["splittermond", "dialog", "selection"]
                        });
                        dialog.render(true);
                    });

                    selectedSkill = await p;
                } else {
                    selectedSkill = availableIn;
                }


                if (selectedSkill) {
                    let skillData = selectedSkill.split(" ");
                    itemData.data.skill = skillData[0];
                    itemData.data.skillLevel = skillData[1];
                }
            }
        }

        if (itemData.type === "mastery") {
            if (itemData.data.availableIn) {
                let availableIn = itemData.data.availableIn.trim().toLowerCase();
                [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].forEach(i => {
                    availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase(), i);
                });
                let selectedSkill = "";
                if (availableIn.split(",").length > 1) {
                    let p = new Promise((resolve, reject) => {
                        let buttons = {};


                        availableIn.split(",").forEach(item => {
                            let data = item.trim().toLowerCase().split(" ");
                            if (data.length < 2) {
                                data[1] = itemData.data.level;
                            }
                            if ([...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].includes(data[0])) {
                                buttons[data[0]] = {
                                    label: game.i18n.localize(`splittermond.skillLabel.${data[0]}`),
                                    callback: html => {
                                        resolve(data[0] + " " + data[1])
                                    }
                                }
                            }
                        });
                        buttons["_cancel"] = {
                            label: game.i18n.localize("splittermond.cancel"),
                            callback: html => {
                                resolve("");
                            }
                        }
                        let dialog = new Dialog({
                            title: game.i18n.localize("splittermond.chooseSkill"),
                            content: "",
                            buttons: buttons
                        }, {
                            classes: ["splittermond", "dialog", "selection"]
                        });
                        dialog.render(true);
                    });

                    selectedSkill = await p;
                } else {
                    selectedSkill = availableIn;
                }


                if (selectedSkill) {
                    let skillData = selectedSkill.split(" ");
                    itemData.data.skill = skillData[0];
                    if (skillData.length > 1) {
                        itemData.data.level = skillData[1];
                    }
                }
            }
        }

        return super._onDropItemCreate(itemData);
    }









}