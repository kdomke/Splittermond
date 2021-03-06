import * as Dice from "../util/dice.js"
import CheckDialog from "../apps/dialog/check-dialog.js"

export default class SplittermondActor extends Actor {
    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;
        data.experience.heroLevel = CONFIG.splittermond.heroLevel.reduce((acc, minXP) => acc + ((minXP <= data.experience.spent) ? 1 : 0), 0);
        data.experience.nextLevelValue = CONFIG.splittermond.heroLevel[Math.min(data.experience.heroLevel, 3)];
        data.experience.percentage = data.experience.spent - CONFIG.splittermond.heroLevel[Math.min(Math.max(data.experience.heroLevel - 1, 0), 3)];
        data.experience.percentage /= data.experience.nextLevelValue;
        data.experience.percentage = Math.min(data.experience.percentage * 100, 100);
        data.bonusCap = data.experience.heroLevel + 2;

        this._prepareDerivedAttributes();
        this._prepareSkills();

        this._prepareArmor();

        this._prepareModifiers();

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
                    value: Math.max(Math.min(5 * data.derivedAttributes[type + "points"].value - data[type].channeled.value - data[type].exhausted.value - data[type].consumed.value, 5 * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].total = {
                    value: Math.max(Math.min(5 * data.derivedAttributes[type + "points"].value - data[type].consumed.value, 5 * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].available.percentage = 100 * data[type].available.value / (5 * data.derivedAttributes[type + "points"].value);
                data[type].exhausted.percentage = 100 * data[type].exhausted.value / (5 * data.derivedAttributes[type + "points"].value);
                data[type].channeled.percentage = 100 * data[type].channeled.value / (5 * data.derivedAttributes[type + "points"].value);
                data[type].total.percentage = 100 * data[type].total.value / (5 * data.derivedAttributes[type + "points"].value);
            } else {
                data[type].available = {
                    value: Math.max(Math.min(data.derivedAttributes[type + "points"].value - data[type].channeled.value - data[type].exhausted.value - data[type].consumed.value, data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].total = {
                    value: Math.max(Math.min(data.derivedAttributes[type + "points"].value - data[type].consumed.value, data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].available.percentage = 100 * data[type].available.value / (data.derivedAttributes[type + "points"].value);
                data[type].exhausted.percentage = 100 * data[type].exhausted.value / (data.derivedAttributes[type + "points"].value);
                data[type].channeled.percentage = 100 * data[type].channeled.value / (data.derivedAttributes[type + "points"].value);
                data[type].total.percentage = 100 * data[type].total.value / (data.derivedAttributes[type + "points"].value);
            }



        });

        data.health.woundMalus = {
            level: 0,
            value: 0,
            levels: [0, -1, -2, -4, -8]
        }

        data.health.woundMalus.level = 5 - Math.ceil(data.health.total.percentage / 20);
        data.health.woundMalus.value = data.health.woundMalus.levels[data.health.woundMalus.level];

        if (data.health.woundMalus.value != 0) {
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
        });

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



        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                item.data.skillValue = parseInt(this.data.data.skills[item.data.skill].points);
                item.data.skillValue += parseInt(this.data.data.attributes[item.data.attribute1].value);
                item.data.skillValue += parseInt(this.data.data.attributes[item.data.attribute2].value);
            }

            if (item.type === "shield") {
                item.data.skillValue = parseInt(this.data.data.skills[item.data.skill].points);
                item.data.skillValue += parseInt(this.data.data.attributes.intuition.value);
                item.data.skillValue += parseInt(this.data.data.attributes.strength.value);
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
                if (["slashing", "chains", "blades", "staffs"].includes(item.data.skill)) {
                    data.activeDefense.defense.push(item);
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
            }
        });
    }


    _prepareArmor() {
        const actorData = this.data;
        const data = actorData.data;

        data.handicap = {
            value: actorData.items.reduce((acc, i) => ((i.type === "shield" || i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.handicap) : acc, 0)
        };
        data.tickMalus = {
            value: actorData.items.reduce((acc, i) => ((i.type === "shield" || i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.tickMalus) : acc, 0)
        };

        actorData.items.forEach(i => {
            if (i.type === "armor" || i.type === "shield") {
                if (i.data.equipped && i.data.defenseBonus != 0) {
                    this._addModifier(i.name, `VTD ${i.data.defenseBonus}`, "equipment");
                }
            }
        });

    }

    _prepareModifiers() {
        const actorData = this.data;
        const data = actorData.data;

        actorData.items.forEach(i => {
            if (i.type === "strength")
                this._addModifier(i.name, i.data.modifier);
        });


        if (data.handicap.bonus) {
            let bonusMisc = data.handicap.bonus?.misc?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
            let bonusEquipment = data.handicap.bonus?.equipment?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
            let bonusMagic = data.handicap.bonus?.magic?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
            let malus = data.handicap.malus?.all?.reduce((acc, element) => acc + parseInt(element.value), 0) || 0;
            data.handicap.value = Math.max(bonusMisc + bonusEquipment + bonusMagic - malus, 0);
        }

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
        data.derivedAttributes.mindresist = {
            value: 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.strength.value) + 2 * (data.experience.heroLevel - 1)
        };
        data.derivedAttributes.bodyresist = {
            value: 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.constitution.value) + 2 * (data.experience.heroLevel - 1)
        };
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
        let targettoken = Array.from(game.user.targets)[0];

        let checkData = await CheckDialog.create({
            difficulty: spellData.data.difficulty,
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


    getRollData() {
        const actorData = this.data;
        const data = actorData.data;
        let rollData = {};

        rollData['initiative'] = data.derivedAttributes.initiative.value;
        rollData[game.i18n.localize(`splittermond.derivedAttribute.initiative.short`).toLowerCase()] = data.derivedAttributes.initiative.value;

        return rollData;
    }
    _parseCostsString(str) {
        let costDataRaw = /([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(str.toLowerCase());
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