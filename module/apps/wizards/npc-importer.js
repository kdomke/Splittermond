import SplittermondCompendium from "../../util/compendium.js";

export default class NPCImporter extends Application {
    constructor(clipboarddata, options = {}) {
        super(options)
        this.clipboarddata = clipboarddata;
        this.actor = null;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/apps/wizards/npc-importer.hbs",
            id: "npc-importer",
            title: "NPC Import",
            resizable: true
        });
    }

    async updateActor(actorData) {
        this.actor = await Actor.create(actorData, {renderSheet: true, temporary: true});
        this.actor.sheet.render(true);
    }

    async parseData() {
        if (!this.clipboarddata) return;
        let rawString = this.clipboarddata.replace(/\r|\x02/g, "").replace(/\r\n/g, "\n");
        let tokenizedData = rawString.split(/(AUS\s+BEW\s+INT\s+KON\s+MYS\s+STÄ\s+VER\s+WIL\s+GK\s+GSW\s+LP\s+FO\s+VTD\s+SR\s+KW\s+GW|GK\s+GSW\s+LP\s+FO\s+VTD\s+SR\s+KW\s+GW|AUS\s+BEW\s+INT\s+KON\s+MYS\s+STÄ\s+VER\s+WIL|AUS\s+BEW\s+INT\s+KON\s+MYS\s+STÄ\s+VER\s+WIL\s+GK\s+GSW\s+LP\s+FO\s+VTD\s+SR\s+KW\s+GW|Fertigkeiten:|Monstergrad:|Zauber:|Meisterschaften:|Merkmale:|Beute:|Wichtige Attribute:|Wichtige abgeleitete Werte:|Waffen Wert Schaden WGS.*|Kampfweise:|Typus:|Übliche Anzahl:|Anmerkung:|Besonderheiten:)/);
        let temp = tokenizedData[0].match(/([^]+?)\n([^]*?)/g);
        
        let actorData ={
            name: temp[0].trim(),
            type: "npc",
            data: {
                biography: "<p>"+(temp.slice(1)?.join(" ")?.replace(/\n/g,"") || "")+"</p>",
                attributes: {
                    "charisma": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "agility": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "intuition": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "constitution": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "mystic": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "strength": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "mind": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    },
                    "willpower": {
                        "species": 0,
                        "initial": 0,
                        "advances": 0,
                        "value": 0
                    }
                },
                derivedAttributes: {
                    "size": {
                        "value": 0
                    },
                    "speed": {
                        "value": 0
                    },
                    "initiative": {
                        "value": 0
                    },
                    "healthpoints": {
                        "value": 0
                    },
                    "focuspoints": {
                        "value": 0
                    },
                    "defense": {
                        "value": 0
                    },
                    "bodyresist": {
                        "value": 0
                    },
                    "mindresist": {
                        "value": 0
                    }
                },
                damageReduction: {
                    value: 0
                },
                skills: {},
                level: "",
                biography: "",
            },
            items: []
        };

        actorData.data.biography = "<p>"+(temp.slice(1)?.join(" ")?.replace(/\n/g,"") || "")+"</p>";

        for (let i = 1; i < tokenizedData.length; i++) {
            try {
                switch(true) {
                    case /AUS\s+BEW\s+INT\s+KON\s+MYS\s+STÄ\s+VER\s+WIL/.test(tokenizedData[i]):
                        let attributeData = tokenizedData[i+1].trim().split(/\s+/);
                        actorData.data.attributes.charisma.value = parseInt(attributeData[0]);
                        actorData.data.attributes.agility.value = parseInt(attributeData[1]);
                        actorData.data.attributes.intuition.value = parseInt(attributeData[2]);
                        actorData.data.attributes.constitution.value = parseInt(attributeData[3]);
                        actorData.data.attributes.mystic.value = parseInt(attributeData[4]);
                        actorData.data.attributes.strength.value = parseInt(attributeData[5]);
                        actorData.data.attributes.mind.value = parseInt(attributeData[6]);
                        actorData.data.attributes.willpower.value = parseInt(attributeData[7]);
                        if (attributeData.length == 8) break;
                        tokenizedData[i+1] = attributeData.slice(8).join(" ");
                    case /GK\s+GSW\s+LP\s+FO\s+VTD\s+SR\s+KW\s+GW/.test(tokenizedData[i]):
                        let derivedValueData = tokenizedData[i+1].trim().match(/([0-9]+(:?\s+\/\s+[0-9]+)*)/g);
                        actorData.data.derivedAttributes.size.value = parseInt(derivedValueData[0]);
                        actorData.data.derivedAttributes.speed.value = parseInt(derivedValueData[1]);
                        actorData.data.derivedAttributes.healthpoints.value = parseInt(derivedValueData[2]);
                        actorData.data.derivedAttributes.focuspoints.value = parseInt(derivedValueData[3]);
                        actorData.data.derivedAttributes.defense.value = parseInt(derivedValueData[4]);
                        actorData.data.damageReduction.value = parseInt(derivedValueData[5]);
                        actorData.data.derivedAttributes.bodyresist.value = parseInt(derivedValueData[6]);
                        actorData.data.derivedAttributes.mindresist.value = parseInt(derivedValueData[7]);
                        break;
                    case /Wichtige Attribute:/.test(tokenizedData[i]):
                        tokenizedData[i+1].split(",").forEach((i) => {
                            let iData = i.trim().split(" ");
                            switch (iData[0]) {
                                case "AUS":
                                    actorData.data.attributes.charisma.value = parseInt(iData[1]);
                                    break;
                                case "BEW":
                                    actorData.data.attributes.agility.value = parseInt(iData[1]);
                                    break;
                                case "INT":
                                    actorData.data.attributes.intuition.value = parseInt(iData[1]);
                                    break;
                                case "KON":
                                    actorData.data.attributes.constitution.value = parseInt(iData[1]);
                                    break;
                                case "MYS":
                                    actorData.data.attributes.mystic.value = parseInt(iData[1]);
                                    break;
                                case "STÄ":
                                    actorData.data.attributes.strength.value = parseInt(iData[1]);
                                    break;
                                case "VER":
                                    actorData.data.attributes.mind.value = parseInt(iData[1]);
                                    break;
                                case "WILL":
                                case "WIL":
                                    actorData.data.attributes.willpower.value = parseInt(iData[1]);
                                    break;
                            }
                        })
                        break;
                    case /Wichtige abgeleitete Werte:/.test(tokenizedData[i]):
                        tokenizedData[i+1].split(",").forEach((i) => {
                            let iData = i.trim().split(" ");
                            switch (iData[0]) {
                                case "GK":
                                    actorData.data.derivedAttributes.size.value = parseInt(iData[1]);
                                    break;
                                case "GSW":
                                    actorData.data.derivedAttributes.speed.value = parseInt(iData[1]);
                                    break;
                                case "LP":
                                    actorData.data.derivedAttributes.healthpoints.value = parseInt(iData[1]);
                                    break;
                                case "FO":
                                    actorData.data.derivedAttributes.focuspoints.value = parseInt(iData[1]);
                                    break;
                                case "VTD":
                                    actorData.data.derivedAttributes.defense.value = parseInt(iData[1]);
                                    break;
                                case "SR":
                                    actorData.data.damageReduction.value = parseInt(iData[1]);
                                    break;
                                case "KW":
                                    actorData.data.derivedAttributes.bodyresist.value = parseInt(iData[1]);
                                    break;
                                case "GW":
                                    actorData.data.derivedAttributes.mindresist.value = parseInt(iData[1]);
                                    break;
                            }
                        });
                        break;
                    case /Fertigkeiten:/.test(tokenizedData[i]):
                        tokenizedData[i+1].replace(/\n/g,"").split(",").forEach(skillStr => {
                            let skillData = skillStr.trim().match(/(.*?)\s+([0-9]+)/);
                            let skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase() === skillData[1].toLowerCase());
                            let skillValue = parseInt(skillData[2]) || 0;
                            actorData.data.skills[skill] = {
                                value: skillValue
                            }
                            if (CONFIG.splittermond.skillAttributes[skill]) {
                                actorData.data.skills[skill].points = actorData.data.skills[skill].value;
                                actorData.data.skills[skill].points -= parseInt(actorData.data.attributes[CONFIG.splittermond.skillAttributes[skill][0]].value) || 0;
                                actorData.data.skills[skill].points -= parseInt(actorData.data.attributes[CONFIG.splittermond.skillAttributes[skill][1]].value) || 0;
                                if (skill == "stealth") {
                                    actorData.data.skills[skill].points -= 5-parseInt(actorData.data.derivedAttributes.size.value);
                                }
                            }
                        });
                        break;
                    case /Waffen Wert Schaden WGS.*/.test(tokenizedData[i]):
                        let weaponRegExpStr = `(.*)\\s+([0-9]+)\\s+([0-9W+\\-]+)\\s+([0-9]+)(?:\\s+Tick[s]?)?\\s+([\\-–]+|[0-9]+|[0-9]+\\s*m)?\\s?([0-9]+)\\-1?W6\\s*((?:${CONFIG.splittermond.weaponFeatures.join("|").replace(/\s+/,"\\s+")}|\\s+|\s*[\\-–]\s*)\\s*[0-9]*\\s*,?\\s*)*[\r\n]*`;
                        let weaponData = tokenizedData[i+1].trim().match(new RegExp(weaponRegExpStr,"g")).map(weaponStr => {
                            weaponStr = weaponStr.trim().replace(/\n/g, " ").replace(/\s{2,}/g," ");
                            let weaponMatch = weaponStr.match(new RegExp(`(.*)\\s+([0-9]+)\\s+([0-9W+\\-]+)\\s+([0-9]+)(?:\\s+Tick[s]?)?\\s+([\\-–]+|[0-9]+|[0-9]+\\s*m)?\\s?([0-9]+)\\-1?W6\\s*(.*)`));
                            let weaponName = weaponMatch[1].trim();
                            return {
                                name: weaponName,
                                skillValue: parseInt(weaponMatch[2].trim()) || 0,
                                damage: weaponMatch[3].trim(),
                                weaponSpeed: parseInt(weaponMatch[4].trim()) || 0,
                                range: weaponMatch[6].trim() || "-",
                                features: weaponMatch[7].trim(),
                            };
                        });
                       
                        actorData.items.push(...await Promise.all(weaponData.map(async data => {
                            let weaponData = duplicate(await SplittermondCompendium.findItem("weapon", data.name) || {
                                type: "npcattack",
                                name: data.name,
                                img: CONFIG.splittermond.icons.weapon[data.name] || CONFIG.splittermond.icons.weapon.default,
                                data: {}
                            });
                            weaponData.data.damage = data.damage;
                            weaponData.data.weaponSpeed =  data.weaponSpeed;
                            weaponData.data.range =  data.range;
                            weaponData.data.features =  data.features;
                            if (weaponData.type == "npcattack") {
                                weaponData.data.skillValue = data.skillValue;
                            } else {
                                if (!weaponData.data.skill) {
                                    weaponData.data.skill = "melee";
                                    weaponData.data.attribute1 = "agility";
                                    weaponData.data.attribute2 = "strength";
                                }
                                actorData.data.skills[weaponData.data.skill] = {
                                    value: data.skillValue,
                                    points: data.skillValue - actorData.data.attributes[weaponData.data.attribute1].value - actorData.data.attributes[weaponData.data.attribute2].value
                                };
                            }
                            return weaponData;
                        })));
                        break;
                    case /Meisterschaften:/.test(tokenizedData[i]):
                        let masteries = [];
                        tokenizedData[i+1].replace(/\n/g,"").match(/[^(]+ \([^)]+\),?/g)?.forEach((skillEntryStr) => {
                            let masteryEntryData = skillEntryStr.trim().match(/([^(]+)\s+\(([^)]+)\)/);
                            let skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase() === masteryEntryData[1].toLowerCase());
                            let level = 1;
                            masteryEntryData[2].split(/,|;|:/).forEach((masteryStr) => {
                                masteryStr = masteryStr.trim();
                                if (masteryStr === "I") {
                                    level = 1;
                                } else if (masteryStr === "II") {
                                    level = 2;
                                } else if (masteryStr === "III") {
                                    level = 3;
                                } else if (masteryStr === "IV") {
                                    level = 4;
                                } else {
                                    let masteryName = masteryStr.trim();
                                    masteries.push({
                                        type: "mastery",
                                        name: masteryName,
                                        data: {
                                            skill: skill,
                                            level: level
                                        }
                                    });
                                }
                            });
                        });

                        actorData.items.push(...await Promise.all(masteries.map(async data => {
                            let searchString = data.name.match(/([^(,\[]+)(?:\([^)]+?\)|\[[^\]]+?\])?/);
                            let masteryData = await SplittermondCompendium.findItem("mastery", searchString[1].trim());
                            if (masteryData) {
                                masteryData = duplicate(masteryData);
                                delete masteryData._id;
                                masteryData.data.skill = data.data.skill;
                                masteryData.data.level = data.data.level;
                                return masteryData
                            } 
                            return data;
                        })));
                        break;
                    case /Merkmale:/.test(tokenizedData[i]):
                        let features = [];
                        tokenizedData[i+1].replace(/\n/g,"").match(/[^,(]+(?:\([^)]+?\))?/gm)?.forEach((f) => {
                            if (f.trim()) {
                                features.push({
                                    name: f.trim(),
                                    type: "npcfeature",
                                    data: {}
                                });
                            }
                        });
                        actorData.items.push(...await Promise.all(features.map(async data => {
                            let searchString = data.name.match(/([^(,0-9]+)(?:\s*[0-9]+)?(?:\s*\([^)]+?\))?/);
                            if (searchString[1].split(" ").length > 2) {
                                searchString[1] = searchString[1].split(" ")[0];
                            }
                            let featureData = await SplittermondCompendium.findItem("npcfeature", searchString[1].trim());
                            if (featureData) {
                                featureData = duplicate(featureData);
                                delete featureData._id;
                                featureData.name = data.name;
                                return featureData
                            } 
                            return data;
                        })));
                        break;
                    case /Typus:/.test(tokenizedData[i]):
                        actorData.data.type = tokenizedData[i+1].trim();
                        break;
                    case /Monstergrad:/.test(tokenizedData[i]):
                        actorData.data.level = tokenizedData[i+1].trim();
                        break;
                    case /Zauber:/.test(tokenizedData[i]):
                        let spells = [];
                        let skill = "";
                        let level = 0;
                        tokenizedData[i+1].replace(/\n/g,"").split(/;|,/)?.forEach(skillEntryStr => {
                            let spellEntryData = skillEntryStr.trim().match(/(:?([^ ]{3,})?\s*([0IV]+):)?\s*([^]+)/)
                            if (spellEntryData[2]) {
                                let newSkill = CONFIG.splittermond.skillGroups.magic.find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase().startsWith(spellEntryData[2].toLowerCase()));
                                if (newSkill) {
                                    skill = newSkill;
                                }
                            }
                            
                            switch (spellEntryData[3]) {
                                case "0":
                                    level = 0;
                                    break;
                                case "I":
                                    level = 1;
                                    break;
                                case "II":
                                    level = 2;
                                    break;
                                case "III":
                                    level = 3;
                                    break;
                                case "IV":
                                    level = 4;
                                    break;
                                case "V":
                                    level = 5;
                                    break;
                            }

                            spellEntryData[4].split(",").forEach((s) => {
                                let spellName = s.trim().replace(/\n/g, " ");
                                spells.push({
                                    type: "spell",
                                    name: spellName,
                                    data: {
                                        skill: skill,
                                        skillLevel: level
                                    }
                                });
                            })
                        });
                        actorData.items.push(...await Promise.all(spells.map(async data => {
                            let searchString = data.name.match(/([^\[]+)(?:\[[\[]+\])?/)
                            let spellData = await SplittermondCompendium.findItem("spell", searchString[1]);
                            if (spellData) {
                                spellData = duplicate(spellData);
                                delete spellData._id;
                                spellData.name = data.name;
                                spellData.data.skill = data.data.skill;
                                spellData.data.skillLevel = data.data.level;
                                return spellData
                            } 
                            return data;
                        })));
                        break;
                    case /Beute:/.test(tokenizedData[i]):
                        tokenizedData[i+1].match(/[^(,]+\([^)]+\)/g)?.forEach?.(lootEntryStr => {
                            lootEntryStr = lootEntryStr.replace(/\n/, " ");
                            let lootEntryData = lootEntryStr.match(/([^(,]+)\(([^)]+)\)/);
                            let costs = 0;
                            let description = lootEntryData[2];
                            if (lootEntryData[2]) {
                                lootEntryStr.match(/([0-9]+) (L?|T?|S?)(.*)/);
                                costs = lootEntryStr[1] + " " + lootEntryStr[2];
                            }
                            actorData.items.push({
                                type: "equipment",
                                name: lootEntryData[1].trim(),
                                data: {
                                    description: description,
                                    costs: costs
                                }
                            })
                        });
                    case /Besonderheiten:/.test(tokenizedData[i]):
                        actorData.data.biography += `<h2>Besonderheiten</h2>`;
                        actorData.data.biography += `<p>${tokenizedData[i+1].trim()}</p>`;
                        break;
                    case /Kampfweise:/.test(tokenizedData[i]):
                        actorData.data.biography += `<h2>Kampfweise</h2>`;
                        actorData.data.biography += `<p>${tokenizedData[i+1].trim()}</p>`;
                        break;
                    case /Anmerkung:/.test(tokenizedData[i]):
                        actorData.data.biography += `<h2>Anmerkung</h2>`;
                        actorData.data.biography += `<p>${tokenizedData[i+1].trim()}</p>`;
                        break;
                }
            } catch (e) {
                ui.notifications.error(game.i18n.format("splittermond.error.parseError",{section: tokenizedData[i]}));
                console.log(game.i18n.format("splittermond.error.parseError",{section: tokenizedData[i]}) + tokenizedData[i+1]);
            }


        }

        this.updateActor(actorData);
    }

    getData() {
        const data = super.getData();
        data.clipboarddata = this.clipboarddata;
        data.ready = true;
        this.parseData();
        return data;
    }

    activateListeners(html) {

        html.find('textarea[name="clipboarddata"]').change(
            event => {
                const clipboarddata = event.currentTarget.value;
                this.clipboarddata = clipboarddata;
                
                this.parseData();
            }
        );

        html.find('button[name="import"]').click(this._onSave.bind(this));
        html.find('button[name="cancel"]').click(this._onCancel.bind(this));
    }

    _onSave(event) {
        this.close();
    }

    _onCancel(event) {
        this.close();
    }
}