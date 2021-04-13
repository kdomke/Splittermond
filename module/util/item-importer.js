export default class ItemImporter {

    static pasteEventhandler(e) {
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
            importSpell(rawData);
        }

        // Check Weapon
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+(?:([0-9]+ [LST])(?:\s*\/\s*[0-9]+ [LST])?)\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+([0-9+\-W]+)\s+([0-9]+)\s+((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|\+){3})\s+(((AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|) [0-9],?\s*)*)\s+([^]+)/)) {
            this.importWeapon(rawData);
        }

        // Check Armor
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([^]+)/)) {
            this.importArmor(rawData);
        }

        // Check Shield
        if (rawData.match(/([^]*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9])\s+([^]+)/)) {
            this.importShield(rawData);
        }
    }

    static async importShield(rawData) {
        rawData = rawData.replace(/\n/g, " ");
        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9])\s+(.+)/);

        let itemData = {
            type: "shield",
            name: tokens[1].trim(),
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

    static async importArmor(rawData) {
        rawData = rawData.replace(/\n/g, " ");

        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+([0-9]+ [LST])\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+(\+[0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+([0-9]+)\s+(.+)/)

        let itemData = {
            type: "armor",
            name: tokens[1].trim(),
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

    static async importWeapon(rawData) {
        rawData = rawData.replace(/\n/g, " ");

        let optionsList = CONFIG.splittermond.skillGroups.fighting.reduce((str, skill) => {
            let skillLabel = game.i18n.localize(`splittermond.skillLabel.${skill}`);
            return `${str}<option value="${skill}">${skillLabel}</option>`;
        }, "");
        let p = new Promise((resolve, reject) => {
            let dialog = new Dialog({
                title: "Waffenimport",
                content: `<label>Kampffertigkeit</label> <select name="skill">
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

        let skill = await p;

        let isRanged = ["throwing", "longrange"].includes(skill);

        let tokens = rawData.match(/(.*)\s+(Dorf|Kleinstadt|Großstadt|Metropole)\s+(?:([0-9]+ [LST])(?:\s*\/\s*[0-9]+ [LST])?)\s+([0-9]+)\s+([0-9]+)\s+([UGFMA])\s+([0-9+\-W]+)\s+([0-9]+)\s+((?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL|\+){3})\s+((?:(?:AUS|BEW|INT|KON|MYS|STÄ|VER|WIL) [0-9],?\s*)*)\s+(.+)/);

        let itemData = {
            type: "weapon",
            name: tokens[1].trim(),
            img: CONFIG.splittermond.icons.weapon[tokens[1].trim()] || CONFIG.splittermond.icons.weapon.default,
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
        spellData.data.enhancementCosts = `${enhancementData[1]}/${enhancementData[2]}`;
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
}