/**
 * @typedef {{type: string,
 *             skill: string
 *             skillValue: number
 *             skillPoints: number
 *             skillAttributes: Attribute[]
 *             difficulty: number
 *             rollType: checkData.rollType,
 *             modifierElements: checkData.modifierElements,
 *             succeeded: boolean
 *             isFumble: boolean
 *             isCrit: boolean
 *             degreeOfSuccess: number,
 *             availableSplinterpoints: number,
 *             hideDifficulty: hideDifficulty,
 *             maneuvers: string[],
 *         }} CheckMessageData
 */

import {parseCostString, parseSpellEnhancementDegreesOfSuccess} from "./costs/costParser.ts";

/**
 * @param {CheckMessageData} data
 */
export function prepareSpellRollMessage(templateContext, data) {
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
            templateContext.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.devastating`, {eg: -data.degreeOfSuccess - 2}) + "</strong></p>";
        } else if (data.degreeOfSuccess <= -1) {
            templateContext.degreeOfSuccessDescription = "<p><strong>" + game.i18n.format(`splittermond.spellCheckResultDescription.failed`, {eg: -data.degreeOfSuccess}) + "</strong></p>";
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
    if (focusCosts !== 0) {
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
                costs: data.spell.costs,
                skill: data.spell.skill.id
            }
        });
    }

    templateContext.tooltip = $(templateContext.tooltip).append(`
                <section class="tooltip-part">
                <p>${data.spell.description}</p>
                </section>
                `).wrapAll('<div>').parent().html();
}
