import * as Tooltip from './tooltip.js';

export async function prepareCheckMessageData(actor, rollMode, roll, data) {
    let templateContext = {
        ...data,
        roll: roll,
        rollMode: rollMode,
        tooltip: await roll.getTooltip(),
        actions: []
    };

    let template = "systems/splittermond/templates/chat/skill-check.hbs";

    let flagsData = data;

    let formula = new Tooltip.TooltipFormula();

    Object.keys(data.skillAttributes).forEach(key => {
        formula.addPart(data.skillAttributes[key], game.i18n.localize(`splittermond.attribute.${key}.short`));
        formula.addOperator("+");
    })

    formula.addPart(data.skillPoints, game.i18n.localize(`splittermond.skillPointsAbbrev`));
    data.modifierElements.forEach(e => {
        let val = Math.abs(e.value);
        if (e.value > 0) {
            formula.addBonus("+"+val, e.description);
        } else {
            formula.addMalus("-"+val, e.description);
        }
    });


    templateContext.tooltip = $(templateContext.tooltip).prepend(`
        <section class="tooltip-part">
        <p>${formula.render()}</p>
        </section>`).wrapAll('<div>').parent().html();

    templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.${data.succeeded ? "success" : "fail"}Message.${Math.min(Math.abs(data.degreeOfSuccess), 5)}`);
    if (data.isCrit) {
        templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.critical`);
    }
    if (data.isFumble) {
        templateContext.degreeOfSuccessMessage = game.i18n.localize(`splittermond.fumble`);
    }

    templateContext.title = game.i18n.localize(`splittermond.skillLabel.${data.skill}`);
    templateContext.rollType = game.i18n.localize(`splittermond.rollType.${data.rollType}`);

    switch (data.type) {
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

            let focusCosts = data.spell.costs;

            if (data.succeeded) {
                if (data.degreeOfSuccess > 0) {
                    templateContext.degreeOfSuccessDescription = "<h3>" + game.i18n.localize(`splittermond.degreeOfSuccessOptionsHeader`) + "</h3>";
                    if (data.degreeOfSuccess >= 5) {
                        templateContext.degreeOfSuccessDescription = "<p>" + game.i18n.localize(`splittermond.spellCheckResultDescription.outstanding`) + "</p>";
                    }
                    templateContext.degreeOfSuccessDescription += "<ul>";
                    if (data.spell.degreeOfSuccessOptions?.castDuration) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.castDuration`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.exhaustedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.exhaustedFocus`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.channelizedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>2 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.channelizedFocus`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.range) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.range`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.damage) {
                        templateContext.degreeOfSuccessDescription += "<li>1 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.damage`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.consumedFocus) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.consumedFocus`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.effectArea) {
                        templateContext.degreeOfSuccessDescription += "<li>3 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectArea`) + "</li>";
                    }
                    if (data.spell.degreeOfSuccessOptions?.effectDuration) {
                        templateContext.degreeOfSuccessDescription += "<li>2 EG: " + game.i18n.localize(`splittermond.degreeOfSuccessOptions.effectDuration`) + "</li>";
                    }
                    templateContext.degreeOfSuccessDescription += `<li>${data.spell.enhancementCosts}: ${data.spell.enhancementDescription}</li>`;
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

            if (data.spell.damage && data.succeeded) {
                let difficulty = (data.spell.difficulty + "").trim().toUpperCase();
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
                    name: game.i18n.localize(`splittermond.damage`) + " (" + data.spell.damage + ")",
                    icon: "fa-heart-broken",
                    classes: "rollable",
                    data: {
                        "roll-type": "damage",
                        damage: data.spell.damage,
                        features: data.spell.features,
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

            let enhancementEG = data.spell.enhancementCosts.match("([0-9]+)[ ]*EG");
            if (enhancementEG) {
                enhancementEG = parseInt(enhancementEG[1]);
            } else {
                enhancementEG = 1;
            }

            if (data.degreeOfSuccess >= enhancementEG) {
                var enhancementCosts = data.spell.enhancementCosts;
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

            if (data.isFumble || data.degreeOfSuccess <= -5) {
                templateContext.actions.push({
                    name: game.i18n.localize("splittermond.fumbleTableLabel"),
                    icon: "fa-dice",
                    classes: "rollable",
                    data: {
                        "roll-type": "magicFumble",
                        success: -data.degreeOfSuccess,
                        costs: data.spell.costs
                    }
                });
            }

            templateContext.tooltip = $(templateContext.tooltip).append(`
                <section class="tooltip-part">
                <p>${data.spell.description}</p>
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
                    message: game.i18n.localize(`splittermond.activeDefense`) + " (" + game.i18n.localize(`splittermond.derivedAttribute.${data.defenseType}.short`) + "): " + templateContext.title
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

export async function prepareStatusEffectMessage(actor, data) {
    let template = "systems/splittermond/templates/chat/status-effect.hbs";
    let templateContext = {
        ...data,
        actions: [],
        title: `${data.virtualToken.name} ${data.virtualToken.level}`,
        subtitle: game.i18n.format("splittermond.combatEffect.statusEffectActivated.subtitle", {
            onTick: data.onTick,
            activationNo: data.activationNo,
            maxActivation: data.virtualToken.times
        })
    };

    if (data.activationNo == data.virtualToken.times) {
        templateContext.actions.push({
            name: game.i18n.localize(`splittermond.combatEffect.statusEffectActivated.remove`),
            icon: "fa-remove",
            classes: "remove-status",
            data: {
                "status-id": data.virtualToken.statusId
            }
        });
    }

    //TODO add actions based on the status effect to allow per-button execution for effect

    let statusEffectData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: await renderTemplate(template, templateContext),
        sound: CONFIG.sounds.notification,
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
    };
    return statusEffectData;
}