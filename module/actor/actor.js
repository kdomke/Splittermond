import * as Dice from "../util/dice.js"
import CheckDialog from "../apps/dialog/check-dialog.js"

export default class SplittermondActor extends Actor {
    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;

        data.health.woundMalus = {
            nbrLevels: 5,
            level: 0,
            value: 0,
            mod: 0
        }

        if (actorData.type === "character") {

            data.experience.heroLevel = CONFIG.splittermond.heroLevel.reduce((acc, minXP) => acc + ((minXP <= data.experience.spent) ? 1 : 0), 0);
            data.experience.nextLevelValue = CONFIG.splittermond.heroLevel[Math.min(data.experience.heroLevel, 3)];
            data.experience.percentage = data.experience.spent - CONFIG.splittermond.heroLevel[Math.min(Math.max(data.experience.heroLevel - 1, 0), 3)];
            data.experience.percentage /= data.experience.nextLevelValue;
            data.experience.percentage = Math.min(data.experience.percentage * 100, 100);
            data.bonusCap = data.experience.heroLevel + 2;

        }

        if (actorData.type === "npc") {
            data.bonusCap = 6;
        }
        this._prepareDerivedAttributes();

        this._prepareSkills();
        this._prepareArmor();
        this._prepareModifier();

        this._applyModifier();

        actorData.items.forEach(item => {
            item.inInventory = true
        });

        this._prepareWeapons();


        this._prepareHealthFocus();

        this._prepareSpells();


        this._prepareActiveDefense();


    }

    _prepareSpells() {
        const actorData = this.data;
        const data = actorData.data;

        actorData.items.forEach(item => {
            if (item.type === "spell") {
                let costData = this._parseCostsString(item.data.costs);
                let costTotal = costData.channeled + costData.exhausted + costData.consumed;
                item.enoughFocus = costTotal <= data.focus.available.value;
            }

        });
    }

    _prepareHealthFocus() {
        const actorData = this.data;
        const data = actorData.data;

        data.health.woundMalus.levels = CONFIG.splittermond.woundMalus[data.health.woundMalus.nbrLevels];
        data.health.woundMalus.levels = data.health.woundMalus.levels.map(i => Math.min(i - data.health.woundMalus.mod, 0));

        ["health", "focus"].forEach((type) => {
            if (data[type].channeled.hasOwnProperty("entries")) {
                data[type].channeled.value = Math.max(
                    Math.min(
                        data[type].channeled.entries.reduce((acc, val) => acc + parseInt(val.costs || 0), 0),
                        data.derivedAttributes[type + "points"].value
                    ),
                    0);
            } else {
                data[type].channeled = {
                    value: 0,
                    entries: []
                }
            }

            if (!data[type].exhausted.value) {
                data[type].exhausted = {
                    value: 0
                }
            }

            data[type].exhausted.value = parseInt(data[type].exhausted.value);

            if (!data[type].consumed.value) {
                data[type].consumed = {
                    value: 0
                }
            }

            data[type].consumed.value = parseInt(data[type].consumed.value);
            if (type == "health") {
                data[type].available = {
                    value: Math.max(Math.min(data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value - data[type].channeled.value - data[type].exhausted.value - data[type].consumed.value, 5 * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].total = {
                    value: Math.max(Math.min(data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value - data[type].consumed.value, data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].available.percentage = 100 * data[type].available.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].exhausted.percentage = 100 * data[type].exhausted.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].channeled.percentage = 100 * data[type].channeled.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].total.percentage = 100 * data[type].total.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
            } else {

                data[type].available = {
                    value: Math.max(Math.min(data.derivedAttributes[type + "points"].value - data[type].channeled.value - data[type].exhausted.value - data[type].consumed.value, data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].total = {
                    value: Math.max(Math.min(data.derivedAttributes[type + "points"].value - data[type].consumed.value, data.derivedAttributes[type + "points"].value), 0)
                }
                if (data.derivedAttributes[type + "points"].value) {
                    data[type].available.percentage = 100 * data[type].available.value / (data.derivedAttributes[type + "points"].value);
                    data[type].exhausted.percentage = 100 * data[type].exhausted.value / (data.derivedAttributes[type + "points"].value);
                    data[type].channeled.percentage = 100 * data[type].channeled.value / (data.derivedAttributes[type + "points"].value);
                    data[type].total.percentage = 100 * data[type].total.value / (data.derivedAttributes[type + "points"].value);
                } else {
                    data[type].available.percentage = 0;
                    data[type].exhausted.percentage = 0;
                    data[type].channeled.percentage = 0;
                    data[type].total.percentage = 0;
                }

            }



        });



        data.health.woundMalus.level = data.health.woundMalus.nbrLevels - Math.ceil(data.health.total.value / data.derivedAttributes.healthpoints.value);
        data.health.woundMalus.value = data.health.woundMalus.levels[data.health.woundMalus.level];

        if (data.health.woundMalus.value) {
            ["speed", "initiative"].forEach((type) => {
                if (!data.derivedAttributes[type].malus) {
                    data.derivedAttributes[type].malus = {
                        all: []
                    };
                }
                data.derivedAttributes[type].malus.all.push({ value: data.health.woundMalus.value, description: game.i18n.localize("splittermond.woundMalus") });
                data.derivedAttributes[type].value += data.health.woundMalus.value;
            });
        }

    }

    _prepareWeapons() {
        const actorData = this.data;
        const data = actorData.data;
        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                if (item.data.secondaryAttack) {
                    if (!(item.data.secondaryAttack.skill === "" || item.data.secondaryAttack.skill === "none")) {
                        let newWeaponData = duplicate(item);
                        newWeaponData._id += "_secondary";
                        newWeaponData.data.skill = newWeaponData.data.secondaryAttack.skill;
                        newWeaponData.data.attribute1 = newWeaponData.data.secondaryAttack.attribute1;
                        newWeaponData.data.attribute2 = newWeaponData.data.secondaryAttack.attribute2;
                        newWeaponData.data.weaponSpeed = newWeaponData.data.secondaryAttack.weaponSpeed;
                        newWeaponData.data.range = newWeaponData.data.secondaryAttack.range;
                        newWeaponData.data.features = newWeaponData.data.secondaryAttack.features;
                        newWeaponData.data.damage = newWeaponData.data.secondaryAttack.damage;
                        newWeaponData.data.minAttributes = newWeaponData.data.secondaryAttack.minAttributes;
                        newWeaponData.inInventory = false;
                        newWeaponData.name = newWeaponData.name + " (" + game.i18n.localize("splittermond.skillLabel." + newWeaponData.data.secondaryAttack.skill) + ")";
                        actorData.items.push(newWeaponData);
                    }
                }
            }

            if (item.type === "shield") {
                let newWeaponData = duplicate(item);
                newWeaponData._id += "_attack";
                newWeaponData.type = "weapon";
                newWeaponData.data.attribute1 = "agility";
                newWeaponData.data.attribute2 = "strength";
                newWeaponData.data.weaponSpeed = "7 Ticks";
                newWeaponData.data.range = 0;
                newWeaponData.data.features = "";
                newWeaponData.data.damage = "1W6+1";
                newWeaponData.data.minAttributes = "";
                newWeaponData.inInventory = false;
                actorData.items.push(newWeaponData);
            }
        });
        if (actorData.type === "character") {
            actorData.items.push({
                _id: "weaponless",
                type: "weapon",
                name: game.i18n.localize("splittermond.weaponless"),
                img: "icons/equipment/hand/gauntlet-simple-leather-brown.webp",
                inInventory: false,
                data: {
                    weaponSpeed: 5,
                    damage: "1D6",
                    features: "Entwaffnend 1, Stumpf, Umklammern",
                    range: 0,
                    skill: "melee",
                    attribute1: "agility",
                    attribute2: "strength",
                    equipped: true
                }
            });
        }




        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                item.data.skillValue = parseInt(data.skills[item.data.skill].points);
                item.data.skillValue += parseInt(data.attributes[item.data.attribute1].value);
                item.data.skillValue += parseInt(data.attributes[item.data.attribute2].value);
                item.data.weaponSpeed = parseInt(item.data.weaponSpeed) + parseInt(data.tickMalus.value);
            }

            if (item.type === "shield") {
                item.data.skillValue = parseInt(data.skills[item.data.skill].points);
                item.data.skillValue += parseInt(data.attributes.intuition.value);
                item.data.skillValue += parseInt(data.attributes.strength.value);
                item.data.attribute1 = "intuition";
                item.data.attribute2 = "strength";
            }

        });
    }

    _prepareActiveDefense() {
        const actorData = this.data;
        const data = actorData.data;
        data.activeDefense = {}

        data.activeDefense.defense = [];
        data.activeDefense.defense.push({
            _id: "acrobatics",
            type: "skill",
            name: game.i18n.localize("splittermond.skillLabel.acrobatics"),
            data: {
                skill: "acrobatics",
                skillValue: parseInt(this.data.data.skills.acrobatics.value),
                features: ""
            }
        });
        data.activeDefense.mindresist = [];
        data.activeDefense.mindresist.push({
            _id: "determination",
            type: "skill",
            name: game.i18n.localize("splittermond.skillLabel.determination"),
            data: {
                skill: "determination",
                skillValue: parseInt(this.data.data.skills.determination.value),
                features: ""
            }
        });

        data.activeDefense.bodyresist = [];
        data.activeDefense.bodyresist.push({
            _id: "endurance",
            type: "skill",
            name: game.i18n.localize("splittermond.skillLabel.endurance"),
            data: {
                skill: "endurance",
                skillValue: parseInt(this.data.data.skills.endurance.value),
                features: ""
            }
        });


        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                if (["melee", "slashing", "chains", "blades", "staffs"].includes(item.data.skill)) {
                    if (!item._id.endsWith("_attack") && item.data.equipped) {
                        data.activeDefense.defense.push(item);
                    }

                }
            } else if (item.type === "shield") {
                if (item.data.equipped) {
                    data.activeDefense.defense.push(item);
                }
            }
        });
    }

    _addModifier(name, str, type = "misc") {
        const actorData = this.data;
        const data = actorData.data;
        let allSkills = [CONFIG.splittermond.skillGroups.general,
        ...CONFIG.splittermond.skillGroups.fighting,
        ...CONFIG.splittermond.skillGroups.magic]

        str.split(',').forEach(str => {
            let temp = str.split(' ');
            let value = parseInt(temp[1]);
            if (value) {
                let dataset;
                let element = CONFIG.splittermond.derivedAttributes.find(attr => {
                    return temp[0] === game.i18n.localize(`splittermond.derivedAttribute.${attr}.short`)
                });
                if (element) {
                    dataset = data.derivedAttributes[element];
                } else {
                    if (CONFIG.splittermond.skillGroups.general.includes(temp[0])) {
                        dataset = data.skills[temp[0]];
                    };

                    if (temp[0] === "handicap") {
                        dataset = data.handicap;
                    }
                }

                if (dataset) {
                    if (!dataset.malus)
                        dataset.malus = {
                            all: []
                        };
                    if (!dataset.bonus)
                        dataset.bonus = {
                            magic: [],
                            equipment: [],
                            misc: [],
                        };

                    if (value > 0) {
                        dataset.bonus[type].push({ value: value, description: name });
                    } else {
                        dataset.malus.all.push({ value: -value, description: name });
                    }
                    return
                }

                if (temp[0] === "handicap.shield.mod") {
                    if (!data.handicap.shield.mod) {
                        data.handicap.shield.mod = 0;
                    }
                    data.handicap.shield.mod += value;
                }

                if (temp[0] === "handicap.armor.mod") {
                    if (!data.handicap.armor.mod) {
                        data.handicap.armor.mod = 0;
                    }
                    data.handicap.armor.mod += value;
                }

                if (temp[0] === "tickmalus.shield.mod") {
                    if (!data.tickMalus.shield.mod) {
                        data.tickMalus.shield.mod = 0;
                    }
                    data.tickMalus.shield.mod += value;
                }

                if (temp[0] === "tickmalus.armor.mod") {
                    if (!data.tickMalus.armor.mod) {
                        data.tickMalus.armor.mod = 0;
                    }
                    data.tickMalus.armor.mod += value;
                }

                if (temp[0] === "woundMalus.nbrLevels") {
                    data.health.woundMalus.nbrLevels = value;
                }

                if (temp[0] === "woundMalus.mod") {
                    data.health.woundMalus.mod += value;
                }

                if (temp[0] === "splinterpoints") {
                    data.splinterpoints.max = parseInt(data.splinterpoints.max) + value;
                }
            }
        });
    }

    _prepareModifier() {
        const actorData = this.data;
        const data = actorData.data;

        actorData.items.forEach(i => {
            if (["equipment", "weapon", "shield", "armor"].includes(i.type)) {
                if (i.data.modifier) {
                    this._addModifier(i.name, i.data.modifier, "equipment");
                }
            }
            if (["mastery", "strength", "npcfeature"].includes(i.type)) {
                if (i.data.modifier) {
                    if (i.type === "strength") {
                        for (var k = 0; k < parseInt(i.data.quantity); k = k + 1) {
                            this._addModifier(i.name, i.data.modifier);
                        }
                    } else {
                        this._addModifier(i.name, i.data.modifier);
                    }

                }
            }
        });

    }


    _prepareArmor() {
        const actorData = this.data;
        const data = actorData.data;

        data.handicap = {
            shield: {
                value: actorData.items.reduce((acc, i) => ((i.type === "shield") && i.data.equipped) ? acc + parseInt(i.data.handicap) : acc, 0)
            },
            armor: {
                value: actorData.items.reduce((acc, i) => ((i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.handicap) : acc, 0)
            }
        }

        data.tickMalus = {
            shield: {
                value: actorData.items.reduce((acc, i) => ((i.type === "shield") && i.data.equipped) ? acc + parseInt(i.data.tickMalus) : acc, 0)
            },
            armor: {
                value: actorData.items.reduce((acc, i) => ((i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.tickMalus) : acc, 0)
            }
        };

        actorData.items.forEach(i => {
            if (i.type === "armor" || i.type === "shield") {
                if (i.data.equipped && i.data.defenseBonus != 0) {
                    this._addModifier(i.name, `VTD ${i.data.defenseBonus}`, "equipment");
                }
            }
        });

    }

    _applyModifier() {
        const actorData = this.data;
        const data = actorData.data;


        if (data.handicap.shield.mod) {
            data.handicap.shield.value = Math.max(data.handicap.shield.value + data.handicap.shield.mod, 0);
        }

        if (data.handicap.armor.mod) {
            data.handicap.armor.value = Math.max(data.handicap.armor.value + data.handicap.armor.mod, 0);
        }

        data.handicap.value = data.handicap.shield.value + data.handicap.armor.value;

        if (data.tickMalus.shield.mod) {
            data.tickMalus.shield.value = Math.max(data.tickMalus.shield.value + data.tickMalus.shield.mod, 0);
        }

        if (data.tickMalus.armor.mod) {
            data.tickMalus.armor.value = Math.max(data.tickMalus.armor.value + data.tickMalus.armor.mod, 0);
        }

        data.tickMalus.value = data.tickMalus.shield.value + data.tickMalus.armor.value;

        if (data.handicap.value) {
            let label = game.i18n.localize("splittermond.handicap");
            let skills = ["athletics", "acrobatics", "dexterity", "stealth", "locksntraps", "seafaring", "animals"];
            skills.forEach(skill => {
                this._addModifier(label, `${skill} -${data.handicap.value}`, "equipment");
            });
            let gswMod = Math.floor(data.handicap.value / 2);
            this._addModifier(label, `GSW -${gswMod}`);
        }



        CONFIG.splittermond.derivedAttributes.forEach(attr => {
            if (data.derivedAttributes[attr].bonus) {
                let bonusMisc = data.derivedAttributes[attr].bonus?.misc?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
                let bonusEquipment = Math.min(data.derivedAttributes[attr].bonus?.equipment?.reduce((acc, element) => acc + parseInt(element.value), 0), data.bonusCap) || 0;
                let bonusMagic = Math.min(data.derivedAttributes[attr].bonus?.magic?.reduce((acc, element) => acc + parseInt(element.value), 0), data.bonusCap) || 0;
                let malus = data.derivedAttributes[attr].malus?.all?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
                data.derivedAttributes[attr].value += bonusMisc + bonusEquipment + bonusMagic - malus;
            }
        });

        [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.fighting, ...CONFIG.splittermond.skillGroups.magic].forEach(skill => {
            if (data.skills[skill].bonus) {
                let bonusMisc = data.skills[skill].bonus?.misc?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
                let bonusEquipment = Math.min(data.skills[skill].bonus?.equipment?.reduce((acc, element) => acc + parseInt(element.value), 0), data.bonusCap) || 0;
                let bonusMagic = Math.min(data.skills[skill].bonus?.magic?.reduce((acc, element) => acc + parseInt(element.value), 0), data.bonusCap) || 0;
                let malus = data.skills[skill].malus?.all?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
                data.skills[skill].value += bonusMisc + bonusEquipment + bonusMagic - malus;
            }
        });
    }

    _prepareDerivedAttributes() {
        const actorData = this.data;
        const data = actorData.data;

        if (actorData.type === "character") {
            CONFIG.splittermond.attributes.forEach(attr => {
                data.attributes[attr].value = parseInt(data.attributes[attr].initial)
                    + parseInt(data.attributes[attr].species)
                    + parseInt(data.attributes[attr].advances);
            });

            data.derivedAttributes = {};

            data.derivedAttributes.size = {
                value: parseInt(data.species.size)
            };
            data.derivedAttributes.speed = {
                value: parseInt(data.attributes.agility.value) + parseInt(data.derivedAttributes.size.value)
            };
            data.derivedAttributes.initiative = {
                value: 10 - parseInt(data.attributes.intuition.value)
            };
            data.derivedAttributes.healthpoints = {
                value: parseInt(data.derivedAttributes.size.value) + parseInt(data.attributes.constitution.value)
            }
            data.derivedAttributes.focuspoints = {
                value: 2 * (parseInt(data.attributes.mystic.value) + parseInt(data.attributes.willpower.value))
            };
            data.derivedAttributes.defense = {
                value: 12 + parseInt(data.attributes.agility.value) + parseInt(data.attributes.strength.value) + 2 * (5 - parseInt(data.derivedAttributes.size.value)) + 2 * (data.experience.heroLevel - 1)
            };
            data.derivedAttributes.bodyresist = {
                value: 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.constitution.value) + 2 * (data.experience.heroLevel - 1)
            };
            data.derivedAttributes.mindresist = {
                value: 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.mind.value) + 2 * (data.experience.heroLevel - 1)
            };

        }

    }
    _prepareSkills() {
        const actorData = this.data;
        const data = actorData.data;

        CONFIG.splittermond.skillGroups.general.forEach(skill => {
            data.skills[skill].value = parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][0]].value) +
                parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][1]].value)
                + parseInt(data.skills[skill].points);
        });

        CONFIG.splittermond.skillGroups.magic.forEach(skill => {
            data.skills[skill].value = parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][0]].value) +
                parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][1]].value)
                + parseInt(data.skills[skill].points);
        });
    }

    async rollSkill(skill, options = {}) {
        let checkData = await CheckDialog.create({
            difficulty: options.difficulty | 15,
            modifier: options.modifier | 0
        });
        if (!checkData) return;

        let data = Dice.check(
            this.data.data.skills[skill].value,
            this.data.data.skills[skill].points,
            checkData.difficulty,
            checkData.rollType,
            checkData.modifier);

        data.title = game.i18n.localize(`splittermond.skillLabel.${skill}`);
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let templateContext = {
            ...data,
            tooltip: await data.roll.getTooltip()
        };

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };

        ChatMessage.create(chatData);
    }

    async importFromJSON(json) {
        const data = JSON.parse(json);

        // If Genesis-JSON-Export
        if (data.jsonExporterVersion && data.system === "SPLITTERMOND") {
            let newData = {};
            newData.items = [];
            newData.data = {};
            newData.name = data.name;
            newData.data.species = {
                value: data.race
            }
            newData.data.sex = data.gender;
            newData.data.culture = data.culture;
            newData.data.ancestry = data.background;
            newData.data.education = data.education;
            newData.data.experience = {
                free: data.freeExp,
                spent: data.investedExp
            }
            let moonSignDescription = data.moonSign.description.replace(/Grad [1234]:/g, (m) => "<strong>" + m + "</strong>");
            moonSignDescription = "<p>" + moonSignDescription.split("\n").join("</p><p>") + "</p>";

            let moonSignImage = "systems/splittermond/images/moonsign/" + data.moonSign.name.split(" ").join("_").toLowerCase() + ".png";
            let moonsignObj = {
                type: "moonsign",
                name: data.moonSign.name,
                img: moonSignImage,
                data: {
                    description: moonSignDescription
                }
            }
            let moonsignIds = this.items.filter(i => i.type === "moonsign")?.map(i => i._id);
            if (moonsignIds) {
                if (moonsignIds.length > 0) {
                    moonsignObj._id = moonsignIds[0];
                }
            }
            newData.items.push(moonsignObj);


            data.weaknesses.forEach((w) => {
                newData.items.push({
                    type: "weakness",
                    name: w
                })
            });
            data.languages.forEach((w) => {
                newData.items.push({
                    type: "language",
                    name: w
                })
            });
            data.cultureLores.forEach((w) => {
                newData.items.push({
                    type: "culturelore",
                    name: w
                })
            });
            newData.data.attributes = duplicate(this._data.data.attributes);
            data.attributes.forEach((a) => {
                const id = a.id.toLowerCase();
                if (CONFIG.splittermond.attributes.includes(id)) {
                    newData.data.attributes[id].species = 0;
                    newData.data.attributes[id].initial = a.startValue;
                    newData.data.attributes[id].advances = a.value - a.startValue;
                }

                if (id === "size") {
                    newData.data.species.size = a.value;
                }

            });
            newData.data.skills = duplicate(this._data.data.skills);
            data.skills.forEach((s) => {
                let id = s.id.toLowerCase();
                if (newData.data.skills[id]) {
                    newData.data.skills[id].points = s.points;

                    s.masterships.forEach((m) => {
                        let newMastership = {
                            type: "mastery",
                            name: m.name,
                            data: {
                                skill: id,
                                level: m.level,
                                description: m.longDescription,
                                modifier: CONFIG.splittermond.modifier[m.id] || ""
                            }
                        }

                        newData.items.push(newMastership);
                    })
                } else {
                    console.log("undefined Skill:" + id);
                }

            });

            data.powers.forEach((s) => {
                newData.items.push({
                    type: "strength",
                    name: s.name,
                    data: {
                        quantity: s.count,
                        description: s.longDescription,
                        modifier: CONFIG.splittermond.modifier[s.id] || ""
                    }
                })
            });

            data.resources.forEach((r) => {
                newData.items.push({
                    type: "resource",
                    name: r.name,
                    data: {
                        value: r.value,
                        description: r.description
                    }
                })
            });

            data.spells.forEach((s) => {
                let damage = /([0-9]*[wWdD][0-9]{1,2}[ \-+0-9]*)/.exec(s.longDescription);
                if (damage) {
                    damage = damage[0] || "";
                } else {
                    damage = "";
                }
                let skill = "";
                if (s.school === "Arkane Kunde") {
                    skill = "arcanelore";
                } else {
                    skill = CONFIG.splittermond.skillGroups.magic.find(skill => {
                        return s.school.toLowerCase() === game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase()
                    });
                }


                newData.items.push({
                    type: "spell",
                    name: s.name,
                    img: CONFIG.splittermond.icons.spell[s.id] || CONFIG.splittermond.icons.spell.default,
                    data: {
                        description: s.longDescription,
                        skill: skill,
                        skillLevel: s.schoolGrade,
                        costs: s.focus,
                        difficulty: s.difficulty,
                        damage: damage.trim(),
                        range: s.castRange,
                        castDuration: s.castDuration,
                        effectDuration: s.spellDuration,
                        enhancementCosts: s.enhancement,
                        enhancementDescription: s.enhancementDescription,
                        degreeOfSuccessOptions: {
                            castDuration: s.enhancementOptions.search("Auslösezeit") >= 0,
                            consumedFocus: s.enhancementOptions.search("Verzehrter Fokus") >= 0,
                            exhaustedFocus: s.enhancementOptions.search("Erschöpfter Fokus") >= 0,
                            channelizedFocus: s.enhancementOptions.search("Kanalisierter Fokus") >= 0,
                            effectDuration: s.enhancementOptions.search("Wirkungsdauer") >= 0
                        }
                    }
                })
            });

            data.armors.forEach((a) => {
                newData.items.push({
                    type: "armor",
                    name: a.name,
                    img: CONFIG.splittermond.icons.armor[a.name] || CONFIG.splittermond.icons.armor.default,
                    data: {
                        defenseBonus: a.defense,
                        tickMalus: a.tickMalus,
                        handicap: a.handicap,
                        damageReduction: a.damageReduction,
                        features: a.features.map(f => `${f.name}`)?.join(', ')
                    }
                })
            });

            data.shields.forEach((s) => {
                newData.items.push({
                    type: "shield",
                    name: s.name,
                    img: CONFIG.splittermond.icons.shield[s.name] || CONFIG.splittermond.icons.shield.default,
                    data: {
                        skill: CONFIG.splittermond.skillGroups.fighting.find(skill => {
                            return s.skill.toLowerCase() === game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase()
                        }),
                        defenseBonus: s.defensePlus,
                        tickMalus: s.tickMalus,
                        handicap: s.handicap,
                        features: s.features.map(f => `${f.name}`)?.join(', ')
                    }
                })
            });


            data.meleeWeapons.forEach((w) => {
                if (w.name !== "Waffenlos") {
                    newData.items.push({
                        type: "weapon",
                        name: w.name,
                        img: CONFIG.splittermond.icons.weapon[w.name] || CONFIG.splittermond.icons.weapon.default,
                        data: {
                            skill: CONFIG.splittermond.skillGroups.fighting.find(skill => {
                                return w.skill.toLowerCase() === game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase()
                            }),
                            attribute1: w.attribute1Id.toLowerCase(),
                            attribute2: w.attribute2Id.toLowerCase(),
                            features: w.features.map(f => `${f.name}`)?.join(', '),
                            damage: w.damage,
                            weaponSpeed: w.weaponSpeed,
                        }
                    })

                }
            });

            data.longRangeWeapons.forEach((w) => {
                const itemData = newData.items.find(i => i.name === w.name && i.type === "weapon");
                if (itemData) {
                    itemData.data.secondaryAttack = {
                        skill: CONFIG.splittermond.skillGroups.fighting.find(skill => {
                            return w.skill.toLowerCase() === game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase()
                        }),
                        attribute1: w.attribute1Id.toLowerCase(),
                        attribute2: w.attribute2Id.toLowerCase(),
                        features: w.features.map(f => `${f.name}`)?.join(', '),
                        damage: w.damage,
                        weaponSpeed: w.weaponSpeed,
                        range: w.range
                    }
                } else {
                    newData.items.push({
                        type: "weapon",
                        name: w.name,
                        img: CONFIG.splittermond.icons.weapon[w.name] || CONFIG.splittermond.icons.weapon.default,
                        data: {
                            skill: CONFIG.splittermond.skillGroups.fighting.find(skill => {
                                return w.skill.toLowerCase() === game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase()
                            }),
                            attribute1: w.attribute1Id.toLowerCase(),
                            attribute2: w.attribute2Id.toLowerCase(),
                            features: w.features.map(f => `${f.name}`)?.join(', '),
                            damage: w.damage,
                            weaponSpeed: w.weaponSpeed,
                            range: w.range
                        }
                    })
                }

            });

            data.items.forEach((e) => {
                newData.items.push({
                    type: "equipment",
                    name: e.name,
                    img: CONFIG.splittermond.icons.equipment[e.name] || CONFIG.splittermond.icons.equipment.default,
                    data: {
                        quantity: e.count
                    }
                });
            });

            json = JSON.stringify(newData);
        }


        return super.importFromJSON(json);
    }



    async rollAttack(weaponData, options = {}) {

        let target = Array.from(game.user.targets)[0];
        let vtdValue = "VTD";
        if (target) {
            vtdValue = target.actor.data.data.derivedAttributes.defense.value;
        }

        let checkData = await CheckDialog.create({
            difficulty: vtdValue,
            modifier: 0
        });

        if (!checkData) return;


        const actorData = this.data.data;
        let skillPoints = parseInt(actorData.skills[weaponData.data.skill].points);
        let skillValue = skillPoints;
        skillValue += parseInt(actorData.attributes[weaponData.data.attribute1].value);
        skillValue += parseInt(actorData.attributes[weaponData.data.attribute2].value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = weaponData.name;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let templateContext = {
            ...data,
            item: weaponData,
            tooltip: await data.roll.getTooltip()
        };

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/weapon-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };

        ChatMessage.create(chatData);
    }

    async rollSpell(spellData, options = {}) {
        let target = Array.from(game.user.targets)[0];

        let difficulty = (spellData.data.difficulty + "").trim().toUpperCase();
        if (target) {
            switch (difficulty) {
                case "VTD":
                    difficulty = target.actor.data.data.derivedAttributes.defense.value;
                    break;
                case "GW":
                    difficulty = target.actor.data.data.derivedAttributes.mindresist.value;
                    break;
                case "KW":
                    difficulty = target.actor.data.data.derivedAttributes.bodyresist.value;
                    break;
                default:
                    break;
            }
        }

        let checkData = await CheckDialog.create({
            difficulty: difficulty,
            modifier: 0
        });

        if (!checkData) return;

        const actorData = this.data.data;

        let skillPoints = parseInt(actorData.skills[spellData.data.skill].points);
        let skillValue = parseInt(actorData.skills[spellData.data.skill].value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = spellData.name;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let templateContext = {
            ...data,
            item: spellData,
            tooltip: await data.roll.getTooltip()
        };

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/weapon-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };

        ChatMessage.create(chatData);
    }

    async rollActiveDefense(defenseType, itemData) {

        let checkData = await CheckDialog.create({
            difficulty: 15,
            modifier: 0
        });

        if (!checkData) return;


        const actorData = this.data.data;
        let skillPoints = parseInt(actorData.skills[itemData.data.skill].points);
        let skillValue = itemData.data.skillValue;
        //skillValue += parseInt(actorData.attributes[itemData.data.attribute1].value);
        //skillValue += parseInt(actorData.attributes[itemData.data.attribute2].value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = itemData.name;
        data.rollType = game.i18n.localize(`splittermond.activeDefense`) + " | " + game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let defenseValue = actorData.derivedAttributes[defenseType].value;

        if (data.succeeded) {
            defenseValue = defenseValue + 1 + data.degreeOfSuccess;

            let feature = {};
            itemData.data.features?.toLowerCase().split(',').forEach(feat => {
                let temp = /([^0-9 ]*)[ ]*([0-9]*)/.exec(feat.trim());
                if (temp[1]) {
                    feature[temp[1]] = parseInt(temp[2] || 1);
                }
            });

            if (feature["defensiv"]) {
                defenseValue += feature["defensiv"];
            }
        }

        data.degreeOfSuccessMessage = game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + `: ${defenseValue}`;

        let templateContext = {
            ...data,
            item: itemData,
            tooltip: await data.roll.getTooltip()
        };

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/weapon-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };

        ChatMessage.create(chatData);
    }

    async addTicks(value = 3, message = "") {

        value = parseInt(value);
        if (!value) return;
        if (!game.combat) return;

        // Find combatant
        let combatant = game.combat.combatants.find((c) => c.actor === this);

        if (!combatant) return;

        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: "Ticks",
                content: `<p>${message}</p><input type='text' class='ticks' value='${value}'>`,
                buttons: {
                    ok: {
                        label: "Ok",
                        callback: html => {
                            resolve(parseInt(html.find('.ticks')[0].value));
                        }
                    }
                }
            });
            dialog.render(true);
        });

        let nTicks = await p;

        let newInitiative = combatant.initiative + parseInt(nTicks);
        combatant.flags.relativeTickPosition = game.combat.combatants.reduce((acc, c) => {
            return acc + (c.initiative == newInitiative) ? 1 : 0;
        }, 0);

        game.combat.updateCombatant({ _id: combatant._id, "flags.relativeTickPosition": combatant.flags.relativeTickPosition })

        return game.combat.setInitiative(combatant._id, newInitiative);
    }


    getRollData() {
        const actorData = this.data;
        const data = actorData.data;
        let rollData = {};

        rollData['initiative'] = data.derivedAttributes.initiative.value;
        rollData[game.i18n.localize(`splittermond.derivedAttribute.initiative.short`).toLowerCase()] = data.derivedAttributes.initiative.value;

        return rollData;
    }
    _parseCostsString(str) {
        let costDataRaw = /[0-9]*[ eg\/+]*([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(str.toLowerCase());
        return {
            channeled: costDataRaw[1] === "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
            exhausted: costDataRaw[1] !== "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
            consumed: parseInt(costDataRaw[3] || 0)
        }
    }

    consumeCost(type, valueStr, description) {
        const actorData = this.data;
        const data = actorData.data;
        let costData = this._parseCostsString(valueStr.toString());

        if (type === "focus") {

            if (costData.channeled) {
                if (!data.focus.channeled.hasOwnProperty("entries")) {
                    data.focus.channeled = {
                        value: 0,
                        entries: []
                    }
                }

                data.focus.channeled.entries.push({
                    description: description,
                    costs: costData.channeled,
                });

            }
            if (!data.focus.exhausted.value) {
                data.focus.exhausted = {
                    value: 0
                }
            }

            if (!data.focus.consumed.value) {
                data.focus.consumed = {
                    value: 0
                }
            }

            data.focus.exhausted.value += costData.exhausted;
            data.focus.consumed.value += costData.consumed;

            this.update({ "data.focus": data.focus });

        }


    }

}