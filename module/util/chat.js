export async function prepareCheckMessageData(actor, rollMode, roll, data) {
    let templateContext = {...data,
        roll: roll,
        rollMode: rollMode,
        tooltip: await roll.getTooltip(),
        actions: []
    };

    let template = "systems/splittermond/templates/chat/skill-check.hbs";

    let flagsData = data;

    let additionalTooltip = '<span class="formula">';
    additionalTooltip = Object.keys(data.skillAttributes).reduce((p, key) => 
        p + `<span class="formula-part"><span class="value">${data.skillAttributes[key]}</span>
                    <span class="description">` + game.i18n.localize(`splittermond.attribute.${key}.short`) + `</span></span>
                    <span class="operator">+</span>` , additionalTooltip);

    additionalTooltip += `<span class="formula-part"><span class="value">${data.skillPoints}</span>
                    <span class="description">` + game.i18n.localize(`splittermond.skillPointsAbbrev`) + `</span></span>`

    data.modifierElements.forEach(e => {
        let val = e.value;
        let cls = "malus";
        if (val > 0) {
            val = "+" + val;
            cls = "bonus";
        }

        additionalTooltip += `<span class="formula-part ${cls}"><span class="value">${val}</span>
                    <span class="description">${e.description}</span></span>`
    });

    additionalTooltip += '</span>';
    templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${additionalTooltip}</p>
        </section>`).wrapAll('<div>').parent().html();

    templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.${data.succeeded ? "success" : "fail"}Message.${Math.min(Math.abs(data.degreeOfSuccess), 5)}`);
    if (data.isCrit) {
        templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.critical`);
    }
    if (data.isFumble) {
        templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.fumble`);
    }

    templateContext.title = game.i18n.localize(`splittermond.skillLabel.${data.skill}`);
    templateContext.rollType =  game.i18n.localize(`splittermond.rollType.${data.rollType}`);

    switch(data.type) {
        case "attack":
            templateContext.title = data.weapon.name;
            templateContext.img = data.weapon.img;
            let ticks = ["longrange", "throwing"].includes(data.weapon.skillId) ? 3 : data.weapon.weaponSpeed;
            if (data.succeeded) {
                templateContext.actions.push({
                    name: `${game.i18n.localize("splittermond.activeDefense")} (${game.i18n.localize("splittermond.derivedAttribute.defense.short")})`,
                    icon: "fa-shield-alt",
                    classes: "active-defense",
                    data: {
                        type: "defense"
                    }
                });
    
                templateContext.actions.push({
                    name: game.i18n.localize(`splittermond.damage`) + " (" + data.weapon.damage + ")",
                    icon: "fa-heart-broken",
                    classes: "rollable",
                    data: {
                        "roll-type": "damage",
                        damage: data.weapon.damage,
                        features: data.weapon.features,
                        source: data.weapon.name
                    }
                });
            }
    
            if (data.isFumble || data.degreeOfSuccess <= -5) {
                templateContext.actions.push({
                    name: game.i18n.localize("splittermond.fumbleTableLabel"),
                    icon: "fa-dice",
                    classes: "rollable",
                    data: {
                        "roll-type": "attackFumble"
                    }
                });
            }
    
            templateContext.actions.push({
                name: `${ticks} ` + game.i18n.localize(`splittermond.ticks`),
                icon: "fa-stopwatch",
                classes: "add-tick",
                data: {
                    ticks: ticks,
                    message: data.weapon.name
                }
            });
            break;
        case "spell":
            templateContext.title = data.spell.name;
            templateContext.img = data.spell.img;

            let focusCosts = data.spell.data.costs;

            if (data.succeeded) {
                if (data.degreeOfSuccess > 0) {
                    templateContext.degreeOfSuccessDescription = "<h3>" + game.i18n.localize(`splittermond.degreeOfSuccessOptionsHeader`) + "</h3>";
                    if (data.degreeOfSuccess >= 5) {
                        templateContext.degreeOfSuccessDescription = "<p>" + game.i18n.localize(`splittermond.spellCheckResultDescription.outstanding`) + "</p>";
                    }
                    templateContext.degreeOfSuccessDescription += "<ul>";
                    if (data.spell.data.degreeOfSuccessOptions.castDuration) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.castDuration`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.exhaustedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.exhaustedFocus`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.channelizedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>2 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.channelizedFocus`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.range) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.range`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.damage) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.damage`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.consumedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.consumedFocus`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.effectArea) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectArea`) + "</li>";
                    }
                    if (data.spell.data.degreeOfSuccessOptions.effectDuration) {
                        templateContext.degreeOfSuccessDescription += "<li>2 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectDuration`) + "</li>";
                    }
                    templateContext.degreeOfSuccessDescription += `<li>${data.spell.data.enhancementCosts}: ${data.spell.data.enhancementDescription}</li>`;
                    templateContext.degreeOfSuccessDescription += "</ul>";

                }

            } else {
                if (data.degreeOfSuccess <= -5) {
                    templateContext.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.devastating`, { eg: -data.degreeOfSuccess }) + "</strong></p>";
                } else if (data.degreeOfSuccess <= -1) {
                    templateContext.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.failed`, { eg: -data.degreeOfSuccess }) + "</strong></p>";
                }
                focusCosts = -data.degreeOfSuccess;
            }

            if (data.spell.data.damage && data.succeeded) {
                let difficulty = (data.spell.data.difficulty + "").trim().toUpperCase();
                if (["VTD", "KW", "GW"].includes(difficulty)) {
                    templateContext.actions.push({
                        name: `${game.i18n.localize("splittermond.activeDefense")} (${difficulty})`,
                        icon: "fa-shield-alt",
                        classes: "active-defense",
                        data: {
                            type: difficulty
                        }
                    });
                }


                templateContext.actions.push({
                    name: game.i18n.localize(`splittermond.damage`) + " (" + data.spell.data.damage + ")",
                    icon: "fa-heart-broken",
                    classes: "rollable",
                    data: {
                        "roll-type": "damage",
                        damage: data.spell.data.damage,
                        features: data.spell.data.features,
                        source: data.spell.name
                    }
                });
            }
            if (focusCosts != 0) {
                templateContext.actions.push({
                    name: `${focusCosts} ` + game.i18n.localize(`splittermond.focusCostsAbbrev`),
                    icon: "fa-bullseye",
                    classes: "consume",
                    data: {
                        value: focusCosts,
                        type: "focus",
                        description: data.spell.name
                    }
                });
            }

            let enhancementEG = data.spell.data.enhancementCosts.match("([0-9]+)[ ]*EG");
            if (enhancementEG) {
                enhancementEG = parseInt(enhancementEG[1]);
            } else {
                enhancementEG = 1;
            }

            if (data.degreeOfSuccess >= enhancementEG) {
                var enhancementCosts = data.spell.data.enhancementCosts;
                templateContext.actions.push({
                    name: `${enhancementCosts} ` + game.i18n.localize(`splittermond.enhancementCosts`),
                    icon: "fa-bullseye",
                    classes: "consume",
                    data: {
                        value: enhancementCosts,
                        type: "focus",
                        description: data.spell.name + " - " + game.i18n.localize('splittermond.enhancementCosts')
                    }
                });
            }

            templateContext.actions.push({
                name: `3 ` + game.i18n.localize(`splittermond.ticks`),
                icon: "fa-stopwatch",
                classes: "add-tick",
                data: {
                    ticks: 3,
                    message: data.spell.name
                }
            });

            if (data.isFumble || data.spell.degreeOfSuccess <= -5) {
                templateContext.actions.push({
                    name: game.i18n.localize("splittermond.fumbleTableLabel"),
                    icon: "fa-dice",
                    classes: "rollable",
                    data: {
                        "roll-type": "magicFumble",
                        success: -data.degreeOfSuccess,
                        costs: data.spell.data.costs
                    }
                });
            }

            templateContext.tooltip = $(templateContext.tooltip).append(`
                <section class="tooltip-part">
                <p>${data.spell.data.description}</p>
                </section>
                `).wrapAll('<div>').parent().html();

            break;
        case "defense":
            templateContext.title = data.itemData.name;
            templateContext.img = data.itemData.img;
            templateContext.rollType = game.i18n.localize(`splittermond.activeDefense`) + " | " + game.i18n.localize(`splittermond.rollType.${data.rollType}`);
            let tickCost = 3;
            let defenseValue = data.baseDefense;
            if (data.succeeded) {
                defenseValue = defenseValue + 1 + data.degreeOfSuccess;
    
                let feature = {};
                data.itemData.features?.toLowerCase().split(',').forEach(feat => {
                    let temp = /([^0-9 ]*)[ ]*([0-9]*)/.exec(feat.trim());
                    if (temp[1]) {
                        feature[temp[1]] = parseInt(temp[2] || 1);
                    }
                });
    
                if (feature["defensiv"]) {
                    defenseValue += feature["defensiv"];
                }
    
                templateContext.degreeOfSuccessDescription = "<p style='text-align: center'><strong>" + game.i18n.localize(`splittermond.derivedAttribute.${data.defenseType}.short`) + `: ${defenseValue}</strong></p>`;
    
    
                if (data.degreeOfSuccess >= 5) {
                    templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.outstanding")}</p>`
                    tickCost = 2;
                }
            } else {
    
                if (data.degreeOfSuccess === 0) {
                    defenseValue += 1;
    
                }
                data.degreeOfSuccessDescription = "<p style='text-align: center'><strong>" + game.i18n.localize(`splittermond.derivedAttribute.${data.defenseType}.short`) + `: ${defenseValue}</strong></p>`;
                if (data.degreeOfSuccess === 0) {
                    templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.nearmiss")}</p>`;
                }
                if (data.degreeOfSuccess <= -5) {
                    if (data.itemData._id === "acrobatics") {
                        templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.devastating.acrobatics")}</p>`;
                    } else if (data.itemData._id === "determination") {
                        templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.devastating.determination")}</p>`;
                    } else if (data.itemData._id === "endurance") {
                        templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.devastating.endurance")}</p>`;
                    } else {
                        templateContext.degreeOfSuccessDescription += `<p>${game.i18n.localize("splittermond.defenseResultDescription.devastating.melee")}</p>`;
                        templateContext.actions.push({
                            name: game.i18n.localize("splittermond.fumbleTableLabel"),
                            icon: "fa-dice",
                            classes: "rollable",
                            data: {
                                "roll-type": "attackFumble"
                            }
                        });
                    }
    
                }
    
            }
    
            templateContext.actions.push({
                name: `${tickCost} ` + game.i18n.localize(`splittermond.ticks`),
                icon: "fa-stopwatch",
                classes: "add-tick",
                data: {
                    ticks: tickCost,
                    message: game.i18n.localize(`splittermond.activeDefense`) + " (" + game.i18n.localize(`splittermond.derivedAttribute.${data.defenseType}.short`) + "): " + data.title
                }
            });
    
            break;
    
        default:
            break;
    }

    if (data.availableSplinterpoints > 0 && !data.isFumble) {
        templateContext.actions.push({
            name: game.i18n.localize(`splittermond.splinterpoint`),
            icon: "fa-moon",
            classes: "use-splinterpoint"
        });
    }


    let checkMessageData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        roll: roll,
        content: await renderTemplate(template, templateContext),
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rollMode: rollMode,
        flags: {
            splittermond: {
                check: flagsData
            }
        }
    };

    return checkMessageData;
}