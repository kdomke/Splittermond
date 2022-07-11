import * as Dice from "../../util/dice.js"
import * as Costs from "../../util/costs.js"

export default class SplittermondActorSheet extends ActorSheet {
    constructor(...args) {
        super(...args);
        this._hoverOverlays = [];
        this._hideSkills = true;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["splittermond", "sheet", "actor"]
        });
    }

    getData() {
        const sheetData = super.getData();
        sheetData.data = sheetData.data.data;

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

        sheetData.hideSkills = this._hideSkills;
        [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].forEach(skill => {
            sheetData.data.skills[skill].isVisible = ["acrobatics", "athletics", "determination", "stealth", "perception", "endurance"].includes(skill) ||
                (parseInt(sheetData.data.skills[skill].points) > 0) || !this._hideSkills;
        });



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

    _prepareItems(sheetData) {

        sheetData.itemsByType = sheetData.items.reduce((result, item) => {
            if (!(item.type in result)) {
                result[item.type] = [];
            }
            result[item.type].push(item);
            return result;
        }, {});

        if (sheetData.itemsByType.mastery) {
            sheetData.masteriesBySkill = sheetData.itemsByType.mastery.reduce((result, item) => {
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

        sheetData.data.spells.sort((a,b) => (a.sort - b.sort));
        sheetData.data.spellsBySkill = sheetData.data.spells.reduce((result, item) => {
            let skill = item.data.skill || "none";
            if (!(skill in result)) {
                result[skill] = {
                    label: `splittermond.skillLabel.${skill}`,
                    skillValue: sheetData.data.skills[skill].value,
                    spells: []
                };
            }
            let costData = Costs.parseCostsString(item.data.costs);
            let costTotal = costData.channeled + costData.exhausted + costData.consumed;
            item.enoughFocus = costTotal <= this.actor.systemData().focus.available.value;
            result[skill].spells.push(item);
            return result;
        }, {});

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

        html.find('[data-action="inc-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value + 1).change();
        });

        html.find('[data-action="dec-value"]').click((event) => {
            const query = $(event.currentTarget).closestData('input-query');
            let value = parseInt($(html).find(query).val()) || 0;
            $(html).find(query).val(value - 1).change();
        });

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
            return this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: renderSheet });
        });


        html.find('[data-action="delete-item"]').click(async event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            await Hooks.call("redraw-combat-tick");
        });

        html.find('[data-action="edit-item"]').click(event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            this.actor.items.get(itemId).sheet.render(true);
        });

        html.find('[data-action="toggle-equipped"]').click(event => {
            const itemId = $(event.currentTarget).closestData('item-id');
            const item = this.actor.items.get(itemId);
            item.update({ "data.equipped": !item.data.data.equipped });
        });

        html.find('[data-field]').change(event => {
            const element = event.currentTarget;
            let value = element.value;
            if (element.type === "checkbox") {
                value = element.checked;
            }
            const itemId = $(event.currentTarget).closestData('item-id');
            const field = element.dataset.field;
            this.actor.items.get(itemId).update({ [field]: value });
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
                }, this.actor.actorData()));
                newValue[idx][field] = element.value;
            } else {
                newValue = duplicate(array.split('.').reduce(function (prev, curr) {
                    return prev ? prev[curr] : null
                }, this.actor.actorData()));
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
            }, this.actor.actorData()));
            let updateData = {}
            if (array === "data.focus.channeled.entries") {
                let tempValue = parseInt(this.actor.systemData().focus.exhausted.value) + parseInt(arrayData[idx].costs);
                updateData["data.focus.exhausted.value"] = tempValue;
            }

            arrayData.splice(idx, 1);
            updateData[array] = arrayData;
            this.actor.update(updateData);
        });

        html.find('[data-action="add-channeled-focus"]').click(event => {
            let channeledEntries = duplicate(this.actor.systemData().focus.channeled.entries);
            channeledEntries.push({
                description: game.i18n.localize("splittermond.description"),
                costs: 1
            });
            this.actor.update({ "data.focus.channeled.entries": channeledEntries });
        });

        html.find('[data-action="add-channeled-health"]').click(event => {
            let channeledEntries = duplicate(this.actor.systemData().health.channeled.entries);
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
                this.actor.rollSpell(itemId);
            }

            if (type === "damage") {
                const damage = event.currentTarget.dataset.damage;
                const features = event.currentTarget.dataset.features;
                const source = event.currentTarget.dataset.source;
                Dice.damage(damage, features, source);
            }

            if (type === "activeDefense") {
                const itemId = $(event.currentTarget).closestData('defense-id');
                const defenseType = $(event.currentTarget).closestData('defense-type');
                this.actor.rollActiveDefense(defenseType, this.actor.systemData().activeDefense[defenseType].find(el => el._id === itemId));
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

        html.find(".derived-attribute#defense label").click(event => {
            event.preventDefault();
            event.stopPropagation()

            this.actor.activeDefenseDialog("defense");
        });

        html.find(".derived-attribute#bodyresist label").click(event => {
            event.preventDefault();
            event.stopPropagation()

            this.actor.activeDefenseDialog("bodyresist");
        });

        html.find(".derived-attribute#mindresist label").click(event => {
            event.preventDefault();
            event.stopPropagation()

            this.actor.activeDefenseDialog("mindresist");
        });

        html.find(".item-list .item").on("dragstart", event => {
            html.find('#tooltip').remove();
        }).on("dragover", event => {
            event.currentTarget.style.borderTop = "1px solid black";
            event.currentTarget.style.borderImage = "none";
        }).on("dragleave", event => {
            event.currentTarget.style.borderTop = "";
            event.currentTarget.style.borderImage = "";
        });

        html.find(".draggable").on("dragstart", event => {
            const attackId = event.currentTarget.dataset.attackId;
            if (attackId) {
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "attack",
                    attackId: attackId,
                    actorId: this.actor.id
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
                    actorId: this.actor.id
                }));
                event.stopPropagation();
                return;
            }

            const itemId = event.currentTarget.dataset.itemId;
            if (itemId) {
                const itemData = this.actor.actorData().items.find(el => el.id === itemId)?.data;
                event.originalEvent.dataTransfer.setData("text/plain", JSON.stringify({
                    type: "Item",
                    data: itemData,
                    actorId: this.actor._id
                }));
                event.stopPropagation();
                return;
            }

        }).attr('draggable', true);

        html.find("[data-item-id], .list.skills [data-skill], .derived-attribute, .list.attack .value, .list.active-defense .value").hover(event => {
            const itemId = event.currentTarget.dataset.itemId;
            let content = "";
            let css = {
                top: $(event.currentTarget).offset().top + $(event.currentTarget).outerHeight(),
                left: $(event.currentTarget).offset().left,
                display: "none"
            }
            if (itemId) {
                const item = this.actor.actorData().items.find(el => el.id === itemId);

                if (!item) return;

                if (item.systemData().description) {
                    content = TextEditor.enrichHTML(item.systemData().description);
                    if (!content.startsWith("<p>")) {
                        content = `<p>${content}</p>`;
                    }
                }
                if (item.type === "spell") {
                    content += `<p><strong>` + game.i18n.localize("splittermond.enhancementDescription") + ` (${item.systemData().enhancementCosts}):</strong> ${item.systemData().enhancementDescription}</p>`;
                }
            }

            const skillId = event.currentTarget.dataset.skill;

            if (skillId) {
                const skillData = this.actor.systemData().skills[skillId];
                content += '<span class="formula">';
                if (CONFIG.splittermond.skillAttributes[skillId]) {
                    let a = CONFIG.splittermond.skillAttributes[skillId][0];
                    content += `<span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
                    a = CONFIG.splittermond.skillAttributes[skillId][1];
                    content += `<span class="operator">+</span>
                        <span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>
                        <span class="operator">+</span>`;
                }
                content += `<span class="formula-part"><span class="value">${skillData.points}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.skillPointsAbbrev`) + `</span></span>`

                if (skillData.mod) {
                    skillData.mod.sources.forEach(e => {
                        let val = e.value;
                        let cls = "malus";
                        if (val > 0) {
                            val = "+" + val;
                            cls = "bonus";
                        }

                        content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
                    });

                }
                content += '</span>';

                let masteryList = html.find(`.list.masteries li[data-skill="${skillId}"]`);


                if (masteryList.html()) {
                    let posLeft = masteryList.offset().left;
                    let posTop = $(event.currentTarget).offset().top;

                    let width = masteryList.outerWidth();
                    masteryList = masteryList.clone();

                    masteryList.find("button").remove();
                    masteryList = masteryList.wrapAll(`<div class="list tooltip masteries" />`).wrapAll(`<ol class="list-body" />`).parent().parent();
                    masteryList.css({
                        position: "fixed",
                        left: posLeft,
                        top: posTop,
                        width: width
                    })
                    content += masteryList.wrapAll("<div />").parent().html();
                }
            }

            if ($(event.currentTarget).closestData('attack-id')) {
                let attackId = $(event.currentTarget).closestData('attack-id');
                if (this.actor.systemData().attacks.find(a => a._id === attackId)) {
                    let attack = this.actor.systemData().attacks.find(a => a._id === attackId);
                    content += '<span class="formula">';
                    let a = attack.attribute1;
                    content += `<span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
                    a = attack.attribute2;
                    content += `<span class="operator">+</span>
                        <span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>
                        <span class="operator">+</span>`;

                    content += `<span class="formula-part"><span class="value">${attack.skill.points}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.skillPointsAbbrev`) + `</span></span>`
                    if (attack.skill.mod) {
                        attack.skill.mod.sources.forEach(e => {
                            let val = e.value;
                            let cls = "malus";
                            if (val > 0) {
                                val = "+" + val;
                                cls = "bonus";
                            }

                            content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
                        });

                    }
                    content += '</span>';
                }
            }

            if ($(event.currentTarget).closestData('defense-id')) {
                let defenseId = $(event.currentTarget).closestData('defense-id');
                let defenseData = {}
                if (this.actor.systemData().activeDefense.defense.find(a => a._id === defenseId)) {
                    defenseData = this.actor.systemData().activeDefense.defense.find(a => a._id === defenseId)

                }

                if (this.actor.systemData().activeDefense.mindresist.find(a => a._id === defenseId)) {
                    defenseData = this.actor.systemData().activeDefense.mindresist.find(a => a._id === defenseId)

                }


                if (this.actor.systemData().activeDefense.bodyresist.find(a => a._id === defenseId)) {
                    defenseData = this.actor.systemData().activeDefense.bodyresist.find(a => a._id === defenseId)

                }


                content += '<span class="formula">';
                let a = defenseData.attribute1;
                content += `<span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
                a = defenseData.attribute2;
                content += `<span class="operator">+</span>
                    <span class="formula-part"><span class="value">${this.actor.systemData().attributes[a].value}</span>
                    <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>
                    <span class="operator">+</span>`;

                content += `<span class="formula-part"><span class="value">${defenseData.skill.points}</span>
                    <span class="description">` + game.i18n.localize(`splittermond.skillPointsAbbrev`) + `</span></span>`
                if (defenseData.skill?.mod) {
                    defenseData.skill.mod.sources.forEach(e => {
                        let val = e.value;
                        let cls = "malus";
                        if (val > 0) {
                            val = "+" + val;
                            cls = "bonus";
                        }

                        content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
                    });

                }
                content += '</span>';
            }

            if (event.currentTarget.classList.contains("derived-attribute")) {
                let attribute = event.currentTarget.id;
                if (this.actor.systemData().derivedAttributes[attribute]) {
                    content += '<span class="formula">';
                    switch (attribute) {
                        case "size":
                            content += `<span class="formula-part"><span class="value">${this.actor.systemData().derivedAttributes.size.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.derivedAttribute.size.short`) + `</span></span>`
                            break;
                        case "speed":
                            content += `<span class="formula-part"><span class="value">${this.actor.systemData().attributes.agility.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.agility.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().derivedAttributes.size.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.derivedAttribute.size.short`) + `</span></span>`
                            break;
                        case "initiative":
                            content += `<span class="operator">10 -</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.intuition.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.intuition.short`) + `</span></span>`
                            break;
                        case "healthpoints":
                            content += `<span class="formula-part"><span class="value">${this.actor.systemData().derivedAttributes.size.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.derivedAttribute.size.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.constitution.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.constitution.short`) + `</span></span>`
                            break;
                        case "focuspoints":
                            content += `<span class="operator">2 &times; (</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.mystic.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.mystic.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.willpower.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.willpower.short`) + `</span></span>
                                <span class="operator">)</span>`
                            break;
                        case "defense":
                            content += `<span class="operator">12 +</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.agility.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.agility.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.strength.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.strength.short`) + `</span></span>
                                <span class="operator">+ 2 &times;(5 -</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().derivedAttributes.size.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.derivedAttribute.size.short`) + `</span></span>
                                <span class="operator">)</span >`
                            break;
                        case "mindresist":
                            content += `<span class="operator">12 +</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.willpower.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.willpower.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.mind.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.mind.short`) + `</span></span>
                                `
                            break;
                        case "bodyresist":
                            content += `<span class="operator">12 +</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.willpower.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.willpower.short`) + `</span></span>
                                <span class="operator">+</span>
                                <span class="formula-part"><span class="value">${this.actor.systemData().attributes.constitution.value}</span>
                                <span class="description">`+ game.i18n.localize(`splittermond.attribute.constitution.short`) + `</span></span>
                                `
                            break;
                    }

                    if (this.actor.systemData().derivedAttributes[attribute].mod) {
                        this.actor.systemData().derivedAttributes[attribute].mod.sources.forEach(e => {
                            let val = e.value;
                            let cls = "malus";
                            if (attribute === "initiative") {
                                cls = "bonus"
                            }
                            if (val > 0) {
                                val = "+" + val;
                                cls = "bonus";
                                if (attribute === "initiative") {
                                    cls = "malus"
                                }
                            }

                            content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                                <span class="description">${e.description}</span></span>`
                        });

                    }

                    content += '</span>';
                }

            }

            if (content) {
                let tooltipElement = $(`<div id="tooltip">${content}</div>`);
                html.append(tooltipElement);
                if (skillId) {
                    css.left += $(event.currentTarget).outerWidth() - tooltipElement.outerWidth();
                    css.top = $(event.currentTarget).offset().top - $(tooltipElement).outerHeight();
                }

                if (event.currentTarget.classList.contains("attribute") || $(event.currentTarget).closestData('attack-id') || $(event.currentTarget).closestData('defense-id')) {
                    css.left -= tooltipElement.outerWidth() / 2 - $(event.currentTarget).outerWidth() / 2;
                }

                /*
                if (event.currentTarget.classList.contains("attribute")) {
                    css.left += $(event.currentTarget).outerWidth();
                }
                */
                tooltipElement.css(css).fadeIn();

            }
        }, event => {
            html.find("div#tooltip").remove();
        })

        html.find('[data-action="show-hide-skills"]').click(event => {
            this._hideSkills = !this._hideSkills;
            $(event.currentTarget).attr("data-action", "hide-skills");
            this.render();
        });


        if (this._hoverOverlays) {
            let el = html.find(this._hoverOverlays.join(", "));
            if (el.length > 0) {
                el.addClass("hover");
                el.hover(function () {
                    $(this).removeClass("hover");
                });
            }
        }


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
                                    label: game.i18n.localize(`splittermond.skillLabel.${data[0].trim()}`) + " " + data[1],
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
                    if (availableIn.trim())
                        selectedSkill = availableIn;
                }


                if (selectedSkill) {
                    let skillData = selectedSkill.split(" ");
                    itemData.data.skill = skillData[0];
                    itemData.data.skillLevel = skillData[1];
                }

                if (!itemData.data.skill) {
                    return;
                }
            }
        }

        if (itemData.type === "mastery") {
            if (itemData.data.availableIn) {
                let availableIn = itemData.data.availableIn.trim().toLowerCase();
                [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].forEach(i => {
                    availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i} `).toLowerCase(), i);
                });
                let selectedSkill = itemData.data.skill;
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
                    if (availableIn)
                        selectedSkill = availableIn;
                }

                if (selectedSkill === "" || selectedSkill === "none") {
                    return;
                }

                let skillData = selectedSkill.split(" ");
                itemData.data.skill = skillData[0];
                if ([...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].includes(skillData[0])) {
                    itemData.data.skill = skillData[0];
                    if (skillData.length > 1) {
                        itemData.data.level = skillData[1];
                    }
                } else {
                    return;
                }

            }
        }
        
        var rerenderCombatTracker = false;
        if(itemData.type === "statuseffect")
        {
            const currentScene = game.scenes.current?.id || null;
            let combats = game.combats.filter(c => (c.data.scene === null) || (c.data.scene === currentScene));
            if(combats.length > 0)
            {
                var activeCombat = combats.find(e => e.combatants.find(f => f.actor.id == this.actor.id));
                if(activeCombat != null)
                {
                    var currentTick = activeCombat.current.round;
                    //check if this status is already present
                    var hasSameStatus = this.actor.items
                        .filter(e => {
                            return e.data.type == "statuseffect" && e.name == itemData.name && e.data.data.startTick;
                        })
                        .map(e => {
                            var ticks = [];
                            for (let index = 0; index < parseInt(e.data.data.times); index++) {                               
                                ticks.push(parseInt(e.data.data.startTick) + (index * parseInt(e.data.data.interval)));
                            }
                            return {
                                ticks: ticks.filter(f => f >= currentTick),
                                status: e
                            };
                        })
                        .filter(e => e.ticks.length > 0);
                    if(hasSameStatus.length > 0)
                    {
                        //there is already an status with the same type so the new one will start always at the next tick
                        itemData.data.startTick = hasSameStatus[0].ticks[0];
                    }
                    else
                    {
                        itemData.data.startTick = parseInt(activeCombat.data.round) + parseInt(itemData.data.interval);
                    }                    
                    rerenderCombatTracker = true;
                }
            }
        }

        await super._onDropItemCreate(itemData);
        if(rerenderCombatTracker)
        {
            Hooks.call("redraw-combat-tick");
        }
    }


    render(force = false, options = {}) {
        if (this.options.overlays) {
            let html = this.element;
            this._hoverOverlays = [];
            for (let sel of this.options.overlays) {
                let el = html.find(sel + ":hover");
                if (el.length === 1) {
                    this._hoverOverlays.push(sel);
                }
            }
        }
        return super.render(force, options);
    }


}