import SplittermondActor from "../actor";
import SplittermondItem from "../../item/item";
import {splittermond} from "../../config";
import {foundryApi} from "../../api/foundryApi";
import {NpcDataModel} from "../dataModel/NpcDataModel";
import {CharacterDataModel} from "../dataModel/CharacterDataModel";
import {SpellCostReductionManager} from "../../util/costs/spellCostManagement";

type Regeneration = { multiplier: number, bonus: number };

interface PreparedSystem {
    spellCostReduction: SpellCostReductionManager,
    spellEnhancedCostReduction: SpellCostReductionManager,
    healthRegeneration: Regeneration,
    focusRegeneration: Regeneration,
}


function asPreparedData<T extends CharacterDataModel | NpcDataModel>(system: T): T & PreparedSystem {
    const qualifies = "healthRegeneration" in system && isRegeneration(system.healthRegeneration) &&
        "focusRegeneration" in system && isRegeneration(system.focusRegeneration) &&
        "spellCostReduction" in system && "spellEnhancedCostReduction" in system;
    if (qualifies) {
        return system as (T & PreparedSystem); //There's not really much chance for error with the type of Spell cost reduction.
    } else {
        throw new Error("System not prepared for modifiers");
    }

}

function isRegeneration(regeneration: unknown): regeneration is Regeneration {
    return !!regeneration && typeof regeneration === "object" && "multiplier" in regeneration && "bonus" in regeneration;
}

//this function is used in item.js to add modifiers to the actor
export function addModifier(actor: SplittermondActor, item: SplittermondItem, name = "", str = "", type = "", multiplier = 1) {
    if (str == ""){
        return;
    }
    const data = asPreparedData(actor.system);
    //const data = actor.system as any;


    str.split(',').forEach(str => {
        str = str.trim();
        let temp = str.match(/(.*)\s+([+\-]?AUS|[+\-]?BEW|[+\-]?INT|[+\-]?KON|[+\-]?MYS|[+\-]?STÄ|[+\-]?VER|[+\-]?WIL|[+\-]?k?[0-9.]+v?[0-9]*)/i);
        if (temp) {
            let modifierLabel = temp[1].trim();
            let value: string | number = temp[2].replace(/AUS/g, actor.attributes.charisma.value + "")
                .replace(/BEW/g, actor.attributes.agility.value + "")
                .replace(/INT/g, actor.attributes.intuition.value + "")
                .replace(/KON/g, actor.attributes.constitution.value + "")
                .replace(/MYS/g, actor.attributes.mystic.value + "")
                .replace(/STÄ/g, actor.attributes.strength.value + "")
                .replace(/VER/g, actor.attributes.mind.value + "")
                .replace(/WIL/g, actor.attributes.willpower.value + "");
            let emphasis = "";
            let modifierLabelParts = modifierLabel.split("/");
            if (modifierLabelParts[1]) {
                modifierLabel = modifierLabelParts[0];
                if (modifierLabelParts[1]) {
                    emphasis = modifierLabelParts[1];
                }
            }

            let addModifierHelper = (path: string, emphasis = "") => {
                var floatValue = parseFloat(`${value}`);
                if (floatValue * multiplier != 0) {
                    if (emphasis) {
                        actor.modifier.add(path, emphasis, floatValue * multiplier, item, type, true);
                    } else {
                        actor.modifier.add(path, name, floatValue * multiplier, item, type, false);
                    }
                }
            }

            switch (modifierLabel.toLowerCase()) {
                case "bonuscap":
                    addModifierHelper("bonuscap");
                    break;
                case "speed.multiplier":
                case "gsw.mult":
                    actor.derivedValues.speed.multiplier *= Math.pow(parseFloat(value), multiplier);
                    break;
                case "sr":
                    addModifierHelper("damagereduction");
                    break;
                case "handicap.shield.mod":
                case "handicap.shield":
                    addModifierHelper("handicap.shield");
                    break;
                case "handicap.mod":
                case "handicap":
                    addModifierHelper("handicap");
                    break;
                case "handicap.armor.mod":
                case "handicap.armor":
                    addModifierHelper("handicap.armor");
                    break;
                case "tickmalus.shield.mod":
                case "tickmalus.shield":
                    addModifierHelper("tickmalus.shield");
                    break;
                case "tickmalus.armor.mod":
                case "tickmalus.armor":
                    addModifierHelper("tickmalus.armor");
                    break;
                case "tickmalus.mod":
                case "tickmalus":
                    addModifierHelper("tickmalus");
                    break;
                case "woundmalus.nbrlevels":
                    data.health.woundMalus.nbrLevels = parseFloat(value) * multiplier;
                    break;
                case "woundmalus.mod":
                    data.health.woundMalus.mod += parseFloat(value) * multiplier;
                    break;
                case "woundmalus.levelmod":
                    data.health.woundMalus.levelMod += parseFloat(value) * multiplier;
                    break;
                case "splinterpoints":
                    if ("splinterpoints" in data) {
                        data.splinterpoints.max = (data.splinterpoints?.max || 3) + parseFloat(value) * multiplier;
                    }
                    break;
                case "healthregeneration.multiplier":
                    data.healthRegeneration.multiplier = parseFloat(value) * multiplier;
                    break;
                case "focusregeneration.multiplier":
                    data.focusRegeneration.multiplier = parseFloat(value) * multiplier;
                    break;
                case "healthregeneration.bonus":
                    data.healthRegeneration.bonus += parseFloat(value);
                    break;
                case "focusregeneration.bonus":
                    data.focusRegeneration.bonus += parseFloat(value);
                    break;
                case "lowerfumbleresult":
                    let skill = "skill" in item.system && item.system.skill ? item.system?.skill : "*";
                    addModifierHelper(modifierLabel.toLowerCase() + "/" + skill);
                    break;
                case "generalskills":
                    splittermond.skillGroups.general.forEach((skill) => {
                        addModifierHelper(skill, emphasis);
                    });
                    break;
                case "magicskills":
                    splittermond.skillGroups.magic.forEach((skill) => {
                        addModifierHelper(skill, emphasis);
                    });
                    break;
                case "fightingskills":
                    splittermond.skillGroups.fighting.forEach((skill) => {
                        addModifierHelper(skill, emphasis);
                    });
                    break;
                case "damage":
                    actor.modifier.add("damage." + emphasis, name, value, item, type, false);
                    break;
                case "weaponspeed":
                    actor.modifier.add("weaponspeed." + emphasis, name, value, item, type, false);
                    break;
                default:
                    const itemSkill = "skill" in item.system ? item.system.skill : undefined;
                    if (modifierLabel.toLowerCase().startsWith("foreduction")) {
                        data.spellCostReduction.addCostModifier(modifierLabel, value, itemSkill);
                    } else if (modifierLabel.toLowerCase().startsWith("foenhancedreduction")) {
                        data.spellEnhancedCostReduction.addCostModifier(modifierLabel, value, itemSkill);
                        return;
                    }

                    let element = splittermond.derivedAttributes.find(attr => {
                        return modifierLabel.toLowerCase() === foundryApi.localize(`splittermond.derivedAttribute.${attr}.short`).toLowerCase() || modifierLabel.toLowerCase() === foundryApi.localize(`splittermond.derivedAttribute.${attr}.long`).toLowerCase()
                    });
                    if (element) {
                        modifierLabel = element;
                    }

                    if (modifierLabel == "initiative") value = -parseInt(value);

                    addModifierHelper(modifierLabel, emphasis);

                    break;
            }
        } else {
            foundryApi.reportError(`Syntax Error in modifier-string "${str}" in ${name}!`)
        }
    });
}
