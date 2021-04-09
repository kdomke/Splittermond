import * as Dice from "../util/dice.js"
import CheckDialog from "../apps/dialog/check-dialog.js"

export default class SplittermondActor extends Actor {
    prepareData() {
        super.prepareData();

        const actorData = this.data;
        const data = actorData.data;

        if (!data.derivedAttributes) {
            data.derivedAttributes = {};
            CONFIG.splittermond.derivedAttributes.forEach(attr => {
                data.derivedAttributes[attr] = {
                    value: 0
                }
            });


        }

        data.derivedAttributes.speed.multiplier = 1;

        if (!data.health) {
            data.health = {
                "consumed": {
                    "value": 0
                },
                "exhausted": {
                    "value": 0
                },
                "channeled": {
                    "entries": []
                }
            }
        }

        if (!data.focus) {
            data.focus = {
                "consumed": {
                    "value": 0
                },
                "exhausted": {
                    "value": 0
                },
                "channeled": {
                    "entries": []
                }
            }
        }
        if (!data.tickMalus) {
            data.tickMalus = {
                armor: {
                    value: 0
                },
                shield: {
                    value: 0
                },
                value: 0
            }
        }

        if (!data.handicap) {
            data.handicap = {
                armor: {
                    value: 0
                },
                shield: {
                    value: 0
                },
                value: 0
            }
        }

        data.health.woundMalus = {
            nbrLevels: 5,
            level: 0,
            value: 0,
            mod: 0,
            levelMod: 0
        }

        if (actorData.type === "character") {
            actorData.focusRegeneration = {
                multiplier: 2,
                bonus: 0
            };

            actorData.healthRegeneration = {
                multiplier: 2,
                bonus: 0
            };


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
        this._prepareArmor();
        this._prepareModifier();
        this._prepareDerivedAttributes();
        this._prepareHealthFocus();
        this._prepareSkills();

        this._prepareAttacks();
        this._prepareSpells();


        this._prepareActiveDefense();
        data.derivedAttributes.speed.value *= data.derivedAttributes.speed.multiplier;

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


        data.health.woundMalus.level = Math.max(Math.min(data.health.woundMalus.nbrLevels - Math.ceil(data.health.total.value / data.derivedAttributes.healthpoints.value) + data.health.woundMalus.levelMod, data.health.woundMalus.nbrLevels - 1), 0);
        data.health.woundMalus.value = data.health.woundMalus.levels[data.health.woundMalus.level];

        if (data.health.woundMalus.value) {
            if (!data.derivedAttributes.initiative.mod) {
                data.derivedAttributes.initiative.mod = {
                    sources: []
                };
            }
            data.derivedAttributes.initiative.mod.sources.push({ value: -data.health.woundMalus.value, description: game.i18n.localize("splittermond.woundMalus") });
            data.derivedAttributes.initiative.value -= data.health.woundMalus.value;

            if (!data.derivedAttributes.speed.mod) {
                data.derivedAttributes.speed.mod = {
                    sources: []
                };
            }
            data.derivedAttributes.speed.mod.sources.push({ value: data.health.woundMalus.value, description: game.i18n.localize("splittermond.woundMalus") });
            data.derivedAttributes.speed.value += data.health.woundMalus.value;

            [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.fighting, ...CONFIG.splittermond.skillGroups.magic].forEach(skill => {
                this._addModifier(game.i18n.localize("splittermond.woundMalus"), `${skill} ${data.health.woundMalus.value}`);
            });
        }

        data.healthBar = {
            value: data.health.total.value,
            max: data.health.woundMalus.nbrLevels * data.derivedAttributes.healthpoints.value
        }

        data.focusBar = {
            value: data.focus.available.value,
            max: data.derivedAttributes.focuspoints.value
        }
    }



    _prepareAttacks() {
        const actorData = this.data;
        const data = actorData.data;

        let attacks = [];
        if (actorData.type === "character") {
            attacks.push({
                _id: "weaponless",
                name: game.i18n.localize("splittermond.weaponless"),
                img: "icons/equipment/hand/gauntlet-simple-leather-brown.webp",
                item: null,
                skillId: "melee",
                attribute1: "agility",
                attribute2: "strength",
                weaponSpeed: 5,
                range: 0,
                features: "Entwaffnend 1, Stumpf, Umklammern",
                damage: "1W6"
            });
        }
        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                let itemData = duplicate(item.data);
                if (itemData.equipped) {

                    attacks.push({
                        _id: item._id,
                        name: item.name,
                        img: item.img,
                        item: item,
                        skillId: itemData.skill,
                        attribute1: itemData.attribute1,
                        attribute2: itemData.attribute2,
                        weaponSpeed: parseInt(itemData.weaponSpeed),
                        range: itemData.range,
                        features: itemData.features,
                        damage: itemData.damage
                    });
                    if (item.data.secondaryAttack) {
                        if (item.data.secondaryAttack.skill !== "" && item.data.secondaryAttack.skill !== "none") {
                            let itemData = duplicate(item.data.secondaryAttack);
                            attacks.push({
                                _id: item._id + "_secondary",
                                name: item.name + " (" + game.i18n.localize("splittermond.skillLabel." + itemData.skill) + ")",
                                img: item.img,
                                item: item,
                                skillId: itemData.skill,
                                attribute1: itemData.attribute1,
                                attribute2: itemData.attribute2,
                                weaponSpeed: parseInt(itemData.weaponSpeed),
                                range: itemData.range,
                                features: itemData.features,
                                damage: itemData.damage
                            });
                        }
                    }

                }
            }

            if (item.type === "shield") {
                let itemData = duplicate(item.data);
                if (itemData.equipped) {
                    attacks.push({
                        _id: item._id,
                        name: item.name,
                        img: item.img,
                        item: item,
                        skillId: itemData.skill,
                        attribute1: "agility",
                        attribute2: "strength",
                        weaponSpeed: 7,
                        range: 0,
                        features: "",
                        damage: "1W6+1"
                    });
                }

            }
        });





        attacks.forEach(attack => {
            if (attack.skillId) {
                attack.skill = duplicate(data.skills[attack.skillId]);
                attack.skill.value += parseInt(data.attributes[attack.attribute1].value || 0)
                attack.skill.value += parseInt(data.attributes[attack.attribute2].value || 0)
                attack.skill.baseValue += parseInt(data.attributes[attack.attribute1].value || 0)
                attack.skill.baseValue += parseInt(data.attributes[attack.attribute2].value || 0)
                if (["melee", "slashing", "chains", "blades", "staffs"].includes(attack.skillId))
                    attack.weaponSpeed += parseInt(data.tickMalus.shield.value) + parseInt(data.tickMalus.armor.value);
                attack.weaponSpeed += parseInt(data.tickMalus.value);
            }

        });

        data.attacks = attacks;
    }

    _prepareActiveDefense() {
        const actorData = this.data;
        const data = actorData.data;
        data.activeDefense = {}

        data.activeDefense.defense = [{
            _id: "acrobatics",
            name: game.i18n.localize("splittermond.skillLabel.acrobatics"),
            item: null,
            skillId: "acrobatics",
            skill: this.data.data.skills.acrobatics,
            features: ""
        }];

        data.activeDefense.mindresist = [{
            _id: "determination",
            name: game.i18n.localize("splittermond.skillLabel.determination"),
            item: null,
            skillId: "determination",
            skill: this.data.data.skills.determination,
            features: ""
        }];

        data.activeDefense.bodyresist = [{
            _id: "endurance",
            name: game.i18n.localize("splittermond.skillLabel.endurance"),
            item: null,
            skillId: "endurance",
            skill: this.data.data.skills.endurance,
            features: ""
        }];


        actorData.items.forEach(item => {
            if (item.type === "weapon") {
                if (["melee", "slashing", "chains", "blades", "staffs"].includes(item.data.skill)) {
                    if (item.data.equipped) {
                        let skill = duplicate(data.skills[item.data.skill]);
                        skill.value += parseInt(data.attributes[item.data.attribute1].value)
                        skill.value += parseInt(data.attributes[item.data.attribute2].value)
                        skill.baseValue += parseInt(data.attributes[item.data.attribute1].value)
                        skill.baseValue += parseInt(data.attributes[item.data.attribute2].value)
                        data.activeDefense.defense.push({
                            _id: item._id,
                            name: item.name,
                            img: item.img,
                            item: item,
                            skillId: item.data.skill,
                            skill: skill,
                            features: item.data.features
                        });

                        if (item.data.secondaryAttack) {
                            if (["melee", "slashing", "chains", "blades", "staffs"].includes(item.data.secondaryAttack.skill)) {
                                let skill = duplicate(data.skills[item.data.secondaryAttack.skill]);
                                skill.value += parseInt(data.attributes[item.data.secondaryAttack.attribute1].value)
                                skill.value += parseInt(data.attributes[item.data.secondaryAttack.attribute2].value)
                                skill.baseValue += parseInt(data.attributes[item.data.secondaryAttack.attribute1].value)
                                skill.baseValue += parseInt(data.attributes[item.data.secondaryAttack.attribute2].value)
                                data.activeDefense.defense.push({
                                    _id: item._id,
                                    name: item.name + " (" + game.i18n.localize("splittermond.skillLabel." + item.data.secondaryAttack.skill) + ")",
                                    img: item.img,
                                    item: item,
                                    skillId: item.data.secondaryAttack.skill,
                                    skill: skill,
                                    features: item.data.secondaryAttack.features
                                });
                            }
                        }
                    }
                }
            } else if (item.type === "shield") {
                if (item.data.equipped) {
                    let skill = duplicate(data.skills[item.data.skill]);
                    skill.value += parseInt(data.attributes["intuition"].value)
                    skill.value += parseInt(data.attributes["strength"].value)
                    skill.baseValue += parseInt(data.attributes["intuition"].value)
                    skill.baseValue += parseInt(data.attributes["strength"].value)
                    data.activeDefense.defense.push({
                        _id: item._id,
                        name: item.name,
                        img: item.img,
                        item: item,
                        skillId: item.data.skill,
                        skill: skill,
                        features: item.data.features
                    });
                }
            }
        });
    }

    _addModifier(name, str, type = "misc", multiplier = 1) {
        const actorData = this.data;
        const data = actorData.data;

        str.split(',').forEach(str => {
            str = str.trim();
            let temp = str.split(' ');
            temp[0] = temp[0].trim();
            let value = parseFloat(temp[1]);

            let addModifierHelper = (dataset) => {
                if (!dataset.mod) {
                    dataset.mod = {
                        value: 0,
                        sources: []
                    }
                }

                if (value * multiplier != 0) {
                    dataset.mod.sources.push({ value: value * multiplier, description: name, source: type });
                }
            }

            switch (temp[0]) {
                case "GSW.mult":
                    data.derivedAttributes.speed.multiplier *= Math.pow(value, multiplier);
                    break;
                case "SR":
                    addModifierHelper(data.damageReduction);
                case "handicap.shield.mod":
                    addModifierHelper(data.handicap.shield);
                    break;
                case "handicap.mod":
                    addModifierHelper(data.handicap);
                    break;
                case "handicap.armor.mod":
                    addModifierHelper(data.handicap.armor);
                    break;
                case "tickMalus.shield.mod":
                    addModifierHelper(data.tickMalus.shield);
                    break;
                case "tickMalus.armor.mod":
                    addModifierHelper(data.tickMalus.armor);
                    break;
                case "tickMalus.mod":
                    addModifierHelper(data.tickMalus);
                    break;
                case "woundMalus.nbrLevels":
                    data.health.woundMalus.nbrLevels = value * multiplier;
                    break;
                case "woundMalus.mod":
                    data.health.woundMalus.mod += value * multiplier;
                    break;
                case "woundMalus.levelMod":
                    data.health.woundMalus.levelMod += value * multiplier;
                    break;
                case "splinterpoints":
                    data.splinterpoints.max = parseInt(data.splinterpoints.max) + value * multiplier;
                    break;
                case "healthRegeneration.multiplier":
                    actorData.healthRegeneration.multiplier = value * multiplier;
                    break;
                case "focusRegeneration.multiplier":
                    actorData.focusRegeneration.multiplier = value * multiplier;
                    break;
                case "generalSkills":
                    CONFIG.splittermond.skillGroups.general.forEach((skill) => {
                        addModifierHelper(data.skills[skill]);
                    });
                    break;
                case "magicSkills":
                    CONFIG.splittermond.skillGroups.magic.forEach((skill) => {
                        addModifierHelper(data.skills[skill]);
                    });
                    break;
                case "fightingSkills":
                    CONFIG.splittermond.skillGroups.fighting.forEach((skill) => {
                        addModifierHelper(data.skills[skill]);
                    });
                    break;
                default:
                    let dataset;
                    let element = CONFIG.splittermond.derivedAttributes.find(attr => {
                        return temp[0] === game.i18n.localize(`splittermond.derivedAttribute.${attr}.short`)
                    });
                    if (element) {
                        dataset = data.derivedAttributes[element];
                    } else {
                        if ([...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.fighting, ...CONFIG.splittermond.skillGroups.magic].includes(temp[0])) {
                            dataset = data.skills[temp[0]];
                        };
                    }

                    if (dataset) {
                        addModifierHelper(dataset);
                    }
                    break;

            }
        });
    }

    _prepareModifier() {
        const actorData = this.data;
        const data = actorData.data;

        actorData.items.forEach(i => {
            if (i.data.modifier) {
                switch (i.type) {
                    case "equipment":
                    case "weapon":
                    case "shield":
                    case "armor":
                        this._addModifier(i.name, i.data.modifier, "equipment");
                        break;
                    case "strength":
                        this._addModifier(i.name, i.data.modifier, "misc", i.data.quantity)
                        break;
                    case "statuseffect":
                        this._addModifier(i.name, i.data.modifier, "misc", i.data.level);
                        break;
                    case "spelleffect":
                        this._addModifier(i.name, i.data.modifier, "magic");
                        break
                    default:
                        this._addModifier(i.name, i.data.modifier);
                        break;
                }
            }
        });

        let _sumAllHelper = (acc, current) => acc + current.value;
        data.handicap.shield.value = Math.max(data.handicap.shield.value + (data.handicap.shield.mod?.sources.reduce(_sumAllHelper, 0) || 0), 0);
        data.handicap.armor.value = Math.max(data.handicap.armor.value + (data.handicap.armor.mod?.sources.reduce(_sumAllHelper, 0) || 0), 0);
        data.handicap.value = Math.max(data.handicap.shield.value + data.handicap.armor.value + (data.handicap.mod?.sources.reduce(_sumAllHelper, 0) || 0), 0);


        data.tickMalus.shield.value += (data.tickMalus.shield.mod?.sources.reduce(_sumAllHelper, 0) || 0);
        data.tickMalus.shield.value = Math.max(data.tickMalus.shield.value, 0)
        data.tickMalus.armor.value += (data.tickMalus.armor.mod?.sources.reduce(_sumAllHelper, 0) || 0);
        data.tickMalus.armor.value = Math.max(data.tickMalus.armor.value, 0)
        data.tickMalus.value = (data.tickMalus.mod?.sources.reduce(_sumAllHelper, 0) || 0);

        if (data.handicap.value) {
            let label = game.i18n.localize("splittermond.handicap");
            let skills = ["athletics", "acrobatics", "dexterity", "stealth", "locksntraps", "seafaring", "animals"];
            skills.forEach(skill => {
                this._addModifier(label, `${skill} -${data.handicap.value}`, "equipment");
            });
            let gswMod = Math.floor(data.handicap.value / 2);
            this._addModifier(label, `GSW -${gswMod}`);
        }


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

        if (!data.damageReduction) {
            data.damageReduction = {
                value: 0
            }
        }


        data.damageReduction.value += actorData.items.reduce((acc, i) => ((i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.damageReduction || 0) : acc, 0);

        actorData.items.forEach(i => {
            if (i.type === "armor" || i.type === "shield") {
                if (i.data.equipped && i.data.defenseBonus != 0) {
                    this._addModifier(i.name, `VTD ${i.data.defenseBonus}`, "equipment");
                }
            }
        });

    }



    _prepareDerivedAttributes() {
        const actorData = this.data;
        const data = actorData.data;

        if (actorData.type === "character") {
            CONFIG.splittermond.attributes.forEach(attr => {
                data.attributes[attr].value = parseInt(data.attributes[attr].initial || 0)
                    + parseInt(data.attributes[attr].species || 0)
                    + parseInt(data.attributes[attr].advances || 0);
            });


            data.derivedAttributes.size.value = parseInt(data.species.size);
            data.derivedAttributes.speed.value = parseInt(data.attributes.agility.value) + parseInt(data.derivedAttributes.size.value);
            data.derivedAttributes.initiative.value = 10 - parseInt(data.attributes.intuition.value);
            data.derivedAttributes.healthpoints.value = parseInt(data.derivedAttributes.size.value) + parseInt(data.attributes.constitution.value);
            data.derivedAttributes.focuspoints.value = 2 * (parseInt(data.attributes.mystic.value) + parseInt(data.attributes.willpower.value));
            data.derivedAttributes.defense.value = 12 + parseInt(data.attributes.agility.value) + parseInt(data.attributes.strength.value) + 2 * (5 - parseInt(data.derivedAttributes.size.value)) + 2 * (data.experience.heroLevel - 1);
            data.derivedAttributes.bodyresist.value = 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.constitution.value) + 2 * (data.experience.heroLevel - 1);
            data.derivedAttributes.mindresist.value = 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.mind.value) + 2 * (data.experience.heroLevel - 1);

        }




        let _sumAllHelper = (acc, current) => acc + current.value;
        let _sumEquipmentBonus = (acc, current) => current.value > 0 && current.source === "equipment" ? acc + current.value : acc;
        let _sumMagicBonus = (acc, current) => current.value > 0 && current.source === "magic" ? acc + current.value : acc;
        let _sumEquipmentMalus = (acc, current) => current.value < 0 && current.source === "equipment" ? acc + current.value : acc;
        let _sumMagicMalus = (acc, current) => current.value < 0 && current.source === "magic" ? acc + current.value : acc;

        if (data.damageReduction.mod) {
            let allMod = (data.damageReduction.mod.sources.reduce(_sumAllHelper, 0) || 0);
            let equipmentMalus = (data.damageReduction.mod.sources.reduce(_sumEquipmentMalus, 0) || 0);
            let magicMalus = (data.damageReduction.mod.sources.reduce(_sumMagicMalus, 0) || 0);
            data.damageReduction.value += allMod;
            data.damageReduction.value += Math.max(0, -equipmentMalus - data.bonusCap);
            data.damageReduction.value += Math.max(0, -magicMalus - data.bonusCap);
        }


        CONFIG.splittermond.derivedAttributes.forEach(attr => {
            if (data.derivedAttributes[attr].mod) {
                if (attr === "initiative") {
                    let allMod = (data.derivedAttributes[attr].mod.sources.reduce(_sumAllHelper, 0) || 0);
                    let equipmentMalus = (data.derivedAttributes[attr].mod.sources.reduce(_sumEquipmentMalus, 0) || 0);
                    let magicMalus = (data.derivedAttributes[attr].mod.sources.reduce(_sumMagicMalus, 0) || 0);
                    data.derivedAttributes[attr].value += allMod;
                    data.derivedAttributes[attr].value += Math.max(0, -equipmentMalus - data.bonusCap);
                    data.derivedAttributes[attr].value += Math.max(0, -magicMalus - data.bonusCap);
                } else {
                    let allMod = (data.derivedAttributes[attr].mod.sources.reduce(_sumAllHelper, 0) || 0);
                    let equipmentBonus = (data.derivedAttributes[attr].mod.sources.reduce(_sumEquipmentBonus, 0) || 0);
                    let magicBonus = (data.derivedAttributes[attr].mod.sources.reduce(_sumMagicBonus, 0) || 0);
                    data.derivedAttributes[attr].value += allMod;
                    data.derivedAttributes[attr].value -= Math.max(0, equipmentBonus - data.bonusCap);
                    data.derivedAttributes[attr].value -= Math.max(0, magicBonus - data.bonusCap);
                }

            }
        });

    }
    _prepareSkills() {
        const actorData = this.data;
        const data = actorData.data;

        let _sumAllHelper = (acc, current) => acc + current.value;
        let _sumEquipmentBonus = (acc, current) => current.value > 0 && current.source === "equipment" ? acc + current.value : acc;
        let _sumMagicBonus = (acc, current) => current.value > 0 && current.source === "magic" ? acc + current.value : acc;

        let stealthModifier = 5 - data.derivedAttributes.size.value;
        if (stealthModifier) {
            this._addModifier(game.i18n.localize("splittermond.derivedAttribute.size.short"), `stealth ${stealthModifier}`);
        }

        [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.fighting, ...CONFIG.splittermond.skillGroups.magic].forEach(skill => {
            if (!data.skills[skill]) {
                data.skills[skill] = {
                    points: 0
                }
            }
            data.skills[skill].value = parseInt(data.skills[skill].points);

            if (CONFIG.splittermond.skillAttributes[skill]) {
                data.skills[skill].value += parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][0]].value || 0) +
                    parseInt(data.attributes[CONFIG.splittermond.skillAttributes[skill][1]].value || 0)
            }


            data.skills[skill].baseValue = data.skills[skill].value;
            if (data.skills[skill].mod) {
                data.skills[skill].value += (data.skills[skill].mod.sources.reduce(_sumAllHelper, 0) || 0);
                data.skills[skill].value -= Math.max(0, (data.skills[skill].mod.sources.reduce(_sumEquipmentBonus, 0) || 0) - data.bonusCap);
                data.skills[skill].value -= Math.max(0, (data.skills[skill].mod.sources.reduce(_sumMagicBonus, 0) || 0) - data.bonusCap);
            }

        });
    }

    async rollSkill(skill, options = {}) {
        let checkData = await CheckDialog.create({
            difficulty: options.difficulty || 15,
            modifier: options.modifier || 0
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
                            castDuration: s.enhancementOptions?.search("Auslösezeit") >= 0,
                            consumedFocus: s.enhancementOptions?.search("Verzehrter Fokus") >= 0,
                            exhaustedFocus: s.enhancementOptions?.search("Erschöpfter Fokus") >= 0,
                            channelizedFocus: s.enhancementOptions?.search("Kanalisierter Fokus") >= 0,
                            effectDuration: s.enhancementOptions?.search("Wirkungsdauer") >= 0
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



    async rollAttack(attackId, options = {}) {
        const actorData = this.data.data;

        let weaponData = actorData.attacks.find(a => a._id === attackId);

        if (!weaponData) return;

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



        let skillPoints = parseInt(weaponData.skill.points);
        let skillValue = weaponData.skill.value;

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = weaponData.name;
        data.img = weaponData.img;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        data.actions = [{
            name: game.i18n.localize(`splittermond.damage`) + " (" + weaponData.damage + ")",
            icon: "fa-heart-broken",
            classes: "rollable",
            data: {
                "roll-type": "damage",
                damage: weaponData.damage,
                features: weaponData.features
            }
        }, {
            name: `${weaponData.weaponSpeed} ` + game.i18n.localize(`splittermond.ticks`),
            icon: "fa-stopwatch",
            classes: "add-tick",
            data: {
                ticks: weaponData.weaponSpeed,
                message: weaponData.name
            }
        }];

        if (data.isFumble) {
            data.actions.push({
                name: "Patzertabelle",
                icon: "fa-dice",
                classes: "rollable",
                data: {
                    "roll-type": "attackFumble"
                }
            });
        }

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
        data.img = spellData.img;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        data.actions = [];
        if (spellData.data.damage && data.succeeded) {
            data.actions.push({
                name: game.i18n.localize(`splittermond.damage`) + " (" + spellData.data.damage + ")",
                icon: "fa-heart-broken",
                classes: "rollable",
                data: {
                    "roll-type": "damage",
                    damage: spellData.data.damage,
                    features: ""
                }
            });
        }

        data.actions.push({
            name: `3 ` + game.i18n.localize(`splittermond.ticks`),
            icon: "fa-stopwatch",
            classes: "add-tick",
            data: {
                ticks: 3,
                message: spellData.name
            }
        });

        if (data.isFumble) {
            data.actions.push({
                name: "Patzertabelle",
                icon: "fa-dice",
                classes: "rollable",
                data: {
                    "roll-type": "magicFumble",
                    success: -data.degreeOfSuccess,
                    costs: spellData.data.costs
                }
            });
        }

        let templateContext = {
            ...data,
            item: spellData,
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

    async rollActiveDefense(defenseType, itemData) {

        let checkData = await CheckDialog.create({
            difficulty: 15,
            modifier: 0
        });

        if (!checkData) return;


        const actorData = this.data.data;
        let skillPoints = parseInt(itemData.skill.points);
        let skillValue = parseInt(itemData.skill.value);
        //skillValue += parseInt(actorData.attributes[itemData.data.attribute1].value);
        //skillValue += parseInt(actorData.attributes[itemData.data.attribute2].value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = itemData.name;
        data.img = itemData.img;
        data.rollType = game.i18n.localize(`splittermond.activeDefense`) + " | " + game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let defenseValue = actorData.derivedAttributes[defenseType].value;

        if (data.succeeded) {
            defenseValue = defenseValue + 1 + data.degreeOfSuccess;

            let feature = {};
            itemData.features?.toLowerCase().split(',').forEach(feat => {
                let temp = /([^0-9 ]*)[ ]*([0-9]*)/.exec(feat.trim());
                if (temp[1]) {
                    feature[temp[1]] = parseInt(temp[2] || 1);
                }
            });

            if (feature["defensiv"]) {
                defenseValue += feature["defensiv"];
            }

            data.degreeOfSuccessMessage = game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + `: ${defenseValue}`;

            if (data.degreeOfSuccess >= 5) {
                data.degreeOfSuccessMessage += ` Die Aktion dauert nur 2 Tick.`
            }
        } else {

            if (data.degreeOfSuccess === 0) {
                defenseValue += 1;
            }
            data.degreeOfSuccessMessage = game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + `: ${defenseValue}`;
            if (data.degreeOfSuccess === 0) {
                data.degreeOfSuccessMessage += ` + [[1d6]] Punkte Betäubungsschaden`
            }
            if (data.degreeOfSuccess <= -5) {
                if (itemData._id === "acrobatics") {
                    data.degreeOfSuccessMessage += ` Der Abenteurer stürzt hart auf empfindliche Körperteile ([[2d6]] Schaden) und gilt als liegend`
                } else if (itemData._id === "determination") {
                    data.degreeOfSuccessMessage += `Die Willenskraft des Abenteurers ist erschöpft.
Er verliert alle Zuversicht, so dass er für den Rest des Tages einen
Malus in Höhe von 3 Punkten auf alle seine Proben erhält.`
                } else if (itemData._id === "endurance") {
                    data.degreeOfSuccessMessage += ` Der Abenteurer ist völlig erschöpft. Er erhält den Zustand @Item[Erschöpft]{Erschöpft 3}, der anhält bis er eine Ruhephase eingelegt hat.`
                } else {
                    data.degreeOfSuccessMessage += " Auf Patzertabelle würfeln."
                    data.actions = [{
                        name: "Patzertabelle",
                        icon: "fa-dice",
                        classes: "rollable",
                        data: {
                            "roll-type": "attackFumble"
                        }
                    }];
                }

            }

        }



        let templateContext = {
            ...data,
            item: itemData,
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
        if (costDataRaw) {
            return {
                channeled: costDataRaw[1] === "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
                exhausted: costDataRaw[1] !== "k" ? parseInt(costDataRaw[2]) - parseInt(costDataRaw[3] || 0) : 0,
                consumed: parseInt(costDataRaw[3] || 0)
            }
        } else {
            return {
                channeled: 0,
                exhausted: 0,
                consumed: 0
            }
        }

    }

    async shortRest() {
        const actorData = this.data;
        const data = actorData.data;
        data.focus.exhausted.value = 0;
        data.health.exhausted.value = 0;

        return this.update({ "data.focus": data.focus, "data.health": data.health });
    }

    async longRest() {
        const actorData = this.data;
        const data = actorData.data;
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: game.i18n.localize("splittermond.clearChanneledFocus"),
                content: "<p>" + game.i18n.localize("splittermond.clearChanneledFocus") + "</p>",
                buttons: {
                    yes: {
                        label: game.i18n.localize("splittermond.yes"),
                        callback: html => {
                            resolve(true);
                        }
                    },
                    no: {
                        label: game.i18n.localize("splittermond.no"),
                        callback: html => {
                            resolve(false);
                        }
                    }
                }
            });
            dialog.render(true);
        });

        if (await p) {
            data.focus.channeled.entries = [];
        }

        data.health.channeled.entries = [];

        data.focus.exhausted.value = 0;
        data.health.exhausted.value = 0;

        data.focus.consumed.value = Math.max(data.focus.consumed.value - actorData.focusRegeneration.multiplier * data.attributes.willpower.value, 0);
        data.health.consumed.value = Math.max(data.health.consumed.value - actorData.healthRegeneration.multiplier * data.attributes.constitution.value, 0);

        return this.update({ "data.focus": data.focus, "data.health": data.health });
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