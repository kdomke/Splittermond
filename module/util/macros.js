export function skillCheck(skill, options = {}) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    actor.rollSkill(skill, options);
}

export function attackCheck(actorId, attack) {
    const actor = game.actors.get(actorId);
    if (!actor) return;
    actor.rollAttack(attack);
}

export function itemCheck(itemType, itemName, actorId = "", itemId = "") {
    let actor;
    if (actorId)
        actor = game.actors.get(actorId);
    else {
        const speaker = ChatMessage.getSpeaker();
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
    }

    if (actor) {
        let item;
        if (itemId) {
            item = actor.data.items.find(el => el._id === itemId)
            if (!item) {
                item = game.data.items.find(el => el._id === itemId);
                item = actor.data.items.find(el => el.name === item?.name && el.type === item?.type)
            }
        } else {
            item = actor.data.items.find(el => el.name === itemName && el.type === itemType)
        }
        if (item) {
            if (item.type === "spell") {
                actor.rollSpell(item);
            }

            if (item.type === "weapon") {
                actor.rollAttack(item);
            }
        } else {
            ui.notifications.error(game.i18n.localize("splittermond.invalidItem"));
        }

    } else {
        ui.notifications.info(game.i18n.localize("splittermond.pleaseSelectAToken"));
    }


}


export function requestSkillCheck(skill) {
    let skillLabel = "";
    let difficulty = 15;

    if (event) {
        if (event.type === "click") {

            let parsedString = /(.+)\s*(>|gegen|gg\.)\s*([0-9]*)|(.+)/.exec(event.target.closest('button,a')?.textContent.trim());
            console.log(parsedString)
            if (parsedString) {
                skillLabel = parsedString[0].trim().toLowerCase();

                if (parsedString[3]) {
                    skillLabel = parsedString[1].trim().toLowerCase();
                    difficulty = parseInt(parsedString[3]);
                }
            }
        }
    }


    let preSelectedSkill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].find((skill) => skill === skillLabel || game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase() === skillLabel);

    let optionsList = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].reduce((str, skill) => {
        skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
        let selected = (skill === preSelectedSkill ? "selected" : "");
        return `${str}<option value="${skill}" ${selected}>${skillLabel}</option>`;
    }, "");
    console.log(optionsList)
    skillLabel = game.i18n.localize(`splittermond.skill`);
    let difficultyLabel = game.i18n.localize(`splittermond.difficulty`);
    let content = `<form style='display: grid; grid-template-columns: 4fr 1fr'>
<label>${skillLabel}</label>
<select name="skill">
${optionsList}
</select>
<label>Schwierigkeit</label><input name='difficulty' data-dtype='Number' value="${difficulty}"></form>`;
    let versusLabel = game.i18n.localize(`splittermond.versus`);
    let d = new Dialog({
        title: game.i18n.localize(`splittermond.requestSkillCheck`),
        content: content,
        buttons: {

            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            },
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: (html) => {
                    let skill = html.find('[name="skill"]')[0].value;
                    let difficulty = parseInt(html.find('[name="difficulty"]')[0].value);
                    let skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
                    ChatMessage.create({
                        user: game.user._id,
                        speaker: ChatMessage.getSpeaker(),
                        content: `@Macro[skillCheck]{${skillLabel} ${versusLabel} ${difficulty}}`
                    });
                }
            },
        },
        default: "ok"
    });
    d.render(true);
}

export async function importSpell(rawData) {
    let spellData = {
        type: "spell",
        name: "",
        img: CONFIG.splittermond.icons.spell.default,
        data: {}
    };
    let nameData = rawData.match(/([^(]+)\s(\(.*\))/);
    spellData.name = `${nameData[1]} ${nameData[2]}`;

    let skillsData = rawData.match(/Schulen: ([^:]+?)\n[^ ]+:/);
    spellData.data.availableIn = skillsData[1].split(",").map(s => {
        let data = s.match(/([^ ]+)\s([0-5])/);
        let skill = CONFIG.splittermond.skillGroups.magic.find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase().startsWith(data[1].toLowerCase()));
        spellData.data.skill = skill;
        spellData.data.skillLevel = parseInt(data[2]);
        return `${skill} ${data[2]}`;
    }).join(", ");

    let typeData = rawData.match(/Typus: ([^:]+?)\n[^ ]+:/);
    spellData.data.spellType = typeData[1];

    let difficultyData = rawData.match(/Schwierigkeit: ([^:]+?)\n[^ ]+:/);
    spellData.data.difficulty = difficultyData[1];

    if (spellData.data.difficulty.search("Geistiger Widerstand") >= 0) {
        spellData.data.difficulty = "GW";
    }

    if (spellData.data.difficulty.search("Körperlicher Widerstand") >= 0) {
        spellData.data.difficulty = "KW";
    }

    if (spellData.data.difficulty.search("Verteidigung") >= 0) {
        spellData.data.difficulty = "VTD";
    }

    let costsData = rawData.match(/Kosten: ([^:]+?)\n[^ ]+:/);
    spellData.data.costs = costsData[1];

    let castDurationData = rawData.match(/Zauberdauer: ([^:]+?)\n[^ ]+:/);
    spellData.data.castDuration = castDurationData[1];

    let descriptionData = rawData.match(/Wirkung: ([^:]+?)\n[^ ]+:/);
    spellData.data.description = descriptionData[1];
    spellData.data.description = spellData.data.description.replace(/\n/g, " ");
    spellData.data.description = spellData.data.description.replace(/  /g, " ");

    let effectDurationData = rawData.match(/Wirkungsdauer: ([^:]+?)\n[^ ]+:/);
    if (effectDurationData)
        spellData.data.effectDuration = effectDurationData[1];
    else
        spellData.data.effectDuration = "";

    let effectAreaData = rawData.match(/Wirkungsbereich: ([^:]+?)\n[^ ]+:/);
    if (effectAreaData)
        spellData.data.effectArea = effectAreaData[1];
    else
        spellData.data.effectArea = "";

    let rangeData = rawData.match(/Reichweite: ([^:]+?)\n[^ ]+:/);
    if (rangeData)
        spellData.data.range = rangeData[1];
    else
        spellData.data.range = "";

    let egData = rawData.match(/Erfolgsgrade:\n([^]+)/);
    let enhancementData = egData[1].match(/([0-9] EG) \(Kosten ([KV0-9+]+)\): ([^]+)/);
    spellData.data.enhancementCosts = `${enhancementData[1]}/${enhancementData[2]}`;
    spellData.data.enhancementDescription = enhancementData[3].replace(/\n/g, " ");
    spellData.data.enhancementDescription = spellData.data.enhancementDescription.replace(/  /g, " ");
    spellData.data.degreeOfSuccessOptions = {
        castDuration: egData[1].search("Auslösezeit") >= 0,
        consumedFocus: egData[1].search("Verzehrter Fokus") >= 0,
        exhaustedFocus: egData[1].search("Erschöpfter Fokus") >= 0,
        channelizedFocus: egData[1].search("Kanalisierter Fokus") >= 0,
        effectDuration: egData[1].search("Wirkungsdauer") >= 0
    }

    let damage = /([0-9]*[wWdD][0-9]{1,2}[ \-+0-9]*)/.exec(spellData.data.description);
    if (damage) {
        spellData.data.damage = damage[0] || "";
    }



    Item.create(spellData);

    console.log(spellData);
}


export async function importNpc() {
    let clipboard = await navigator.clipboard.readText();
    clipboard = clipboard.replace(/\r\n/g, "\n");
    let stats = clipboard;
    let name = "";
    let description = "";
    if (!clipboard.startsWith("AUS")) {
        let temp = clipboard.match(/([^]+?)\n([^]*?)(AUS BEW[^]*)/);
        if (temp) {
            name = temp[1].trim();
            temp[2] = temp[2].replace(/-\n/g, "");
            description = temp[2].replace(/\n/g, " ");
            stats = temp[3];
        }

    }
    let d = new Dialog({
        title: game.i18n.localize(`splittermond.importNpcData`),
        content: `<form><label>Name</label><input type="text" name="name" value="${name}"><label>Beschreibung</label><textarea style="height: 300px" name='description'>${description}</textarea><label>Data</label><textarea style="height: 300px;" name='data'>${stats}</textarea></form>`,
        buttons: {

            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            },
            import: {
                icon: '<i class="fas fa-check"></i>',
                label: "Import",
                callback: (html) => {
                    let importData = html.find('[name="data"]')[0].value;
                    let parsedData = /AUS BEW INT KON MYS STÄ VER WIL\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)/.exec(importData);
                    let AUS = parseInt(parsedData[1]);
                    let BEW = parseInt(parsedData[2]);
                    let INT = parseInt(parsedData[3]);
                    let KON = parseInt(parsedData[4]);
                    let MYS = parseInt(parsedData[5]);
                    let STÄ = parseInt(parsedData[6]);
                    let VER = parseInt(parsedData[7]);
                    let WIL = parseInt(parsedData[8]);
                    parsedData = /GK GSW LP FO VTD SR KW GW\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)/.exec(importData);
                    let GK = parseInt(parsedData[1]);
                    let GSW = parseInt(parsedData[2]);
                    let LP = parseInt(parsedData[3]);
                    let FO = parseInt(parsedData[4]);
                    let VTD = parseInt(parsedData[5]);
                    let SR = parseInt(parsedData[6]);
                    let KW = parseInt(parsedData[7]);
                    let GW = parseInt(parsedData[8]);
                    let INI = 0;
                    let weaponData = /(Waffen Wert Schaden WGS.*)\n([^]*?)\n[^\s]+:/g.exec(importData);
                    let weapons = [];
                    if (weaponData) {
                        if (weaponData[1].match(/Reichw/)) {
                            weaponData[2].match(/.* [0-9]+ [0-9W\-+]+ [0-9]+ Tick[s]? [0-9\-]+\-1W6 [0-9\-–]* .*/g).forEach(weaponStr => {
                                let weaponDataRaw = weaponStr.match(/(.*) ([0-9]+) ([0-9W\-+]+) ([0-9]+) Tick[s]? ([0-9\-]+)\-1W6 ([0-9\-–]*) (.*)/);
                                INI = parseInt(weaponDataRaw[5].trim()) || 0;
                                weapons.push({
                                    type: "weapon",
                                    name: weaponDataRaw[1].trim(),
                                    data: {
                                        damage: weaponDataRaw[3].trim(),
                                        weaponSpeed: parseInt(weaponDataRaw[4].trim()) || 0,
                                        range: parseInt(weaponDataRaw[6].trim()) || 0,
                                        features: weaponDataRaw[7].trim()
                                    }
                                })
                            });
                        } else {
                            weaponData[2].match(/.* [0-9]+ [0-9W\-+]+ [0-9]+ Tick[s]? [0-9\-]+\-1W6 .*/g).forEach(weaponStr => {
                                let weaponDataRaw = weaponStr.match(/(.*) ([0-9]+) ([0-9W\-+]+) ([0-9]+) Tick[s]? ([0-9\-]+)\-1W6 (.*)/);
                                INI = parseInt(weaponDataRaw[5].trim()) || 0;
                                weapons.push({
                                    type: "weapon",
                                    name: weaponDataRaw[1].trim(),
                                    data: {
                                        damage: weaponDataRaw[3].trim(),
                                        weaponSpeed: parseInt(weaponDataRaw[4].trim()) || 0,
                                        range: 0,
                                        features: weaponDataRaw[6].trim()
                                    }
                                })
                            });
                        }
                    }

                    let skillData = /Fertigkeiten: ([^]*?)\n[^\s]+:/g.exec(importData);
                    let skillObj = {};
                    if (skillData[1]) {
                        skillData[1].split(",").forEach(skillStr => {
                            let skillData = skillStr.trim().match(/(.*?)\s+([0-9]+)/);
                            let skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase() === skillData[1].toLowerCase());
                            skillObj[skill] = {
                                value: skillData[2]
                            }
                        });
                    }

                    let masteriesData = /Meisterschaften: ([^]*?)\n(Merkmale|Zauber|Beute|Fertigkeiten):/g.exec(importData);
                    let masteries = [];
                    if (masteriesData[1]) {
                        masteriesData[1].match(/[^(]+ \([^)]+\),?/g).forEach(skillEntryStr => {
                            let masteryEntryData = skillEntryStr.trim().match(/([^(]+)\s+\(([^)]+)\)/);
                            let skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.fighting].find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase() === masteryEntryData[1].toLowerCase());
                            let level = 1;
                            masteryEntryData[2].split(/,|;|:/).forEach(masteryStr => {
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
                                    masteries.push({
                                        type: "mastery",
                                        name: masteryStr.trim(),
                                        data: {
                                            skill: skill,
                                            level: level
                                        }
                                    })
                                }

                            });
                        })
                    }

                    let featuresData = /Merkmale: ([^:]*)\n(Beute:)?/g.exec(importData);
                    let features = [];
                    featuresData[1].split(/,/).forEach(f => {
                        if (f.trim()) {
                            features.push({
                                type: "npcfeature",
                                name: f.trim()
                            });
                        }

                    });

                    let typeData = /Typus: ([^]*?)\n[^\s]+:/g.exec(importData);
                    let type = "";
                    if (typeData) {
                        type = typeData[1];
                    }

                    let levelData = /Monstergrad: ([^]*?)\n[^\s]+:/g.exec(importData);
                    let level = "";
                    if (typeData) {
                        level = levelData[1];
                    }

                    let spellsData = /Zauber: ([^]*?)\n[\w]+:/g.exec(importData);
                    let spells = [];
                    if (spellsData) {
                        let skill = ""
                        spellsData[1].split(";").forEach(skillEntryStr => {
                            let spellEntryData = skillEntryStr.trim().match(/([^ ]*)\s*([0IV]+):\s+([^]+)/);
                            if (spellEntryData[1]) {
                                skill = CONFIG.splittermond.skillGroups.magic.find(i => game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase().startsWith(spellEntryData[1].toLowerCase()));
                            }
                            let level = 0;
                            switch (spellEntryData[2]) {
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
                                default:
                                    level = 0;
                            }
                            spellEntryData[3].split(",").forEach(s => {
                                spells.push({
                                    type: "spell",
                                    name: s.trim().replace(/\n/, " "),
                                    data: {
                                        skill: skill,
                                        skillLevel: level
                                    }
                                });
                            })
                        });
                    }



                    let lootData = /Beute: ([^]*)\n(Anmerkung:)?/g.exec(importData);
                    let equipment = [];
                    if (lootData) {
                        lootData[1].match(/[^(,]+\([^)]+\)/g).forEach(lootEntryStr => {
                            lootEntryStr = lootEntryStr.replace(/\n/, " ");
                            let lootEntryData = lootEntryStr.match(/([^(,]+)\(([^)]+)\)/);
                            let costs = 0;
                            let description = lootEntryData[2];
                            if (lootEntryData[2]) {
                                lootEntryStr.match(/([0-9]+) (L?|T?|S?)(.*)/);
                                costs = lootEntryStr[1] + " " + lootEntryStr[2];
                            }
                            equipment.push({
                                type: "equipment",
                                name: lootEntryData[1].trim(),
                                data: {
                                    description: description,
                                    costs: costs
                                }
                            })
                        });
                    }

                    let attributes = {
                        "charisma": {
                            "species": 0,
                            "initial": AUS,
                            "advances": 0
                        },
                        "agility": {
                            "species": 0,
                            "initial": BEW,
                            "advances": 0
                        },
                        "intuition": {
                            "species": 0,
                            "initial": INT,
                            "advances": 0
                        },
                        "constitution": {
                            "species": 0,
                            "initial": KON,
                            "advances": 0
                        },
                        "mystic": {
                            "species": 0,
                            "initial": MYS,
                            "advances": 0
                        },
                        "strength": {
                            "species": 0,
                            "initial": STÄ,
                            "advances": 0
                        },
                        "mind": {
                            "species": 0,
                            "initial": VER,
                            "advances": 0
                        },
                        "willpower": {
                            "species": 0,
                            "initial": WIL,
                            "advances": 0
                        }
                    };

                    Object.keys(skillObj).forEach(skill => {
                        if (CONFIG.splittermond.skillAttributes[skill]) {
                            skillObj[skill].points = skillObj[skill].value;
                            skillObj[skill].points -= parseInt(attributes[CONFIG.splittermond.skillAttributes[skill][0]].initial);
                            skillObj[skill].points -= parseInt(attributes[CONFIG.splittermond.skillAttributes[skill][1]].initial);
                        }
                    });



                    return Actor.update({
                        name: name,
                        type: "npc",
                        data: {
                            biography: description,
                            type: type,
                            level: level,
                            attributes: attributes,
                            derivedAttributes: {
                                "size": {
                                    "value": GK
                                },
                                "speed": {
                                    "value": GSW
                                },
                                "initiative": {
                                    "value": INI
                                },
                                "healthpoints": {
                                    "value": LP
                                },
                                "focuspoints": {
                                    "value": FO
                                },
                                "defense": {
                                    "value": VTD
                                },
                                "bodyresist": {
                                    "value": KW
                                },
                                "mindresist": {
                                    "value": GW
                                }
                            },
                            skills: skillObj
                        },
                        items: [...masteries, ...features, ...equipment, ...spells, ...weapons],
                    });
                }
            },
        },
        default: "ok"
    });
    d.render(true);
}