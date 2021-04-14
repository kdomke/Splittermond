import SplittermondCompendium from "./compendium.js"

export default class ItemImporter {

    static async _folderDialog() {
        let folderList = game.items.directory.folders.reduce((str, folder) => {
            return `${str} <option value="${folder._id}">${folder.name}</option>`;
        }, "");
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: game.i18n.localize("splittermond.selectAFolder"),
                content: `<label>Ordner</label > <select name="folder">
                <option value="">keinen Ordner</option>
            ${folderList}
        </select>`,
                buttons: {
                    ok: {
                        label: game.i18n.localize("splittermond.ok"),
                        callback: html => {
                            resolve(html.find('[name="folder"]')[0].value);
                        }
                    }
                }
            });
            dialog.render(true);
        });

        return p;
    }

    static async _skillDialog(skillOptions) {
        let optionsList = skillOptions.reduce((str, skill) => {
            let skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
            return `${str} <option value="${skill}">${skillLabel}</option>`;
        }, "");
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: "Waffenimport",
                content: `<labe >Kampffertigkeit</label > <select name="skill">
            ${optionsList}
        </select>`,
                buttons: {
                    ok: {
                        label: game.i18n.localize("splittermond.ok"),
                        callback: html => {
                            resolve(html.find('[name="skill"]')[0].value);
                        }
                    }
                }
            });
            dialog.render(true);
        });

        return p;
    }

    static async pasteEventhandler(e) {
        let rawData = e.clipboardData.getData("text");
        rawData = rawData.replace(/\r\n/g, "\n");
        rawData = rawData.replace(/-\n/g, "");
        rawData = rawData.replace(//g, "");
        console.log(rawData);

        // Check Spell
        if (rawData.includes("Schulen:") &&
            rawData.includes("Schwierigkeit:") &&
            rawData.includes("Typus:") &&
            rawData.includes("Kosten:") &&
            rawData.includes("Zauberdauer:") &&
            rawData.includes("Wirkung:")) {
            this.importSpell(rawData);
        }

        // Check multiple Weapons
        let test = rawData.match(/(.*?) +(Dorf|Kleinstadt|Großstadt|Metropole) +(?:([0-9]+ [LST])(?: *\/ *[0-9]+ [LST])?) +([0-9]+) +([0-9]+) +([UGFMA]) +([0-9+\-W]+) +([0-9]+) +((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|\+){3}) +(((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|) [0-9],? *)*|–) +(.+)/g);
        if (test) {
            if (test.length > 1) {
                let skill = await this._skillDialog(CONFIG.splittermond.skillGroups.fighting);
                let folder = await this._folderDialog();

                test.forEach(m => {
                    this.importWeapon(m, skill, folder);
                });
                return;
            }
        }
        // Check Weapon
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+(?:([0-9]+ [LST])(?:\s*\/\s*[0-9]+ [LST])?)\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+([0-9+\-W]+)\s+([0-9]+)\s+((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|\+){3})\s+(((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|) [0-9],?\s*)*|–)\s+([^]+)/)) {
            this.importWeapon(rawData);
            return;
        }

        // Check multiple Armor
        test = rawData.match(/(.*?) +(Dorf|Kleinstadt|Großstadt|Metropole) +([0-9]+ [LST]) +([0-9]+) +([0-9]+) +([UGFMA]) +(\+[0-9]+) +([0-9]+) +([0-9]+) +([0-9]+) +([0-9]+) +(.+)/g);
        if (test) {
            if (test.length > 1) {
                let folder = await this._folderDialog();
                test.forEach(m => {
                    this.importArmor(m, folder)
                });
                return;
            }
        }

        // Check Armor
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([^]+)/)) {
            this.importArmor(rawData);
            return;
        }

        // Check multiple Shield
        test = rawData.match(/(.*?) +(Dorf|Kleinstadt|Großstadt|Metropole) +([0-9]+ [LST]) +([0-9]+) +([0-9]+) +([UGFMA]) +(\+[0-9]+) +([0-9]+) +([0-9]+) +((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9]) +(.+)/g);
        if (test) {
            if (test.length > 1) {
                let folder = await this._folderDialog();
                test.forEach(m => {
                    this.importShield(m, folder);
                });
                return;
            }
        }

        // Check Shield
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9])\s+([^]+)/)) {
            this.importShield(rawData);
            return;
        }

        // Import NPC
        if (rawData.includes("Fertigkeiten:")) {
            this.importNpc(rawData);
            return;
        }

        // Import Strengths
        if (rawData.match(/^(.*) \(([0-9])(\*?)\): .*/gm)) {
            this.importStrengths(rawData);
            return;
        }

        // Import npcfeature
        if (rawData.match(/^(.*): .*/gm)) {
            this.importNpcFeatures(rawData);
            return;
        }
    }

    static async importNpcFeatures(rawData) {
        let folderList = game.items.directory.folders.reduce((str, folder) => {
            return `${str} <option value="${folder._id}">${folder.name}</option>`;
        }, "");
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: game.i18n.localize("splittermond.selectAFolder"),
                content: `<label>Ordner</label > <select name="folder">
                <option value="">keinen Ordner</option>
            ${folderList}
        </select>`,
                buttons: {
                    ok: {
                        label: game.i18n.localize("splittermond.ok"),
                        callback: html => {
                            resolve(html.find('[name="folder"]')[0].value);
                        }
                    }
                }
            });
            dialog.render(true);
        });

        let folder = await p;

        rawData.match(/^(.*): .*/gm).forEach((m) => {
            let token = m.match(/(.*):/);

            let itemData = {
                type: "npcfeature",
                name: token[1].trim(),
                folder: folder,
                data: {
                    modifier: CONFIG.splittermond.modifier[token[1].trim().toLowerCase()] || ""
                }
            }
            let escapeStr = token[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let descriptionData = rawData.match(new RegExp(`${escapeStr} ([^]+?)(?=^.*:)`, "m"));
            if (descriptionData === null) {
                descriptionData = rawData.match(new RegExp(`${escapeStr} ([^]+)`));
            }
            itemData.data.description = descriptionData[1].replace("\n", "").replace("", "");

            Item.create(itemData);

            console.log(itemData);
        });
    }

    static async importStrengths(rawData) {
        let folderList = game.items.directory.folders.reduce((str, folder) => {
            return `${str} <option value="${folder._id}">${folder.name}</option>`;
        }, "");
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: game.i18n.localize("splittermond.selectAFolder"),
                content: `<label>Ordner</label > <select name="folder">
                <option value="">keinen Ordner</option>
            ${folderList}
        </select>`,
                buttons: {
                    ok: {
                        label: game.i18n.localize("splittermond.ok"),
                        callback: html => {
                            resolve(html.find('[name="folder"]')[0].value);
                        }
                    }
                }
            });
            dialog.render(true);
        });

        let folder = await p;
        rawData.match(/^(.*) \(([0-9])(\*?)\): .*/gm).forEach((m) => {
            let token = m.match(/(.*) \(([0-9])(\*?)\):/);
            let itemData = {
                type: "strength",
                name: token[1].trim(),
                folder: folder,
                data: {
                    quantity: 1,
                    level: parseInt(token[2]),
                    onCreationOnly: token[3] === "*",
                    modifier: CONFIG.splittermond.modifier[token[1].trim().toLowerCase()] || ""
                }
            }
            let escapeStr = token[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            let descriptionData = rawData.match(new RegExp(`${escapeStr} ([^]+?)(?=^.* \\([0-9]\\*?\\):)`, "m"));
            if (descriptionData === null) {
                descriptionData = rawData.match(new RegExp(`${escapeStr} ([^]+)`));
            }
            itemData.data.description = descriptionData[1].replace("\n", "").replace("", "");

            Item.create(itemData);

            console.log(itemData);
        })
    }

    static async importShield(rawData, folder = "") {
        rawData = rawData.replace(/\n/g, " ");
        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9])\s+(.+)/);

        let itemData = {
            type: "shield",
            name: tokens[1].trim(),
            folder: folder,
            img: CONFIG.splittermond.icons.shield[tokens[1].trim()] || CONFIG.splittermond.icons.shield.default,
            data: {}
        };

        switch (tokens[2].trim()) {
            case "Metropole":
                itemData.data.availability = "metropolis";
                break;
            case "Kleinstadt":
                itemData.data.availability = "town";
                break;
            case "Großstadt":
                itemData.data.availability = "city";
                break;
            case "Dorf":
            default:
                itemData.data.availability = "village";
                break;
        }

        itemData.data.price = tokens[3].trim();

        itemData.data.weight = parseInt(tokens[4]);
        itemData.data.hardness = parseInt(tokens[5]);
        itemData.data.complexity = tokens[6].trim();
        itemData.data.defenseBonus = tokens[7].trim();
        itemData.data.handicap = parseInt(tokens[8]);
        itemData.data.tickMalus = parseInt(tokens[9]);
        itemData.data.minAttributes = tokens[10];
        itemData.data.features = tokens[11];

        Item.create(itemData);

        console.log(itemData);
    }

    static async importArmor(rawData, folder = "") {
        rawData = rawData.replace(/\n/g, " ");

        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+(.+)/)

        let itemData = {
            type: "armor",
            name: tokens[1].trim(),
            folder: folder,
            img: CONFIG.splittermond.icons.armor[tokens[1].trim()] || CONFIG.splittermond.icons.armor.default,
            data: {}
        };

        switch (tokens[2].trim()) {
            case "Metropole":
                itemData.data.availability = "metropolis";
                break;
            case "Kleinstadt":
                itemData.data.availability = "town";
                break;
            case "Großstadt":
                itemData.data.availability = "city";
                break;
            case "Dorf":
            default:
                itemData.data.availability = "village";
                break;
        }

        itemData.data.price = tokens[3].trim();

        itemData.data.weight = parseInt(tokens[4]);
        itemData.data.hardness = parseInt(tokens[5]);
        itemData.data.complexity = tokens[6].trim();
        itemData.data.defenseBonus = tokens[7].trim();
        itemData.data.damageReduction = parseInt(tokens[8]);
        itemData.data.handicap = parseInt(tokens[9]);
        itemData.data.tickMalus = parseInt(tokens[10]);
        itemData.data.minStr = parseInt(tokens[11]);
        itemData.data.features = tokens[12].trim();

        Item.create(itemData);

        console.log(itemData);
    }

    static async importWeapon(rawData, skill = "", folder = "") {
        rawData = rawData.replace(/\n/g, " ");
        if (skill === "") {
            let optionsList = CONFIG.splittermond.skillGroups.fighting.reduce((str, skill) => {
                let skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
                return `${str} <option value="${skill}">${skillLabel}</option>`;
            }, "");
            let p = new Promise((resolve, reject) => {
                let dialog = new Dialog({
                    title: "Waffenimport",
                    content: `<labe >Kampffertigkeit</label > <select name="skill">
            ${optionsList}
        </select>`,
                    buttons: {
                        ok: {
                            label: game.i18n.localize("splittermond.ok"),
                            callback: html => {
                                resolve(html.find('[name="skill"]')[0].value);
                            }
                        }
                    }
                });
                dialog.render(true);
            });

            skill = await p;
        }


        let isRanged = ["throwing", "longrange"].includes(skill);

        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+(?:([0-9]+ [LST])(?:\s*\/\s*[0-9]+ [LST])?)\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+([0-9+\-W]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|\+){3})\s+((?:(?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9],?\s*)*|–)\s+(.+)/);

        let itemData = {
            type: "weapon",
            name: tokens[1].trim(),
            img: CONFIG.splittermond.icons.weapon[tokens[1].trim()] || CONFIG.splittermond.icons.weapon.default,
            folder: folder,
            data: {}
        };

        itemData.data.skill = skill;
        switch (tokens[2].trim()) {
            case "Metropole":
                itemData.data.availability = "metropolis";
                break;
            case "Kleinstadt":
                itemData.data.availability = "town";
                break;
            case "Großstadt":
                itemData.data.availability = "city";
                break;
            case "Dorf":
            default:
                itemData.data.availability = "village";
                break;
        }

        itemData.data.price = tokens[3].trim();

        itemData.data.weight = parseInt(tokens[4]);
        itemData.data.hardness = parseInt(tokens[5]);
        itemData.data.complexity = tokens[6].trim();
        itemData.data.damage = tokens[7].trim();
        itemData.data.weaponSpeed = parseInt(tokens[8]);
        let attributes = tokens[9].split("+").map((i) => {
            switch (i) {
                case "AUS":
                    return "charisma";
                case "BEW":
                    return "agility";
                case "INT":
                    return "intuition";
                case "KON":
                    return "constitution";
                case "MYS":
                    return "mystic";
                case "STÄ":
                    return "strength";
                case "VER":
                    return "mind";
                case "WIL":
                    return "willpower";
            }
        });

        itemData.data.attribute1 = attributes[0];
        itemData.data.attribute2 = attributes[1];

        itemData.data.minAttributes = tokens[10].trim();

        if (isRanged) {
            let temp = tokens[11].match(/(.+)\s+([0-9]+)/);
            itemData.data.range = temp[2];
            tokens[11] = temp[1];
        } else {
            itemData.data.range = 0;
        }

        itemData.data.features = tokens[11].split(",").map((i) => {
            let temp = i.match(/([^(]*)\s?\(?([0-9]*)\)?/);
            if (temp[2]) {
                return temp[1] + " " + temp[2];
            } else {
                return temp[1];
            }

        }).join(", ");

        Item.create(itemData);

        console.log(itemData);

    }

    static async importSpell(rawData) {
        let spellData = {
            type: "spell",
            name: "",
            img: CONFIG.splittermond.icons.spell.default,
            data: {}
        };
        let nameData = rawData.match(/([^(]+)\s(\(.*\))/);
        spellData.name = `${nameData[1]} ${nameData[2]} `;

        let skillsData = rawData.match(/Schulen: ([^:]+?)\n[^ ]+:/);
        spellData.data.availableIn = skillsData[1].split(",").map(s => {
            let data = s.match(/([^ ]+)\s([0-5])/);
            let skill = CONFIG.splittermond.skillGroups.magic.find(i => game.i18n.localize(`splittermond.skillLabel.${i} `).toLowerCase().startsWith(data[1].toLowerCase()));
            spellData.data.skill = skill;
            spellData.data.skillLevel = parseInt(data[2]);
            return `${skill} ${data[2]} `;
        }).join(", ");

        let typeData = rawData.match(/Typus: ([^:]+?)\n[^ ]+:/);
        spellData.data.spellType = typeData[1];

        let difficultyData = rawData.match(/Schwierigkeit: ([^:]+?)\n[^ ]+:/);
        spellData.data.difficulty = difficultyData[1];

        if (spellData.data.difficulty.search("Geistiger Widerstand") >= 0 ||
            spellData.data.difficulty.search("Geist") >= 0) {
            spellData.data.difficulty = "GW";
        }

        if (spellData.data.difficulty.search("Körperlicher Widerstand") >= 0 ||
            spellData.data.difficulty.search("Körper") >= 0) {
            spellData.data.difficulty = "KW";
        }

        if (spellData.data.difficulty.search("Verteidigung") >= 0) {
            spellData.data.difficulty = "VTD";
        }

        let costsData = rawData.match(/Kosten: ([^:]+?)\n[^ ]+:/);
        spellData.data.costs = costsData[1];

        let castDurationData = rawData.match(/Zauberdauer: ([^:]+?)\n[^ ]+:/);
        spellData.data.castDuration = castDurationData[1];

        let descriptionData = rawData.match(/Wirkung: ([^]+?)\n[^ ]+:/);
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
        spellData.data.enhancementCosts = `${enhancementData[1]} /${enhancementData[2]}`;
        spellData.data.enhancementDescription = enhancementData[3].replace(/\n/g, " ");
        spellData.data.enhancementDescription = spellData.data.enhancementDescription.replace(/  /g, " ");
        spellData.data.degreeOfSuccessOptions = {
            castDuration: egData[1].search("Auslösezeit") >= 0,
            consumedFocus: egData[1].search("Verzehrter") >= 0,
            exhaustedFocus: egData[1].search("Erschöpfter") >= 0,
            channelizedFocus: egData[1].search("Kanalisierter") >= 0,
            effectDuration: egData[1].search("Wirkungsd") >= 0 || egData[1].search("dauer") >= 0,
            damage: egData[1].search("Schaden,") >= 0,
            range: egData[1].search("Reichw") >= 0,
            effectArea: egData[1].search("Wirkungsb") >= 0 || egData[1].search("bereich") >= 0
        }

        let damage = /([0-9]*[wWdD][0-9]{1,2}[ \-+0-9]*)/.exec(spellData.data.description);
        if (damage) {
            spellData.data.damage = damage[0] || "";
        }



        Item.create(spellData);

        console.log(spellData);
    }

    static async importNpc(rawData) {
        let clipboard = rawData;
        clipboard = clipboard.replace(/\r\n/g, "\n");
        let stats = clipboard;
        let name = "";
        let description = "";
        if (!(clipboard.startsWith("AUS") || clipboard.startsWith("GK") || clipboard.startsWith("waffen"))) {
            let temp = clipboard.match(/([^]+?)\n([^]*?)(AUS BEW[^]+|GK GSW[^]+|Waffen\s+Wert\s+Schaden\s+WGS[^]+|Wichtige Attribute:[^]+)/);
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
                        let name = html.find('[name="name"]')[0].value;
                        let description = html.find('[name="description"]')[0].value;
                        let parsedData = /AUS BEW INT KON MYS STÄ VER WIL\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)/.exec(importData);
                        let AUS = 0;
                        let BEW = 0;
                        let INT = 0;
                        let KON = 0;
                        let MYS = 0;
                        let STÄ = 0;
                        let VER = 0;
                        let WIL = 0;
                        if (parsedData) {
                            AUS = parseInt(parsedData[1]);
                            BEW = parseInt(parsedData[2]);
                            INT = parseInt(parsedData[3]);
                            KON = parseInt(parsedData[4]);
                            MYS = parseInt(parsedData[5]);
                            STÄ = parseInt(parsedData[6]);
                            VER = parseInt(parsedData[7]);
                            WIL = parseInt(parsedData[8]);
                        }

                        let importantAttributesData = importData.match(/Wichtige Attribute: ([^:]+)[^\s]:/);
                        if (importantAttributesData) {
                            importantAttributesData[1].split(",").forEach((i) => {
                                let iData = i.trim().split(" ");
                                switch (iData[0]) {
                                    case "AUS":
                                        AUS = parseInt(iData[1]);
                                        break;
                                    case "BEW":
                                        BEW = parseInt(iData[1]);
                                        break;
                                    case "INT":
                                        INT = parseInt(iData[1]);
                                        break;
                                    case "KON":
                                        KON = parseInt(iData[1]);
                                        break;
                                    case "MYS":
                                        MYS = parseInt(iData[1]);
                                        break;
                                    case "STÄ":
                                        STÄ = parseInt(iData[1]);
                                        break;
                                    case "VER":
                                        VER = parseInt(iData[1]);
                                        break;
                                    case "WILL":
                                    case "WIL":
                                        VER = parseInt(iData[1]);
                                        break;
                                }
                            })
                        }

                        parsedData = /GK GSW LP FO VTD SR KW GW\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)\s*([0-9]+)/.exec(importData);
                        let GK = 0;
                        let GSW = 0;
                        let LP = 0;
                        let FO = 0;
                        let VTD = 0;
                        let KW = 0;
                        let GW = 0;
                        let INI = 0;
                        let SR = 0;
                        if (parsedData) {
                            GK = parseInt(parsedData[1]);
                            GSW = parseInt(parsedData[2]);
                            LP = parseInt(parsedData[3]);
                            FO = parseInt(parsedData[4]);
                            VTD = parseInt(parsedData[5]);
                            SR = parseInt(parsedData[6]);
                            KW = parseInt(parsedData[7]);
                            GW = parseInt(parsedData[8]);
                        }


                        let importantDerivedValuesData = importData.match(/Wichtige abgeleitete Werte: ([^:]+)[^\s]:/);
                        if (importantDerivedValuesData) {
                            importantDerivedValuesData[1].split(",").forEach((i) => {
                                let iData = i.trim().split(" ");
                                switch (iData[0]) {
                                    case "GK":
                                        GK = parseInt(iData[1]);
                                        break;
                                    case "GSW":
                                        GSW = parseInt(iData[1]);
                                        break;
                                    case "LP":
                                        LP = parseInt(iData[1]);
                                        break;
                                    case "FO":
                                        FO = parseInt(iData[1]);
                                        break;
                                    case "VTD":
                                        VTD = parseInt(iData[1]);
                                        break;
                                    case "SR":
                                        SR = parseInt(iData[1]);
                                        break;
                                    case "KW":
                                        KW = parseInt(iData[1]);
                                        break;
                                    case "GW":
                                        GW = parseInt(iData[1]);
                                        break;
                                }
                            })
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

                        let attributes = {
                            "charisma": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": AUS
                            },
                            "agility": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": BEW
                            },
                            "intuition": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": INT
                            },
                            "constitution": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": KON
                            },
                            "mystic": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": MYS
                            },
                            "strength": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": STÄ
                            },
                            "mind": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": VER
                            },
                            "willpower": {
                                "species": 0,
                                "initial": 0,
                                "advances": 0,
                                "value": WIL
                            }
                        };

                        Object.keys(skillObj).forEach(skill => {
                            if (CONFIG.splittermond.skillAttributes[skill]) {
                                skillObj[skill].points = skillObj[skill].value;
                                skillObj[skill].points -= parseInt(attributes[CONFIG.splittermond.skillAttributes[skill][0]].value) || 0;
                                skillObj[skill].points -= parseInt(attributes[CONFIG.splittermond.skillAttributes[skill][1]].value) || 0;
                            }
                        });


                        let weaponData = /(Waffen Wert Schaden WGS.*)\n([^]*?)\n[^\s]+:/g.exec(importData);
                        let weapons = [];
                        if (weaponData) {
                            if (weaponData[1].match(/Reichw/)) {
                                weaponData[2].match(/.*\s+[0-9]+\s+[0-9W\-+]+\s+[0-9]+\s+Tick[s]?\s+[0-9\-]+\-1?W6\s+[0-9\-–]*\s+.*/g).forEach(weaponStr => {
                                    let weaponDataRaw = weaponStr.match(/(.*)\s+([0-9]+)\s+([0-9W\-+]+)\s+([0-9]+) Tick[s]?\s+([0-9\-]+)\-1?W6\s+([0-9\-–]*)\s+(.*)/);
                                    INI = parseInt(weaponDataRaw[5].trim()) || 0;
                                    let weaponName = weaponDataRaw[1].trim();
                                    let weaponData = SplittermondCompendium.findItem("weapon", weaponName) || {
                                        type: "weapon",
                                        name: weaponName,
                                        img: CONFIG.splittermond.icons.weapon[weaponName] || CONFIG.splittermond.icons.weapon.default,
                                        data: {}
                                    }
                                    weaponData.data.damage = weaponDataRaw[3].trim();
                                    weaponData.data.weaponSpeed = parseInt(weaponDataRaw[4].trim()) || 0;
                                    weaponData.data.range = parseInt(weaponDataRaw[6].trim()) || 0;
                                    weaponData.data.features = weaponDataRaw[7].trim();
                                    if (!weaponData.data.skill) {
                                        weaponData.data.skill = "melee";
                                        weaponData.data.attribute1 = "agility";
                                        weaponData.data.attribute2 = "strength";
                                    }
                                    if (!skillObj[weaponData.data.skill]) {
                                        let val = parseInt(weaponDataRaw[2]) || 0;
                                        skillObj[weaponData.data.skill] = {
                                            value: val,
                                            points: val - attributes[weaponData.data.attribute1].value - attributes[weaponData.data.attribute2].value
                                        };
                                    }
                                    weapons.push(weaponData)
                                });
                            } else {
                                weaponData[2].match(/.*\s+[0-9]+\s+[0-9W\-+]+\s+[0-9]+ Tick[s]?\s+[0-9\-–]+\-1?W6\s+.*/g).forEach(weaponStr => {
                                    let weaponDataRaw = weaponStr.match(/(.*)\s+([0-9]+)\s+([0-9W\-+]+)\s+([0-9]+)\s+Tick[s]?\s+([0-9\-–]+)\-1?W6\s+(.*)/);
                                    INI = parseInt(weaponDataRaw[5].trim()) || 0;
                                    let weaponName = weaponDataRaw[1].trim();
                                    let weaponData = SplittermondCompendium.findItem("weapon", weaponName) || {
                                        type: "weapon",
                                        name: weaponName,
                                        img: CONFIG.splittermond.icons.weapon[weaponName] || CONFIG.splittermond.icons.weapon.default,
                                        data: {}
                                    }
                                    weaponData.data.damage = weaponDataRaw[3].trim();
                                    weaponData.data.weaponSpeed = parseInt(weaponDataRaw[4].trim()) || 0;
                                    weaponData.data.range = 0;
                                    weaponData.data.features = weaponDataRaw[6].trim();
                                    if (!weaponData.data.skill) {
                                        weaponData.data.skill = "melee";
                                        weaponData.data.attribute1 = "agility";
                                        weaponData.data.attribute2 = "strength";
                                    }
                                    let val = parseInt(weaponDataRaw[2]) || 0;
                                    skillObj[weaponData.data.skill] = {
                                        value: val,
                                        points: val - attributes[weaponData.data.attribute1].value - attributes[weaponData.data.attribute2].value
                                    };
                                    weapons.push(weaponData);
                                });
                            }
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
                                        let masteryName = masteryStr.trim();
                                        let masteryData = SplittermondCompendium.findItem("mastery", masteryName) || {
                                            type: "mastery",
                                            name: masteryName,
                                            data: {}
                                        };
                                        masteryData.data.skill = skill;
                                        masteryData.data.level = level;
                                        masteries.push(masteryData)
                                    }

                                });
                            })
                        }

                        let featuresData = /Merkmale: ([^]*)(?:\nBeute:)/g.exec(importData);
                        if (featuresData === null) {
                            featuresData = /Merkmale: (.*)/g.exec(importData);
                        }
                        let features = [];
                        if (featuresData) {
                            featuresData[1].split(/,/).forEach(f => {
                                if (f.trim()) {
                                    let featureName = f.trim();
                                    let featureData = SplittermondCompendium.findItem("npcfeature", featureName) || {
                                        type: "npcfeature",
                                        name: featureName,
                                        data: {}
                                    };
                                    features.push(featureData);
                                }

                            });
                        }


                        let typeData = /Typus: ([^:]*)\n[^:\s]+:/g.exec(importData);
                        let type = "";
                        if (typeData) {
                            type = typeData[1];
                        }

                        let levelData = /Monstergrad: ([^:]*?)\n?[^:\s]+:/g.exec(importData);
                        let level = "";
                        if (levelData) {
                            level = levelData[1];
                        }

                        let spellsData = /Zauber: ([^]*?)\n?(Meisterschaften|Merkmale|Beute):/g.exec(importData);
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
                                    let spellName = s.trim().replace(/\n/, " ");
                                    let spellData = SplittermondCompendium.findItem("spell", spellName) || {
                                        type: "spell",
                                        name: spellName,
                                        data: {}
                                    };
                                    spellData.data.skill = skill;
                                    spellData.data.skillLevel = level;
                                    spells.push(spellData);
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





                        return Actor.create({
                            name: name,
                            type: "npc",
                            data: {
                                biography: description,
                                type: type,
                                level: level,
                                attributes: attributes,
                                damageReduction: {
                                    value: SR
                                },
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
}