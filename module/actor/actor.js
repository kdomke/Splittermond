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


            data.experience.heroLevel = game.splittermond.heroLevel.reduce((acc, minXP) => acc + ((minXP <= data.experience.spent) ? 1 : 0), 0);
            data.experience.nextLevelValue = game.splittermond.heroLevel[Math.min(data.experience.heroLevel, 3)];
            data.experience.percentage = data.experience.spent - game.splittermond.heroLevel[Math.min(Math.max(data.experience.heroLevel - 1, 0), 3)];
            data.experience.percentage /= data.experience.nextLevelValue;
            data.experience.percentage = Math.min(data.experience.percentage * 100, 100);
            data.bonusCap = data.experience.heroLevel + 2;

            if (!data.splinterpoints) {
                data.splinterpoints = {
                    max: 3
                };
            } else {
                data.splinterpoints.max = 3;
            }
        }

        if (actorData.type === "npc") {
            data.bonusCap = 6;
        }
        this._prepareAttributes();
        this._prepareArmor();
        this._prepareModifier();
        this._prepareDerivedAttributes();
        this._prepareHealthFocus();
        this._prepareSkills();

        this._prepareAttacks();

        this._prepareActiveDefense();
        data.derivedAttributes.speed.value *= data.derivedAttributes.speed.multiplier;

    }

    _prepareHealthFocus() {
        const actorData = this.data;
        const data = actorData.data;

        data.health.woundMalus.levels = duplicate(CONFIG.splittermond.woundMalus[data.health.woundMalus.nbrLevels]);
        data.health.woundMalus.levels = data.health.woundMalus.levels.map(i => {
            i.value = Math.min(i.value - data.health.woundMalus.mod, 0);
            return i;
        });

        ["health", "focus"].forEach((type) => {
            if (data[type].channeled.hasOwnProperty("entries")) {
                if (type === "health") {
                    data[type].channeled.value = Math.max(
                        Math.min(
                            data[type].channeled.entries.reduce((acc, val) => acc + parseInt(val.costs || 0), 0),
                            data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value
                        ),
                        0);
                } else {
                    data[type].channeled.value = Math.max(
                        Math.min(
                            data[type].channeled.entries.reduce((acc, val) => acc + parseInt(val.costs || 0), 0),
                            data.derivedAttributes[type + "points"].value
                        ),
                        0);
                }

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
                    value: Math.max(Math.min(data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value - data[type].channeled.value - data[type].exhausted.value - data[type].consumed.value, data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].total = {
                    value: Math.max(Math.min(data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value - data[type].consumed.value, data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value), 0)
                }

                data[type].available.percentage = 100 * data[type].available.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].exhausted.percentage = 100 * data[type].exhausted.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].channeled.percentage = 100 * data[type].channeled.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].total.percentage = 100 * data[type].total.value / (data.health.woundMalus.nbrLevels * data.derivedAttributes[type + "points"].value);
                data[type].max = data.health.woundMalus.nbrLevels * data.derivedAttributes.healthpoints.value;
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
                    data[type].max = data.derivedAttributes.focuspoints.value;
                } else {
                    data[type].available.percentage = 0;
                    data[type].exhausted.percentage = 0;
                    data[type].channeled.percentage = 0;
                    data[type].total.percentage = 0;
                    data[type].max = 0;
                }

            }



        });


        data.health.woundMalus.level = Math.max(Math.min(data.health.woundMalus.nbrLevels - (Math.floor(data.health.total.value / data.derivedAttributes.healthpoints.value) + 1) + data.health.woundMalus.levelMod, data.health.woundMalus.nbrLevels - 1), 0);
        data.health.woundMalus.value = data.health.woundMalus.levels[data.health.woundMalus.level].value;

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
                skillMod: 0,
                attribute1: "agility",
                attribute2: "strength",
                weaponSpeed: 5,
                range: 0,
                features: "Entwaffnend 1, Stumpf, Umklammern",
                damage: "1W6",
                isDamaged: false,
                minAttributeMalus: 0
            });
        }
        actorData.items.forEach(item => {
            item = item.data
            if (item.type === "weapon") {
                if (item.data.equipped && parseInt(item.data.damageLevel) <= 1) {

                    let itemData = duplicate(item.data);
                    let minAttributeMalus = 0;
                    (item.data.minAttributes || "").split(",").forEach(aStr => {
                        let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
                        if (temp) {
                            let attr = CONFIG.splittermond.attributes.find(a => {
                                return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                            });
                            if (attr) {
                                let diff = parseInt(actorData.data.attributes[attr].value) - parseInt(temp[2] || 0);
                                if (diff < 0) {
                                    minAttributeMalus = diff;
                                    itemData.weaponSpeed -= diff;
                                    if (itemData.secondaryAttack.skill !== "" && item.data.secondaryAttack.skill !== "none") {
                                        itemData.secondaryAttack.weaponSpeed -= diff;
                                    }
                                }
                            }
                        }
                    });

                    let damageLevel = parseInt(itemData.damageLevel);

                    attacks.push({
                        _id: item._id,
                        name: item.name,
                        img: item.img,
                        item: item,
                        skillId: itemData.skill,
                        skillMod: itemData.skillMod,
                        attribute1: itemData.attribute1,
                        attribute2: itemData.attribute2,
                        weaponSpeed: parseInt(itemData.weaponSpeed),
                        range: itemData.range,
                        features: itemData.features,
                        damage: itemData.damage,
                        isDamaged: parseInt(damageLevel) === 1,
                        minAttributeMalus: minAttributeMalus
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
                                skillMod: itemData.skillMod,
                                attribute1: itemData.attribute1,
                                attribute2: itemData.attribute2,
                                weaponSpeed: parseInt(itemData.weaponSpeed),
                                range: itemData.range,
                                features: itemData.features,
                                damage: itemData.damage,
                                isDamaged: parseInt(damageLevel) === 1,
                                minAttributeMalus: minAttributeMalus
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
                        skillMod: 0,
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
            if (attack.skillId && data.skills[attack.skillId]) {
                attack.skill = duplicate(data.skills[attack.skillId]);
                if (!attack.skill.mod) {
                    attack.skill.mod = {
                        value: 0,
                        sources: [],
                    }
                }
                if (parseInt(attack.skillMod || 0) != 0) {
                    attack.skill.value += parseInt(attack.skillMod || 0);
                    attack.skill.mod.sources.push({
                        value: parseInt(attack.skillMod || 0),
                        description: game.i18n.localize("splittermond.skillMod"),
                        source: "misc"
                    });
                }
                if (parseInt(attack.minAttributeMalus || 0) != 0) {
                    attack.skill.value += parseInt(attack.minAttributeMalus || 0);
                    attack.skill.mod.sources.push({
                        value: parseInt(attack.minAttributeMalus || 0),
                        description: game.i18n.localize("splittermond.minAttributes"),
                        source: "misc"
                    });
                }

                if (attack.isDamaged) {
                    attack.skill.value -= 3;
                    attack.skill.mod.sources.push({
                        value: -3,
                        description: game.i18n.localize("splittermond.damageLevel"),
                        source: "misc"
                    });
                }
                attack.skill.value += parseInt(data.attributes[attack.attribute1].value || 0);
                attack.skill.value += parseInt(data.attributes[attack.attribute2].value || 0);
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
            features: "",
            attribute1: CONFIG.splittermond.skillAttributes["acrobatics"][0],
            attribute2: CONFIG.splittermond.skillAttributes["acrobatics"][1]
        }];

        data.activeDefense.mindresist = [{
            _id: "determination",
            name: game.i18n.localize("splittermond.skillLabel.determination"),
            item: null,
            skillId: "determination",
            skill: this.data.data.skills.determination,
            features: "",
            attribute1: CONFIG.splittermond.skillAttributes["determination"][0],
            attribute2: CONFIG.splittermond.skillAttributes["determination"][1]
        }];

        data.activeDefense.bodyresist = [{
            _id: "endurance",
            name: game.i18n.localize("splittermond.skillLabel.endurance"),
            item: null,
            skillId: "endurance",
            skill: this.data.data.skills.endurance,
            features: "",
            attribute1: CONFIG.splittermond.skillAttributes["endurance"][0],
            attribute2: CONFIG.splittermond.skillAttributes["endurance"][1]
        }];


        actorData.items.forEach(item => {
            item = item.data
            if (item.type === "weapon" && parseInt(item.data.damageLevel) <= 1 && item.data.equipped) {
                let minAttributeMalus = 0;
                (item.data.minAttributes || "").split(",").forEach(aStr => {
                    let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
                    if (temp) {
                        let attr = CONFIG.splittermond.attributes.find(a => {
                            return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                        });
                        if (attr) {
                            let diff = parseInt(actorData.data.attributes[attr].value) - parseInt(temp[2] || 0);
                            if (diff < 0) {
                                minAttributeMalus = diff;
                            }
                        }
                    }
                });
                if (["melee", "slashing", "chains", "blades", "staffs"].includes(item.data.skill)) {
                    let skill = duplicate(data.skills[item.data.skill]);
                    if (!skill.mod) {
                        skill.mod = {
                            value: 0,
                            sources: [],
                        }
                    }
                    if (parseInt(item.data.skillMod || 0) != 0) {
                        skill.value += parseInt(item.data.skillMod || 0);
                        skill.mod.sources.push({
                            value: parseInt(item.data.skillMod || 0),
                            description: game.i18n.localize("splittermond.skillMod"),
                            source: "misc"
                        });
                    }

                    if (parseInt(minAttributeMalus || 0) != 0) {
                        skill.value += parseInt(minAttributeMalus || 0);
                        skill.mod.sources.push({
                            value: parseInt(minAttributeMalus || 0),
                            description: game.i18n.localize("splittermond.minAttributes"),
                            source: "misc"
                        });
                    }

                    if (parseInt(item.data.damageLevel) == 1) {
                        skill.value -= 3;
                        skill.mod.sources.push({
                            value: -3,
                            description: game.i18n.localize("splittermond.damageLevel"),
                            source: "misc"
                        });
                    }
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
                        features: item.data.features,
                        attribute1: item.data.attribute1,
                        attribute2: item.data.attribute2
                    });

                    if (item.data.secondaryAttack) {
                        if (["melee", "slashing", "chains", "blades", "staffs"].includes(item.data.secondaryAttack.skill)) {
                            let skill = duplicate(data.skills[item.data.secondaryAttack.skill]);
                            if (!skill.mod) {
                                skill.mod = {
                                    value: 0,
                                    sources: [],
                                }
                            }
                            if (parseInt(item.data.skillMod || 0) != 0) {
                                skill.value += parseInt(item.data.skillMod || 0);
                                skill.mod.sources.push({
                                    value: parseInt(item.data.skillMod || 0),
                                    description: game.i18n.localize("splittermond.skillMod"),
                                    source: "misc"
                                });
                            }

                            if (parseInt(minAttributeMalus || 0) != 0) {
                                skill.value += parseInt(minAttributeMalus || 0);
                                skill.mod.sources.push({
                                    value: parseInt(minAttributeMalus || 0),
                                    description: game.i18n.localize("splittermond.minAttributes"),
                                    source: "misc"
                                });
                            }

                            if (parseInt(item.data.damageLevel) == 1) {
                                skill.value -= 3;
                                skill.mod.sources.push({
                                    value: -3,
                                    description: game.i18n.localize("splittermond.damageLevel"),
                                    source: "misc"
                                });
                            }
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
                                features: item.data.secondaryAttack.features,
                                attribute1: item.data.secondaryAttack.attribute1,
                                attribute2: item.data.secondaryAttack.attribute2
                            });
                        }
                    }
                }
            } else if (item.type === "shield" && parseInt(item.data.damageLevel) <= 1) {
                if (item.data.equipped && item.data.skill) {
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
                        features: item.data.features,
                        attribute1: "intuition",
                        attribute2: "strength",
                    });
                }
            }
        });
    }

    _addModifier(name, str, type = "misc", multiplier = 1) {
        const actorData = this.data;
        const data = actorData.data;
        actorData.spellCostReduction = {};
        actorData.spellEnhancedCostReduction = {};
        str.split(',').forEach(str => {
            str = str.trim();
            let temp = str.match(/(.*)\s+([+\-]?AUS|[+\-]?BEW|[+\-]?INT|[+\-]?KON|[+\-]?MYS|[+\-]?STÄ|[+\-]?VER|[+\-]?WIL|[+\-0-9]+)/);
            if (temp && ["foreduction", "foenhancedreduction"].every(e => !temp[1].trim().toLowerCase().startsWith(e))) {
                let modifierLabel = temp[1].trim();
                let value = temp[2].replace("AUS", data.attributes.charisma.value + "")
                    .replace("BEW", data.attributes.agility.value + "")
                    .replace("INT", data.attributes.intuition.value + "")
                    .replace("KON", data.attributes.constitution.value + "")
                    .replace("MYS", data.attributes.mystic.value + "")
                    .replace("STÄ", data.attributes.strength.value + "")
                    .replace("VER", data.attributes.mind.value + "")
                    .replace("WIL", data.attributes.willpower.value + "");
                let emphasis = "";
                let modifierLabelParts = modifierLabel.split("/");
                if (modifierLabelParts[1]) {
                    modifierLabel = modifierLabelParts[0];
                    if (modifierLabelParts[1]) {
                        emphasis = modifierLabelParts[1];
                    }
                };

                let addModifierHelper = (dataset, emphasis = "") => {
                    if (!dataset.mod) {
                        dataset.mod = {
                            value: 0,
                            sources: [],
                        }
                    }
                    if (!dataset.emphasis) {
                        dataset.emphasis = {}
                    }
                    if (value * multiplier != 0) {
                        if (emphasis) {
                            if (!dataset.emphasis[emphasis]) {
                                dataset.emphasis[emphasis] = 0
                            }
                            dataset.emphasis[emphasis] += value * multiplier;
                        } else {
                            dataset.mod.sources.push({ value: value * multiplier, description: name, source: type });
                        }
                    }
                }

                switch (modifierLabel.toLowerCase()) {
                    case "bonuscap":
                        data.bonusCap = parseInt(data.bonusCap) + value;
                        break;
                    case "gsw.mult":
                        data.derivedAttributes.speed.multiplier *= Math.pow(value, multiplier);
                        break;
                    case "sr".toLowerCase():
                        addModifierHelper(data.damageReduction);
                        break;
                    case "handicap.shield.mod":
                        addModifierHelper(data.handicap.shield);
                        break;
                    case "handicap.mod":
                        addModifierHelper(data.handicap);
                        break;
                    case "handicap.armor.mod":
                        addModifierHelper(data.handicap.armor);
                        break;
                    case "tickmalus.shield.mod":
                        addModifierHelper(data.tickMalus.shield);
                        break;
                    case "tickmalus.armor.mod":
                        addModifierHelper(data.tickMalus.armor);
                        break;
                    case "tickmalus.mod":
                        addModifierHelper(data.tickMalus);
                        break;
                    case "woundmalus.nbrlevels":
                        data.health.woundMalus.nbrLevels = value * multiplier;
                        break;
                    case "woundmalus.mod":
                        data.health.woundMalus.mod += value * multiplier;
                        break;
                    case "woundmalus.levelmod":
                        data.health.woundMalus.levelMod += value * multiplier;
                        break;
                    case "splinterpoints":
                        data.splinterpoints.max = parseInt(data.splinterpoints?.max || 3) + value * multiplier;
                        break;
                    case "healthregeneration.multiplier":
                        actorData.healthRegeneration.multiplier = value * multiplier;
                        break;
                    case "focusregeneration.multiplier":
                        actorData.focusRegeneration.multiplier = value * multiplier;
                        break;
                    case "lowerfumbleresult":
                        if (!actorData.lowerFumbleResult) {
                            actorData.lowerFumbleResult = 0;
                        }
                        actorData.lowerFumbleResult += value;
                        break;
                    case "generalskills":
                        CONFIG.splittermond.skillGroups.general.forEach((skill) => {
                            addModifierHelper(data.skills[skill], emphasis);
                        });
                        break;
                    case "magicskills":
                        CONFIG.splittermond.skillGroups.magic.forEach((skill) => {
                            addModifierHelper(data.skills[skill], emphasis);
                        });
                        break;
                    case "fightingskills":
                        CONFIG.splittermond.skillGroups.fighting.forEach((skill) => {
                            addModifierHelper(data.skills[skill], emphasis);
                        });
                        break;
                    default:
                        let dataset;
                        let element = CONFIG.splittermond.derivedAttributes.find(attr => {
                            return modifierLabel.toLowerCase() === game.i18n.localize(`splittermond.derivedAttribute.${attr}.short`).toLowerCase() || modifierLabel.toLowerCase() === game.i18n.localize(`splittermond.derivedAttribute.${attr}.long`).toLowerCase()
                        });
                        if (element) {
                            dataset = data.derivedAttributes[element];
                        } else {
                            dataset = data.skills[modifierLabel];
                        }

                        if (dataset) {
                            addModifierHelper(dataset, emphasis);
                        } else {
                            ui?.notifications?.warn(`Field not found in modifier-string "${str}" in ${name}!`);
                        }
                        break;

                }
            } else {
                let temp = str.match(/(.*)\s([0-9]*[k]?[0-9]+v?[0-9]*)/i);
                if (temp) {
                    let modifierLabel = temp[1].trim();
                    let value = temp[2].trim();
                    if (modifierLabel.toLowerCase().startsWith("foreduction")) {
                        var labelParts = modifierLabel.split(".");
                        var spellGroup = "*";

                        if (labelParts.length >= 2) {
                            spellGroup = labelParts[1];
                            if (labelParts.length == 3) {
                                spellGroup += "." + labelParts[2];
                            }    
                        }

                        var group = actorData.spellCostReduction[spellGroup.toLowerCase()] = actorData.spellCostReduction[spellGroup.toLowerCase()] || {
                            consumed: 0,
                            exhausted: 0,
                            channeled: 0,
                        };
                        var parsedFocusReduction = this._parseCostsString(value);
                        group.consumed += parsedFocusReduction.consumed || 0;
                        group.exhausted += parsedFocusReduction.exhausted || 0;
                        group.channeled += parsedFocusReduction.channeled || 0;

                        return;
                    }
                    else if (modifierLabel.toLowerCase().startsWith("foenhancedreduction")) {
                        var labelParts = modifierLabel.split(".");
                        var spellGroup = "*";

                        if (labelParts.length >= 2) {
                            spellGroup = labelParts[1];
                            if (labelParts.length == 3) {
                                spellGroup += "." + labelParts[2];
                            }    
                        }

                        var group = actorData.spellEnhancedCostReduction[spellGroup.toLowerCase()] = actorData.spellEnhancedCostReduction[spellGroup.toLowerCase()] || {
                            consumed: 0,
                            exhausted: 0,
                            channeled: 0,
                        };
                        var parsedFocusReduction = this._parseCostsString(value);
                        group.consumed += parsedFocusReduction.consumed || 0;
                        group.exhausted += parsedFocusReduction.exhausted || 0;
                        group.channeled += parsedFocusReduction.channeled || 0;

                        return;
                    }
                }

                ui?.notifications?.error(`Syntax Error in modifier-string "${str}" in ${name}!`);
            }
        });
    }

    _prepareModifier() {
        const actorData = this.data;
        const data = actorData.data;
        if (actorData.type === "character") {
            if (data.experience.heroLevel > 1) {
                ["VTD", "KW", "GW"].forEach(d => {
                    this._addModifier(game.i18n.localize(`splittermond.heroLevels.${data.experience.heroLevel}`), d + " +" + (2 * (data.experience.heroLevel - 1)));
                });
                this._addModifier(game.i18n.localize(`splittermond.heroLevels.${data.experience.heroLevel}`), "splinterpoints +" + (data.experience.heroLevel - 1));
            }
        }

        actorData.items.forEach(i => {
            i = i.data;
            if (i.data.modifier) {
                switch (i.type) {
                    case "weapon":
                    case "shield":
                    case "armor":
                        if (!i.data.equipped) {
                            break;
                        }
                    case "equipment":
                        this._addModifier(i.name, i.data.modifier, "equipment");
                        break;
                    case "strength":
                        this._addModifier(i.name, i.data.modifier, "misc", i.data.quantity)
                        break;
                    case "statuseffect":
                        this._addModifier(i.name, i.data.modifier, "misc", i.data.level);
                        break;
                    case "spelleffect":
                        if (i.data.active) {
                            this._addModifier(i.name, i.data.modifier, "magic");
                        }
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

        let minAttributeMalusHandicapArmor = 0;
        let minAttributeMalusTickMalusArmor = 0;

        let minAttributeMalusHandicapShield = 0;
        let minAttributeMalusTickMalusShield = 0;

        actorData.items.forEach(i => {
            i = i.data;
            if (i.type === "armor" && i.data.equipped) {
                let diff = parseInt(actorData.data.attributes.strength.value) - parseInt(i.data.minStr || 0);
                if (diff < 0) {
                    minAttributeMalusHandicapArmor -= diff;
                    minAttributeMalusTickMalusArmor -= diff;
                }
            }

            if (i.type === "shield" && i.data.equipped) {
                (i.data.minAttributes || "").split(",").forEach(aStr => {
                    let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
                    if (temp) {
                        let attr = CONFIG.splittermond.attributes.find(a => {
                            return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                        });
                        if (attr) {
                            let diff = parseInt(actorData.data.attributes[attr].value) - parseInt(temp[2] || 0);
                            if (diff < 0) {
                                minAttributeMalusHandicapShield -= diff;
                                minAttributeMalusTickMalusShield -= diff;
                            }
                        }
                    }
                });
            }
        })

        data.handicap = {
            shield: {
                value: actorData.items.reduce((acc, i) => {
                    i = i.data;
                    return ((i.type === "shield") && i.data.equipped) ? acc + parseInt(i.data.handicap) : acc
                }, 0) + minAttributeMalusHandicapShield
            },
            armor: {
                value: actorData.items.reduce((acc, i) => {
                    i = i.data;
                    return ((i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.handicap) : acc
                }, 0) + minAttributeMalusHandicapArmor
            }
        }

        data.tickMalus = {
            shield: {
                value: actorData.items.reduce((acc, i) => {
                    i = i.data;
                    return ((i.type === "shield") && i.data.equipped) ? acc + parseInt(i.data.tickMalus) : acc
                }, 0) + minAttributeMalusTickMalusShield
            },
            armor: {
                value: actorData.items.reduce((acc, i) => {
                    i = i.data;
                    return ((i.type === "armor") && i.data.equipped) ? acc + parseInt(i.data.tickMalus) : acc
                }, 0) + minAttributeMalusTickMalusArmor
            }
        };

        if (!data.damageReduction) {
            data.damageReduction = {
                value: 0
            }
        }


        actorData.items.forEach(i => {
            i = i.data;
            if (i.type === "armor" || i.type === "shield") {
                if (i.data.equipped && i.data.defenseBonus != 0) {
                    this._addModifier(i.name, `VTD ${i.data.defenseBonus}`, "equipment");
                }
            }

            if (i.type === "armor") {
                if (i.data.equipped && parseInt(i.data.damageReduction) != 0) {
                    data.damageReduction.value = parseInt(data.damageReduction.value) + parseInt(i.data.damageReduction);
                }
            }
        });

    }

    _prepareAttributes() {
        const actorData = this.data;
        const data = actorData.data;
        if (actorData.type === "character") {
            CONFIG.splittermond.attributes.forEach(attr => {
                data.attributes[attr].value = parseInt(data.attributes[attr].initial || 0)
                    + parseInt(data.attributes[attr].species || 0)
                    + parseInt(data.attributes[attr].advances || 0);
                data.attributes[attr].start = parseInt(data.attributes[attr].initial || 0)
                    + parseInt(data.attributes[attr].species || 0);
                data.attributes[attr].max = data.attributes[attr].start + data.experience.heroLevel;
            });
        } else {
            CONFIG.splittermond.attributes.forEach(attr => {
                data.attributes[attr].value = parseInt(data.attributes[attr].value || 0);
            });
        }
    }

    _prepareDerivedAttributes() {
        const actorData = this.data;
        const data = actorData.data;

        if (actorData.type === "character") {
            data.derivedAttributes.size.value = parseInt(data.species.size);
            data.derivedAttributes.speed.value = parseInt(data.attributes.agility.value) + parseInt(data.derivedAttributes.size.value);
            data.derivedAttributes.initiative.value = 10 - parseInt(data.attributes.intuition.value);
            data.derivedAttributes.healthpoints.value = parseInt(data.derivedAttributes.size.value) + parseInt(data.attributes.constitution.value);
            data.derivedAttributes.focuspoints.value = 2 * (parseInt(data.attributes.mystic.value) + parseInt(data.attributes.willpower.value));
            data.derivedAttributes.defense.value = 12 + parseInt(data.attributes.agility.value) + parseInt(data.attributes.strength.value) + 2 * (5 - parseInt(data.derivedAttributes.size.value));
            data.derivedAttributes.bodyresist.value = 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.constitution.value);
            data.derivedAttributes.mindresist.value = 12 + parseInt(data.attributes.willpower.value) + parseInt(data.attributes.mind.value);
        } else {
            data.derivedAttributes.size.value = parseInt(data.derivedAttributes.size.value) || 0;
            data.derivedAttributes.speed.value = parseInt(data.derivedAttributes.speed.value) || 0;
            data.derivedAttributes.initiative.value = parseInt(data.derivedAttributes.initiative.value) || 0;
            data.derivedAttributes.healthpoints.value = parseInt(data.derivedAttributes.healthpoints.value) || 0;
            data.derivedAttributes.focuspoints.value = parseInt(data.derivedAttributes.focuspoints.value) || 0;
            data.derivedAttributes.defense.value = parseInt(data.derivedAttributes.defense.value) || 0;
            data.derivedAttributes.bodyresist.value = parseInt(data.derivedAttributes.bodyresist.value) || 0;
            data.derivedAttributes.mindresist.value = parseInt(data.derivedAttributes.mindresist.value) || 0;
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

    async importFromJSON(json) {
        const data = JSON.parse(json);

        // If Genesis-JSON-Export
        if (data.jsonExporterVersion && data.system === "SPLITTERMOND") {
            let newData = {};
            let newItems = [];
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
            let moonsignIds = this.items.filter(i => i.type === "moonsign")?.map(i => {
                return i.data._id;
            });
            if (moonsignIds) {
                if (moonsignIds.length > 0) {
                    moonsignObj._id = moonsignIds[0];
                }
            }
            newItems.push(moonsignObj);


            data.weaknesses.forEach((w) => {
                newItems.push({
                    type: "weakness",
                    name: w
                })
            });
            data.languages.forEach((w) => {
                newItems.push({
                    type: "language",
                    name: w
                })
            });
            data.cultureLores.forEach((w) => {
                newItems.push({
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
                        let modifierStr = CONFIG.splittermond.modifier[m.id] || "";
                        let description = m.longDescription;
                        if (modifierStr === "" && m.specialization) {
                            let emphasisName = /(.*) [1-9]/.exec(m.name);
                            if (emphasisName) {
                                modifierStr = `${id}/${emphasisName[1]} +${m.level}`;
                            }
                            description = game.i18n.localize(`splittermond.emphasis`);
                        }
                        let newMastership = {
                            type: "mastery",
                            name: m.name,
                            data: {
                                skill: id,
                                level: m.level,
                                description: description,
                                modifier: modifierStr
                            }
                        }

                        newItems.push(newMastership);
                    })
                } else {
                    console.log("undefined Skill:" + id);
                }

            });

            data.powers.forEach((s) => {
                newItems.push({
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
                newItems.push({
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


                newItems.push({
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
                            effectDuration: s.enhancementOptions?.search("Wirkungsdauer") >= 0,
                            damage: s.enhancementOptions?.search("Schaden") >= 0,
                            range: s.enhancementOptions?.search("Reichweite") >= 0,
                            effectArea: s.enhancementOptions?.search("Wirkungsbereich") >= 0
                        }
                    }
                })
            });

            data.armors.forEach((a) => {
                newItems.push({
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
                newItems.push({
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
                    newItems.push({
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
                const itemData = newItems.find(i => i.name === w.name && i.type === "weapon");
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
                    newItems.push({
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
                newItems.push({
                    type: "equipment",
                    name: e.name,
                    img: CONFIG.splittermond.icons.equipment[e.name] || CONFIG.splittermond.icons.equipment.default,
                    data: {
                        quantity: e.count
                    }
                });
            });

            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: "Import",
                    content: "<p>" + game.i18n.localize("splittermond.updateOrOverwriteActor") + "</p>",
                    buttons: {
                        overwrite: {
                            label: game.i18n.localize("splittermond.overwrite"),
                            callback: html => {
                                resolve(false);
                            }
                        },
                        update: {
                            label: game.i18n.localize("splittermond.update"),
                            callback: html => {
                                resolve(true);
                            }
                        }
                    }
                });
                dialog.render(true);
            });

            let updateActor = await p;

            if (updateActor) {
                let updateItems = [];

                newItems = newItems.filter((i) => {
                    let foundItem = this.data.items.find((im) => im.type === i.type && im.name === i.name);
                    if (foundItem) {
                        i._id = foundItem._id;
                        delete i.img;
                        updateItems.push(duplicate(i));
                        return false;
                    }
                    return true;
                });

                this.update(newData);
                await this.updateOwnedItem(updateItems);
                await this.createOwnedItem(newItems);

                return this.update(newData);

            }

            newData.items = duplicate(newItems);
            json = JSON.stringify(newData);

        }


        return super.importFromJSON(json);
    }

    _getSkillTooltip(skillId, modifier = []) {
        const skillData = this.data.data.skills[skillId];
        let content = '<span class="formula">';
        if (CONFIG.splittermond.skillAttributes[skillId]) {
            let a = CONFIG.splittermond.skillAttributes[skillId][0];
            content += `<span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
            a = CONFIG.splittermond.skillAttributes[skillId][1];
            content += `<span class="operator">+</span>
                        <span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
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

        modifier.forEach(e => {
            let val = e.value;
            let cls = "malus";
            if (val > 0) {
                val = "+" + val;
                cls = "bonus";
            }

            content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
        });

        content += '</span>';

        return content;
    }

    _getAttackTooltip(attackId, modifier = []) {
        let content = "";
        if (this.data.data.attacks.find(a => a._id === attackId)) {
            let attack = this.data.data.attacks.find(a => a._id === attackId);
            content += '<span class="formula">';
            let a = attack.attribute1;
            content += `<span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
                        <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
            a = attack.attribute2;
            content += `<span class="operator">+</span>
                        <span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
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
            modifier.forEach(e => {
                let val = e.value;
                let cls = "malus";
                if (val > 0) {
                    val = "+" + val;
                    cls = "bonus";
                }

                content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
            });
            content += '</span>';
        }
        return content;
    }

    _getActiveDefenseTooltip(defenseData, modifier = []) {

        let content = '<span class="formula">';
        let a = defenseData.attribute1;
        content += `<span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
                <span class="description">` + game.i18n.localize(`splittermond.attribute.${a}.short`) + `</span></span>`
        a = defenseData.attribute2;
        content += `<span class="operator">+</span>
            <span class="formula-part"><span class="value">${this.data.data.attributes[a].value}</span>
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

        modifier.forEach(e => {
            let val = e.value;
            let cls = "malus";
            if (val > 0) {
                val = "+" + val;
                cls = "bonus";
            }

            content += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                        <span class="description">${e.description}</span></span>`
        });
        content += '</span>';
        return content;
    }

    async rollSkill(skill, options = {}) {
        let emphasisData = [];
        if (this.data.data.skills[skill].emphasis) {
            emphasisData = Object.entries(this.data.data.skills[skill].emphasis).map(([key, value]) => {
                return {
                    name: key,
                    label: key + (value > 0 ? " +" : " ") + value,
                    value: value,
                    active: false
                }
            });
        }

        let checkData = await CheckDialog.create({
            difficulty: options.difficulty || 15,
            modifier: options.modifier || 0,
            emphasis: emphasisData,
            title: game.i18n.localize(`splittermond.skillCheck`) + " - " + game.i18n.localize(`splittermond.skillLabel.${skill}`)
        });
        if (!checkData) return;

        checkData.difficulty = parseInt(checkData.difficulty);

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

        let skillTooltip = this._getSkillTooltip(skill, checkData.modifierElements);

        templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${skillTooltip}</p>
        </section>
        `).wrapAll('<div>').parent().html();

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rollMode: checkData.rollMode
        };

        ChatMessage.create(chatData);
    }

    async rollAttack(attackId, options = {}) {
        const actorData = this.data.data;

        let weaponData = actorData.attacks.find(a => a._id === attackId);

        if (!weaponData) return;

        let emphasisData = [];

        if (weaponData.skill.emphasis) {
            emphasisData = Object.entries(weaponData.skill.emphasis).map(([key, value]) => {
                return {
                    name: key,
                    label: key + (value > 0 ? " +" : " ") + value,
                    value: value,
                    active: key.toLowerCase().trim() === weaponData.name.toLowerCase().trim()
                }
            });
        }

        let checkData = await CheckDialog.create({
            difficulty: "VTD",
            modifier: 0,
            emphasis: emphasisData,
            title: game.i18n.localize(`splittermond.attack`) + " - " + weaponData.name
        });

        if (!checkData) return;

        let target = Array.from(game.user.targets)[0];
        let hideDifficulty = false;
        if (target) {
            switch (checkData.difficulty) {
                case "VTD":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.defense.value;
                    hideDifficulty = true;
                    break;
                case "KW":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.bodyresist.value;
                    hideDifficulty = true;
                    break;
                case "GW":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.mindresist.value;
                    hideDifficulty = true;
                    break;
            }
        }


        checkData.difficulty = parseInt(checkData.difficulty);
        let skillPoints = parseInt(weaponData.skill.points);
        let skillValue = weaponData.skill.value;

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = weaponData.name;
        data.img = weaponData.img;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let ticks = ["longrange", "throwing"].includes(weaponData.skillId) ? 3 : weaponData.weaponSpeed;

        data.actions = [];

        if (data.succeeded) {
            data.actions.push({
                name: `${game.i18n.localize("splittermond.activeDefense")} (${game.i18n.localize("splittermond.derivedAttribute.defense.short")})`,
                icon: "fa-shield-alt",
                classes: "active-defense",
                data: {
                    type: "defense"
                }
            });

            data.actions.push({
                name: game.i18n.localize(`splittermond.damage`) + " (" + weaponData.damage + ")",
                icon: "fa-heart-broken",
                classes: "rollable",
                data: {
                    "roll-type": "damage",
                    damage: weaponData.damage,
                    features: weaponData.features,
                    source: weaponData.name
                }
            });
        }

        if (data.isFumble || data.degreeOfSuccess <= -5) {
            data.actions.push({
                name: "Patzertabelle",
                icon: "fa-dice",
                classes: "rollable",
                data: {
                    "roll-type": "attackFumble"
                }
            });
        }

        data.actions.push({
            name: `${ticks} ` + game.i18n.localize(`splittermond.ticks`),
            icon: "fa-stopwatch",
            classes: "add-tick",
            data: {
                ticks: ticks,
                message: weaponData.name
            }
        });



        let templateContext = {
            ...data,
            hideDifficulty: hideDifficulty,
            tooltip: await data.roll.getTooltip()
        };

        let skillTooltip = this._getAttackTooltip(attackId, checkData.modifierElements);

        templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${skillTooltip}</p>
        </section>
        `).wrapAll('<div>').parent().html();



        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rollMode: checkData.rollMode
        };

        ChatMessage.create(chatData);
    }

    _calcSpellCostReduction(spellData, reductions, costData) {
        var reductions = [reductions["*"], reductions[spellData.skill.toLowerCase()]];
        spellData.spellType.split(",").forEach(e => reductions.push(reductions[(spellData.skill + "." + e).toLowerCase()]))
        reductions = reductions.filter(e => e != null);

        if (reductions.length == 0) {
            return costData;
        }
        let strParts = costData.split("/");
        var pretext = "";
        if (strParts.length > 1) {
            pretext = strParts[0];
        } 

        var costs = this._parseCostsString(costData);
        reductions.forEach(reduction => {
            if (reduction.channeled > 0 && costs.channeled > 0) {
                costs.channeled = Math.max(1, costs.channeled - reduction.channeled);
            }

            if (reduction.consumed > 0 && costs.consumed > 0) {
                costs.consumed = Math.max(1, costs.consumed - reduction.consumed);
            }

            if (reduction.exhausted > 0 && costs.exhausted > 0) {
                costs.exhausted = Math.max(1, costs.exhausted - reduction.exhausted);
            }
        });
        if(pretext != null){
            return pretext + "/+" + this._formatSpellCost(costs);
        }
        return this._formatSpellCost(costs);
    }

    _formatSpellCost(spellCostData) {
        var display = "";
        if (spellCostData.channeled > 0 || spellCostData.consumed > 0) {
            display = spellCostData.channeled + spellCostData.consumed + spellCostData.exhausted;
        }
        if (spellCostData.channeled > 0) {
            display += "K" + spellCostData.channeled;
        }
        if (spellCostData.consumed > 0) {
            display += "V" + spellCostData.consumed;
        }
        return display;
    }

    async rollSpell(spellData, options = {}) {
        spellData = spellData.data;
        let difficulty = (spellData.data.difficulty + "").trim().toUpperCase();

        const actorData = this.data.data;
        let emphasisData = [];
        if (actorData.skills[spellData.data.skill].emphasis) {
            emphasisData = Object.entries(actorData.skills[spellData.data.skill].emphasis).map(([key, value]) => {
                return {
                    name: key,
                    label: key + (value > 0 ? " +" : " ") + value,
                    value: value,
                    active: (spellData.data.spellType + "").toLowerCase().includes(key.toLocaleLowerCase().trim())
                }
            });
        }

        let checkData = await CheckDialog.create({
            difficulty: difficulty,
            modifier: 0,
            emphasis: emphasisData,
            title: game.i18n.localize(`splittermond.skillLabel.${spellData.data.skill}`) + " - " + spellData.name
        });

        if (!checkData) return;

        let target = Array.from(game.user.targets)[0];
        let hideDifficulty = false;
        if (target) {
            switch (checkData.difficulty) {
                case "VTD":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.defense.value;
                    hideDifficulty = true;
                    break;
                case "KW":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.bodyresist.value;
                    hideDifficulty = true;
                    break;
                case "GW":
                    checkData.difficulty = target.actor.data.data.derivedAttributes.mindresist.value;
                    hideDifficulty = true;
                    break;
            }
        }

        checkData.difficulty = parseInt(checkData.difficulty);
        let skillPoints = parseInt(actorData.skills[spellData.data.skill].points);
        let skillValue = parseInt(actorData.skills[spellData.data.skill].value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = spellData.name;
        data.img = spellData.img;
        data.rollType = game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let focusCosts = this._calcSpellCostReduction(spellData.data, this.data.spellCostReduction, spellData.data.costs);

        if (data.succeeded) {
            if (data.degreeOfSuccess > 0) {
                data.degreeOfSuccessDescription = "<h3>" + game.i18n.localize(`splittermond.degreeOfSuccessOptionsHeader`) + "</h3>";
                if (data.degreeOfSuccess >= 5) {
                    data.degreeOfSuccessDescription = "<p>" + game.i18n.localize(`splittermond.spellCheckResultDescription.outstanding`) + "</p>";
                }
                data.degreeOfSuccessDescription += "<ul>";
                if (spellData.data.degreeOfSuccessOptions.castDuration) {
                    data.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.castDuration`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.exhaustedFocus) {
                    data.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.exhaustedFocus`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.channelizedFocus) {
                    data.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.channelizedFocus`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.range) {
                    data.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.range`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.damage) {
                    data.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.damage`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.consumedFocus) {
                    data.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.consumedFocus`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.effectArea) {
                    data.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectArea`) + "</li>";
                }
                if (spellData.data.degreeOfSuccessOptions.effectDuration) {
                    data.degreeOfSuccessDescription += "<li>2 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectDuration`) + "</li>";
                }
                data.degreeOfSuccessDescription += `<li>${spellData.data.enhancementCosts}: ${spellData.data.enhancementDescription}</li>`;
                data.degreeOfSuccessDescription += "</ul>";

            }

        } else {
            if (data.degreeOfSuccess <= -5) {
                data.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.devastating`, { eg: -data.degreeOfSuccess }) + "</strong></p>";
            } else if (data.degreeOfSuccess <= -1) {
                data.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.failed`, { eg: -data.degreeOfSuccess }) + "</strong></p>";
            }
            focusCosts = -data.degreeOfSuccess;
        }

        data.actions = [];
        if (spellData.data.damage && data.succeeded) {
            if (["VTD", "KW", "GW"].includes(difficulty)) {
                data.actions.push({
                    name: `${game.i18n.localize("splittermond.activeDefense")} (${difficulty})`,
                    icon: "fa-shield-alt",
                    classes: "active-defense",
                    data: {
                        type: difficulty
                    }
                });
            }


            data.actions.push({
                name: game.i18n.localize(`splittermond.damage`) + " (" + spellData.data.damage + ")",
                icon: "fa-heart-broken",
                classes: "rollable",
                data: {
                    "roll-type": "damage",
                    damage: spellData.data.damage,
                    features: "",
                    source: spellData.name
                }
            });
        }
        if (focusCosts != 0) {
            data.actions.push({
                name: `${focusCosts} ` + game.i18n.localize(`splittermond.focusCostsAbbrev`),
                icon: "fa-bullseye",
                classes: "consume",
                data: {
                    value: focusCosts,
                    type: "focus",
                    description: spellData.name
                }
            });
        }

        let enhancementEG = spellData.data.enhancementCosts.match("([0-9]+)[ ]*EG");
        if (enhancementEG) {
            enhancementEG = parseInt(enhancementEG[1]);
        } else {
            enhancementEG = 1;
        }

        if (data.degreeOfSuccess >= enhancementEG) {
            var enhancementCosts = this._calcSpellCostReduction(spellData.data, this.data.spellEnhancedCostReduction, spellData.data.enhancementCosts);
            data.actions.push({
                name: `${enhancementCosts} ` + game.i18n.localize(`splittermond.enhancementCosts`),
                icon: "fa-bullseye",
                classes: "consume",
                data: {
                    value: enhancementCosts,
                    type: "focus",
                    description: spellData.name + " - " + game.i18n.localize('splittermond.enhancementCosts')
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

        if (data.isFumble || spellData.degreeOfSuccess <= -5) {
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
            hideDifficulty: hideDifficulty,
            item: spellData,
            tooltip: await data.roll.getTooltip()
        };

        let skillTooltip = this._getSkillTooltip(spellData.data.skill, checkData.modifierElements);

        templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${skillTooltip}</p>
        </section>
        `).wrapAll('<div>').parent().html();

        templateContext.tooltip = $(templateContext.tooltip).append(`
        <section class="tooltip-part">
        <p>${spellData.data.description}</p>
        </section>
        `).wrapAll('<div>').parent().html();

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rollMode: checkData.rollMode
        };

        ChatMessage.create(chatData);
    }

    async rollActiveDefense(defenseType, itemData) {
        const actorData = this.data.data;
        let emphasisData = [];
        if (itemData.skill.emphasis) {
            emphasisData = Object.entries(itemData.skill.emphasis).map(([key, value]) => {
                return {
                    name: key,
                    label: key + (value > 0 ? " +" : " ") + value,
                    value: value,
                    active: itemData.name.toLowerCase().trim() === key.toLowerCase().trim()
                }
            });
        }

        let checkData = await CheckDialog.create({
            difficulty: 15,
            modifier: 0,
            emphasis: emphasisData,
            title: game.i18n.localize(`splittermond.activeDefense`) + " (" + game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + ") - " + itemData.name
        });

        if (!checkData) return;

        checkData.difficulty = parseInt(checkData.difficulty);

        let skillPoints = parseInt(itemData.skill.points);
        let skillValue = parseInt(itemData.skill.value);

        let data = Dice.check(skillValue, skillPoints, checkData.difficulty, checkData.rollType, checkData.modifier);

        data.title = itemData.name;
        data.img = itemData.img;
        data.rollType = game.i18n.localize(`splittermond.activeDefense`) + " | " + game.i18n.localize(`splittermond.rollType.${checkData.rollType}`);

        let defenseValue = actorData.derivedAttributes[defenseType].value;

        let tickCost = 3;
        data.actions = [];
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

            data.degreeOfSuccessDescription = "<p style='text-align: center'><strong>" + game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + `: ${defenseValue}</strong></p>`;


            if (data.degreeOfSuccess >= 5) {
                data.degreeOfSuccessDescription += `<p>Die Aktion dauert nur 2 Tick.</p>`
                tickCost = 2;
            }
        } else {

            if (data.degreeOfSuccess === 0) {
                defenseValue += 1;

            }
            data.degreeOfSuccessDescription = "<p style='text-align: center'><strong>" + game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + `: ${defenseValue}</strong></p>`;
            if (data.degreeOfSuccess === 0) {
                data.degreeOfSuccessDescription += `<p>+ [[1d6]] Punkte Betäubungsschaden</p>`;
            }
            if (data.degreeOfSuccess <= -5) {
                if (itemData._id === "acrobatics") {
                    data.degreeOfSuccessDescription += `<p>Der Abenteurer stürzt hart auf empfindliche Körperteile ([[2d6]] Schaden) und gilt als liegend</p>`;
                } else if (itemData._id === "determination") {
                    data.degreeOfSuccessDescription += `<p>Die Willenskraft des Abenteurers ist erschöpft.
Er verliert alle Zuversicht, so dass er für den Rest des Tages einen
Malus in Höhe von 3 Punkten auf alle seine Proben erhält.</p>`;
                } else if (itemData._id === "endurance") {
                    data.degreeOfSuccessDescription += `<p>Der Abenteurer ist völlig erschöpft. Er erhält den Zustand @Item[Erschöpft]{Erschöpft 3}, der anhält bis er eine Ruhephase eingelegt hat.</p>`;
                } else {
                    data.degreeOfSuccessDescription += "<p>Auf Patzertabelle würfeln!</p>";
                    data.actions.push({
                        name: "Patzertabelle",
                        icon: "fa-dice",
                        classes: "rollable",
                        data: {
                            "roll-type": "attackFumble"
                        }
                    });
                }

            }

        }

        data.actions.push({
            name: `${tickCost} ` + game.i18n.localize(`splittermond.ticks`),
            icon: "fa-stopwatch",
            classes: "add-tick",
            data: {
                ticks: tickCost,
                message: game.i18n.localize(`splittermond.activeDefense`) + " (" + game.i18n.localize(`splittermond.derivedAttribute.${defenseType}.short`) + "): " + data.title
            }
        });

        let templateContext = {
            ...data,
            item: itemData,
            tooltip: await data.roll.getTooltip()
        };

        let skillTooltip = this._getActiveDefenseTooltip(itemData, checkData.modifierElements);

        templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${skillTooltip}</p>
        </section>
        `).wrapAll('<div>').parent().html();

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: data.roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            rollMode: checkData.rollMode
        };

        ChatMessage.create(chatData);
    }

    async rollAttackFumble() {
        let roll = new Roll("2d10").roll();

        let result = CONFIG.splittermond.fumbleTable.fight.find(el => el.min <= roll.total && el.max >= roll.total);

        let data = {};
        data.roll = roll;
        data.title = "Kampfpatzer";
        data.img = "";
        //data.rollType = "2d10";

        data.degreeOfSuccessDescription = `<div class="fumble-table-result">`;
        CONFIG.splittermond.fumbleTable.fight.forEach(el => {
            if (el === result) {
                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item fumble-table-result-item-active"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
            } else {
                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
            }

        });
        data.degreeOfSuccessDescription += `</div>`;

        let templateContext = {
            ...data,
            tooltip: await data.roll.getTooltip()
        };

        let chatData = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            roll: roll,
            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
            sound: CONFIG.sounds.dice,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL
        };

        ChatMessage.create(chatData);
    }

    async rollMagicFumble(eg = 0, costs = 0) {
        const actorData = this.data;
        const data = actorData.data;
        let defaultTable = "sorcerer";
        let lowerFumbleResult = actorData.lowerFumbleResult || 0;
        if (actorData.items.find(i => {
            i = i.data;
            return i.type == "strength" && i.name.toLowerCase() == "priester";
        })) {
            defaultTable = "priest";
        }

        let d = new Dialog({
            title: "Zauberpatzer",
            content: `<form>
            <div class="properties-editor">
            <label>${game.i18n.localize("splittermond.negativeDegreeOfSuccess")}</label><input name='eg' type='text' value='${eg}' data-dtype='Number'>
            <label>${game.i18n.localize("splittermond.focusCosts")}</label><input name='costs' type='text' value='${costs}' data-dtype='Number'>
            <label title="${game.i18n.localize("splittermond.lowerFumbleResultHelp")}">${game.i18n.localize("splittermond.lowerFumbleResult")}</label><input title="${game.i18n.localize("splittermond.lowerFumbleResultHelp")}"name='lowerFumbleResult' type='text' value='${lowerFumbleResult}' data-dtype='Number'>
            </div>
            </form>`,
            buttons: {

                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("splittermond.cancel")
                },
                priest: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("splittermond.priest"),
                    callback: async (html) => {
                        const rollTable = CONFIG.splittermond.fumbleTable.magic.priest;
                        let eg = parseInt(html.find('[name=eg]')[0].value || 0);
                        let costs = html.find('[name=costs]')[0].value;
                        let lowerFumbleResult = Math.abs(parseInt(html.find('[name=lowerFumbleResult]')[0].value) || 0);
                        if (parseInt(costs)) {
                            costs = parseInt(costs);
                        } else {
                            let costDataRaw = /([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(costs.toLowerCase());
                            costs = parseInt(costDataRaw[2]);
                        }

                        let roll = (new Roll(`2d10+@eg[${game.i18n.localize("splittermond.degreeOfSuccessAbbrev")}]*@costs[${game.i18n.localize("splittermond.focusCosts")}]`, { eg: eg, costs: costs })).roll();

                        let result = rollTable.find(el => el.min <= roll.total && el.max >= roll.total);
                        let index = rollTable.indexOf(result);

                        if (lowerFumbleResult) {
                            index = Math.max(index - lowerFumbleResult, 0);
                            result = rollTable[index];
                        }

                        let data = {};
                        data.roll = roll;
                        data.title = game.i18n.localize("splittermond.magicFumble");
                        data.rollType = roll.formula;
                        data.img = "";
                        data.degreeOfSuccessDescription = `<div class="fumble-table-result">`;
                        rollTable.forEach(el => {
                            if (el === result) {
                                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item fumble-table-result-item-active"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
                            } else {
                                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
                            }

                        });
                        data.degreeOfSuccessDescription += `</div>`;
                        //data.degreeOfSuccessDescription = `<div class="fumble-table-result fumble-table-result-active">"${game.i18n.localize(result.text)}</div>`;


                        let templateContext = {
                            ...data,
                            tooltip: await data.roll.getTooltip()
                        };

                        let chatData = {
                            user: game.user.id,
                            speaker: ChatMessage.getSpeaker({ actor: this }),
                            roll: roll,
                            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
                            sound: CONFIG.sounds.dice,
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL
                        };

                        ChatMessage.create(chatData);
                    }
                },
                sorcerer: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("splittermond.sorcerer"),
                    callback: async (html) => {
                        const rollTable = CONFIG.splittermond.fumbleTable.magic.sorcerer;
                        let eg = parseInt(html.find('[name=eg]')[0].value || 0);
                        let costs = html.find('[name=costs]')[0].value;
                        let lowerFumbleResult = Math.abs(parseInt(html.find('[name=lowerFumbleResult]')[0].value) || 0);
                        if (parseInt(costs)) {
                            costs = parseInt(costs);
                        } else {
                            let costDataRaw = /([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(costs.toLowerCase());
                            costs = parseInt(costDataRaw[2]);
                        }

                        let roll = (new Roll(`2d10+@eg[${game.i18n.localize("splittermond.degreeOfSuccessAbbrev")}]*@costs[${game.i18n.localize("splittermond.focusCosts")}]`, { eg: eg, costs: costs })).roll();

                        let result = rollTable.find(el => el.min <= roll.total && el.max >= roll.total);
                        let index = rollTable.indexOf(result);

                        if (lowerFumbleResult) {
                            index = Math.max(index - lowerFumbleResult, 0);
                            result = rollTable[index];
                        }

                        let data = {};
                        data.roll = roll;
                        data.title = game.i18n.localize("splittermond.magicFumble");
                        data.rollType = roll.formula;
                        data.img = "";
                        data.degreeOfSuccessDescription = `<div class="fumble-table-result">`;
                        rollTable.forEach(el => {
                            if (el === result) {
                                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item fumble-table-result-item-active"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
                            } else {
                                data.degreeOfSuccessDescription += `<div class="fumble-table-result-item"><div class="fumble-table-result-item-range">${el.min}&ndash;${el.max}</div>${game.i18n.localize(el.text)}</div>`
                            }

                        });
                        data.degreeOfSuccessDescription += `</div>`;
                        //data.degreeOfSuccessDescription = `<div class="fumble-table-result fumble-table-result-active">"${game.i18n.localize(result.text)}</div>`;


                        let templateContext = {
                            ...data,
                            tooltip: await data.roll.getTooltip()
                        };

                        let chatData = {
                            user: game.user.id,
                            speaker: ChatMessage.getSpeaker({ actor: this }),
                            roll: roll,
                            content: await renderTemplate("systems/splittermond/templates/chat/skill-check.hbs", templateContext),
                            sound: CONFIG.sounds.dice,
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL
                        };

                        ChatMessage.create(chatData);

                    }
                },
            },
            default: defaultTable
        }, { classes: ["splittermond", "dialog"] });
        d.render(true);
        return;
    }

    async addTicks(value = 3, message = "") {
        const combat = game.combat;
        value = parseInt(value);
        if (!value) return;
        if (!combat) return;

        // Find combatant
        let combatant = combat.combatants.find((c) => c.actor === this);

        if (!combatant) return;

        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: this.data.name + " - Ticks",
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

        let newInitiative = Math.round(combatant.initiative) + parseInt(nTicks);


        return combat.setInitiative(combatant._id, newInitiative);
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
        let strParts = str.split("/");
        if (strParts.length > 1) {
            str = strParts[1];
        } else {
            str = strParts[0];
        }
        let costDataRaw = /([k]{0,1})([0-9]+)v{0,1}([0-9]*)/.exec(str.toLowerCase());
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

        let focusData = duplicate(data.focus);
        let healthData = duplicate(data.health);
        focusData.exhausted.value = 0;
        healthData.exhausted.value = 0;

        return this.update({ "data.focus": focusData, "data.health": healthData });
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

        let focusData = duplicate(data.focus);
        let healthData = duplicate(data.focus);


        if (await p) {
            focusData.channeled.entries = [];
        }

        healthData.channeled.entries = [];

        focusData.exhausted.value = 0;
        healthData.exhausted.value = 0;

        focusData.consumed.value = Math.max(focusData.consumed.value - actorData.focusRegeneration.multiplier * data.attributes.willpower.value, 0);
        healthData.consumed.value = Math.max(healthData.consumed.value - actorData.healthRegeneration.multiplier * data.attributes.constitution.value, 0);

        return this.update({ "data.focus": focusData, "data.health": healthData });
    }

    consumeCost(type, valueStr, description) {
        const actorData = this.data;
        const data = actorData.data;
        let costData = this._parseCostsString(valueStr.toString());

        let subData = duplicate(data[type]);

        if (costData.channeled) {
            if (!subData.channeled.hasOwnProperty("entries")) {
                subData.channeled = {
                    value: 0,
                    entries: []
                }
            }

            subData.channeled.entries.push({
                description: description,
                costs: costData.channeled,
            });

        }
        if (!subData.exhausted.value) {
            subData.exhausted = {
                value: 0
            }
        }

        if (!subData.consumed.value) {
            subData.consumed = {
                value: 0
            }
        }

        subData.exhausted.value += costData.exhausted;
        subData.consumed.value += costData.consumed;

        this.update({
            "data": {
                [type]: subData
            }
        });


    }

    async activeDefenseDialog(type = "defense") {
        if (type.toLowerCase() === "vtd") {
            type = "defense";
        }
        if (type.toLowerCase() === "kw") {
            type = "bodyresist";
        }
        if (type.toLowerCase() === "gw") {
            type = "mindresist";
        }

        if (type === "defense") {
            let content = await renderTemplate("systems/splittermond/templates/apps/dialog/active-defense.hbs", { activeDefense: this.data.data.activeDefense.defense });
            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: game.i18n.localize("splittermond.activeDefense"),
                    content: content,
                    buttons: {
                        cancel: {
                            label: game.i18n.localize("splittermond.cancel"),
                            callback: html => {
                                resolve(false);
                            }
                        }
                    },
                    render: (html) => {
                        html.find(".rollable").click(event => {
                            const type = $(event.currentTarget).closestData('roll-type');
                            if (type === "activeDefense") {
                                const itemId = $(event.currentTarget).closestData('defense-id');
                                const defenseType = $(event.currentTarget).closestData('defense-type');
                                this.rollActiveDefense(defenseType, this.data.data.activeDefense.defense.find(el => el._id === itemId));
                                dialog.close();
                            }
                        });
                    }
                }, { classes: ["splittermond", "dialog"], width: 500 });
                dialog.render(true);
            });
        } else {
            this.rollActiveDefense(type, this.data.data.activeDefense[type][0]);
        }

    }

    toCompendium(pack) {
        this.setFlag('splittermond', 'originId', this._id);
        return super.toCompendium(pack);
    }
}