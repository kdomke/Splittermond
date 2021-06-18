export const splittermond = {};

splittermond.heroLevel = [0, 100, 300, 600];

splittermond.attributes = ["charisma", "agility", "intuition",
    "constitution",
    "mystic",
    "strength",
    "mind",
    "willpower"];

splittermond.derivedAttributes = ["size", "speed", "initiative", "healthpoints", "focuspoints", "defense", "bodyresist", "mindresist"];

splittermond.woundMalus = {
    "5": [
        {
            value: 0,
            label: "splittermond.woundMalusLevels.notinjured"
        },
        {
            value: -1,
            label: "splittermond.woundMalusLevels.battered"
        },
        {
            value: -2,
            label: "splittermond.woundMalusLevels.injured"
        },
        {
            value: -4,
            label: "splittermond.woundMalusLevels.badlyinjured"
        },
        {
            value: -8,
            label: "splittermond.woundMalusLevels.doomed"
        }
    ],
    "3": [
        {
            value: 0,
            label: "splittermond.woundMalusLevels.notinjured"
        },
        {
            value: -2,
            label: "splittermond.woundMalusLevels.injured"
        },
        {
            value: -8,
            label: "splittermond.woundMalusLevels.doomed"
        }
    ],
    "1": [
        {
            value: 0,
            label: "splittermond.woundMalusLevels.notinjured"
        }
    ],
};

splittermond.damageLevel = ["splittermond.damageLevels.undamaged","splittermond.damageLevels.tarnished","splittermond.damageLevels.demolished","splittermond.damageLevels.destroyed"]

splittermond.skillGroups = {
    fighting: [
        "melee",
        "slashing",
        "chains",
        "blades",
        "longrange",
        "staffs",
        "throwing"],
    general: ["acrobatics",
        "alchemy",
        "leadership",
        "arcanelore",
        "athletics",
        "performance",
        "diplomacy",
        "clscraft",
        "empathy",
        "determination",
        "dexterity",
        "history",
        "craftmanship",
        "heal",
        "stealth",
        "hunting",
        "countrylore",
        "nature",
        "eloquence",
        "locksntraps",
        "swim",
        "seafaring",
        "streetlore",
        "animals",
        "survival",
        "perception",
        "endurance"],
    magic: ["antimagic",
        "controlmagic",
        "motionmagic",
        "insightmagic",
        "stonemagic",
        "firemagic",
        "healmagic",
        "illusionmagic",
        "combatmagic",
        "lightmagic",
        "naturemagic",
        "shadowmagic",
        "fatemagic",
        "protectionmagic",
        "enhancemagic",
        "deathmagic",
        "transformationmagic",
        "watermagic",
        "windmagic"]
};
splittermond.resources = {
    core: ["reputation",
        "contacts",
        "state",
        "wealth"],
    optional: ["following",
        "faith",
        "creature",
        "mentor",
        "relic",
        "hideaway",
        "rank"]
};

splittermond.skillAttributes = {
    "acrobatics": ["agility", "strength"],
    "alchemy": ["mystic", "mind"],
    "leadership": ["charisma", "willpower"],
    "arcanelore": ["mystic", "mind"],
    "athletics": ["agility", "strength"],
    "performance": ["charisma", "willpower"],
    "diplomacy": ["charisma", "mind"],
    "clscraft": ["intuition", "mind"],
    "empathy": ["intuition", "mind"],
    "determination": ["charisma", "willpower"],
    "dexterity": ["charisma", "agility"],
    "history": ["mystic", "mind"],
    "craftmanship": ["constitution", "mind"],
    "heal": ["intuition", "mind"],
    "stealth": ["agility", "intuition"],
    "hunting": ["constitution", "mind"],
    "countrylore": ["intuition", "mind"],
    "nature": ["intuition", "mind"],
    "eloquence": ["charisma", "willpower"],
    "locksntraps": ["intuition", "agility"],
    "swim": ["strength", "constitution"],
    "seafaring": ["agility", "constitution"],
    "streetlore": ["charisma", "intuition"],
    "animals": ["charisma", "intuition"],
    "survival": ["intuition", "constitution"],
    "perception": ["intuition", "willpower"],
    "endurance": ["constitution", "willpower"],
    "antimagic": ["mystic", "willpower"],
    "controlmagic": ["mystic", "willpower"],
    "motionmagic": ["mystic", "agility"],
    "insightmagic": ["mystic", "mind"],
    "stonemagic": ["mystic", "constitution"],
    "firemagic": ["mystic", "charisma"],
    "healmagic": ["mystic", "charisma"],
    "illusionmagic": ["mystic", "charisma"],
    "combatmagic": ["mystic", "strength"],
    "lightmagic": ["mystic", "charisma"],
    "naturemagic": ["mystic", "charisma"],
    "shadowmagic": ["mystic", "intuition"],
    "fatemagic": ["mystic", "charisma"],
    "protectionmagic": ["mystic", "charisma"],
    "enhancemagic": ["mystic", "strength"],
    "deathmagic": ["mystic", "mind"],
    "transformationmagic": ["mystic", "constitution"],
    "watermagic": ["mystic", "intuition"],
    "windmagic": ["mystic", "mind"]
};

splittermond.rollType = {
    standard: {
        label: "splittermond.rollType.standard",
        rollFormula: "2d10"
    },
    risk: {
        label: "splittermond.rollType.risk",
        rollFormula: "4d10ri"
    },
    safety: {
        label: "splittermond.rollType.safety",
        rollFormula: "2d10kh1"
    }
}

splittermond.complexityOptions = {
    U: "splittermond.complexityOptions.untrained",
    G: "splittermond.complexityOptions.journeyman",
    F: "splittermond.complexityOptions.expert",
    M: "splittermond.complexityOptions.master",
    A: "splittermond.complexityOptions.instruction",
}

splittermond.availabilityOptions = {
    village: "splittermond.availabilityOptions.village",
    town: "splittermond.availabilityOptions.town",
    city: "splittermond.availabilityOptions.city",
    metropolis: "splittermond.availabilityOptions.metropolis",
}

splittermond.fightingSkillOptions = {
    melee: "splittermond.skillLabel.melee",
    slashing: "splittermond.skillLabel.slashing",
    chains: "splittermond.skillLabel.chains",
    blades: "splittermond.skillLabel.blades",
    longrange: "splittermond.skillLabel.longrange",
    staffs: "splittermond.skillLabel.staffs",
    throwing: "splittermond.skillLabel.throwing"
}

splittermond.meleeFightingSkillOptions = {
    melee: "splittermond.skillLabel.melee",
    slashing: "splittermond.skillLabel.slashing",
    chains: "splittermond.skillLabel.chains",
    blades: "splittermond.skillLabel.blades",
    staffs: "splittermond.skillLabel.staffs"
}

splittermond.attributeOptions = {
    charisma: "splittermond.attribute.charisma.long",
    agility: "splittermond.attribute.agility.long",
    intuition: "splittermond.attribute.intuition.long",
    constitution: "splittermond.attribute.constitution.long",
    mystic: "splittermond.attribute.mystic.long",
    strength: "splittermond.attribute.strength.long",
    mind: "splittermond.attribute.mind.long",
    willpower: "splittermond.attribute.willpower.long",
}

splittermond.spellSkillsOption = {
    "arcanelore": "splittermond.skillLabel.arcanelore",
    "antimagic": "splittermond.skillLabel.antimagic",
    "controlmagic": "splittermond.skillLabel.controlmagic",
    "motionmagic": "splittermond.skillLabel.motionmagic",
    "insightmagic": "splittermond.skillLabel.insightmagic",
    "stonemagic": "splittermond.skillLabel.stonemagic",
    "firemagic": "splittermond.skillLabel.firemagic",
    "healmagic": "splittermond.skillLabel.healmagic",
    "illusionmagic": "splittermond.skillLabel.illusionmagic",
    "combatmagic": "splittermond.skillLabel.combatmagic",
    "lightmagic": "splittermond.skillLabel.lightmagic",
    "naturemagic": "splittermond.skillLabel.naturemagic",
    "shadowmagic": "splittermond.skillLabel.shadowmagic",
    "fatemagic": "splittermond.skillLabel.fatemagic",
    "protectionmagic": "splittermond.skillLabel.protectionmagic",
    "enhancemagic": "splittermond.skillLabel.enhancemagic",
    "deathmagic": "splittermond.skillLabel.deathmagic",
    "transformationmagic": "splittermond.skillLabel.transformationmagic",
    "watermagic": "splittermond.skillLabel.watermagic",
    "windmagic": "splittermond.skillLabel.windmagic"
}

splittermond.masterySkillsOption = {
    "melee": "splittermond.skillLabel.melee",
    "slashing": "splittermond.skillLabel.slashing",
    "chains": "splittermond.skillLabel.chains",
    "blades": "splittermond.skillLabel.blades",
    "longrange": "splittermond.skillLabel.longrange",
    "staffs": "splittermond.skillLabel.staffs",
    "throwing": "splittermond.skillLabel.throwing",
    "acrobatics": "splittermond.skillLabel.acrobatics",
    "alchemy": "splittermond.skillLabel.alchemy",
    "leadership": "splittermond.skillLabel.leadership",
    "arcanelore": "splittermond.skillLabel.arcanelore",
    "athletics": "splittermond.skillLabel.athletics",
    "performance": "splittermond.skillLabel.performance",
    "diplomacy": "splittermond.skillLabel.diplomacy",
    "clscraft": "splittermond.skillLabel.clscraft",
    "empathy": "splittermond.skillLabel.empathy",
    "determination": "splittermond.skillLabel.determination",
    "dexterity": "splittermond.skillLabel.dexterity",
    "history": "splittermond.skillLabel.history",
    "craftmanship": "splittermond.skillLabel.craftmanship",
    "heal": "splittermond.skillLabel.heal",
    "stealth": "splittermond.skillLabel.stealth",
    "hunting": "splittermond.skillLabel.hunting",
    "countrylore": "splittermond.skillLabel.countrylore",
    "nature": "splittermond.skillLabel.nature",
    "eloquence": "splittermond.skillLabel.eloquence",
    "locksntraps": "splittermond.skillLabel.locksntraps",
    "swim": "splittermond.skillLabel.swim",
    "seafaring": "splittermond.skillLabel.seafaring",
    "streetlore": "splittermond.skillLabel.streetlore",
    "animals": "splittermond.skillLabel.animals",
    "survival": "splittermond.skillLabel.survival",
    "perception": "splittermond.skillLabel.perception",
    "endurance": "splittermond.skillLabel.endurance",
    "antimagic": "splittermond.skillLabel.antimagic",
    "controlmagic": "splittermond.skillLabel.controlmagic",
    "motionmagic": "splittermond.skillLabel.motionmagic",
    "insightmagic": "splittermond.skillLabel.insightmagic",
    "stonemagic": "splittermond.skillLabel.stonemagic",
    "firemagic": "splittermond.skillLabel.firemagic",
    "healmagic": "splittermond.skillLabel.healmagic",
    "illusionmagic": "splittermond.skillLabel.illusionmagic",
    "combatmagic": "splittermond.skillLabel.combatmagic",
    "lightmagic": "splittermond.skillLabel.lightmagic",
    "naturemagic": "splittermond.skillLabel.naturemagic",
    "shadowmagic": "splittermond.skillLabel.shadowmagic",
    "fatemagic": "splittermond.skillLabel.fatemagic",
    "protectionmagic": "splittermond.skillLabel.protectionmagic",
    "enhancemagic": "splittermond.skillLabel.enhancemagic",
    "deathmagic": "splittermond.skillLabel.deathmagic",
    "transformationmagic": "splittermond.skillLabel.transformationmagic",
    "watermagic": "splittermond.skillLabel.watermagic",
    "windmagic": "splittermond.skillLabel.windmagic",
    "none": "splittermond.skillLabel.none"
}


splittermond.itemSheetProperties = {
    species: [
        {
            groupName: "splittermond.general",
            properties: [
                {
                    field: "data.size",
                    label: "splittermond.derivedAttribute.size.long",
                    template: "input"
                },
                {
                    field: "data.attributeMod",
                    label: "splittermond.attributeModifiers",
                    template: "input"
                },
                {
                    field: "data.strengths",
                    label: "splittermond.strengths",
                    template: "input"
                }
            ]
        }

    ],
    mastery: [
        {
            groupName: "splittermond.general",
            properties: [
                {
                    field: "data.availableIn",
                    label: "splittermond.availableIn",
                    template: "input"
                },
                {
                    field: "data.skill",
                    label: "splittermond.skill",
                    template: "select",
                    choices: splittermond.masterySkillsOption
                },
                {
                    field: "data.level",
                    label: "splittermond.masteryItem.level",
                    template: "input"
                },
                {
                    field: "data.modifier",
                    label: "splittermond.modifier",
                    template: "input"
                }]
        }
    ],
    strength: [
        {
            groupName: "splittermond.general",
            properties: [
                {
                    field: "data.quantity",
                    label: "splittermond.quantity",
                    template: "input"
                },
                {
                    field: "data.level",
                    label: "splittermond.strengthItem.level",
                    template: "input"
                },
                {
                    field: "data.modifier",
                    label: "splittermond.modifier",
                    template: "input"
                },
                {
                    field: "data.multiSelectable",
                    label: "splittermond.multiSelectable",
                    template: "bool"
                },
                {
                    field: "data.onCreationOnly",
                    label: "splittermond.onCreationOnly",
                    template: "bool"
                }
            ]
        }
    ],
    statuseffect: [
        {
            groupName: "splittermond.general",
            properties: [
                {
                    field: "data.level",
                    label: "splittermond.level",
                    template: "input"
                },
                {
                    field: "data.modifier",
                    label: "splittermond.modifier",
                    template: "input"
                }
            ]
        }

    ],
    spelleffect: [
        {
            groupName: "splittermond.general",
            properties: [
                {
                    field: "data.active",
                    label: "splittermond.active",
                    template: "bool"
                },
                {
                    field: "data.modifier",
                    label: "splittermond.modifier",
                    template: "input"
                }
            ]
        }

    ],
    equipment: [
        {
            groupName: "splittermond.physicalProperties",
            properties: [
                {
                    field: "data.quantity",
                    label: "splittermond.quantity",
                    template: "inputNumberWithSpinner"
                },
                {
                    field: "data.price",
                    label: "splittermond.price",
                    template: "input"
                },
                {
                    field: "data.weight",
                    label: "splittermond.load",
                    template: "inputNumberWithSpinner"
                },
                {
                    field: "data.hardness",
                    label: "splittermond.hardness",
                    template: "inputNumberWithSpinner"
                },
                {
                    field: "data.durability",
                    label: "splittermond.durability",
                    template: "readonly"
                },
                {
                    field: "data.sufferedDamage",
                    label: "splittermond.sufferedDamage",
                    template: "inputNumberWithSpinner"
                },
                {
                    field: "data.damageLevelText",
                    label: "splittermond.damageLevel",
                    template: "readonlyLocalize"
                },
                {
                    field: "data.complexity",
                    label: "splittermond.complexity",
                    template: "select",
                    choices: splittermond.complexityOptions
                },
                {
                    field: "data.availability",
                    label: "splittermond.availability",
                    template: "select",
                    choices: splittermond.availabilityOptions
                },
                {
                    field: "data.quality",
                    label: "splittermond.quality",
                    template: "input"
                },
                {
                    field: "data.modifier",
                    label: "splittermond.modifier",
                    template: "input"
                }
            ]
        }
    ]
}

splittermond.itemSheetProperties.weapon = [
    ...splittermond.itemSheetProperties.equipment,
    {
        groupName: "splittermond.weaponProperties",
        properties: [
            {
                field: "data.skill",
                label: "splittermond.fightingSkill",
                template: "select",
                choices: splittermond.fightingSkillOptions
            },
            {
                field: "data.skillMod",
                label: "splittermond.skillMod",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.attribute1",
                label: "splittermond.attributes",
                template: "select",
                choices: splittermond.attributeOptions
            },
            {
                field: "data.attribute2",
                label: "",
                template: "select",
                choices: splittermond.attributeOptions
            },
            {
                field: "data.damage",
                label: "splittermond.damage",
                template: "input"
            },
            {
                field: "data.range",
                label: "splittermond.range",
                template: "input"
            },
            {
                field: "data.weaponSpeed",
                label: "splittermond.weaponSpeed",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.minAttributes",
                label: "splittermond.minAttributes",
                template: "input"
            },
            {
                field: "data.features",
                label: "splittermond.features",
                template: "input"
            }
        ]
    },
    {
        groupName: "splittermond.secondaryWeaponProperties",
        properties: [
            {
                field: "data.secondaryAttack.skill",
                label: "splittermond.fightingSkill",
                template: "select",
                choices: { none: "splittermond.skillLabel.none", ...splittermond.fightingSkillOptions }
            },
            {
                field: "data.secondaryAttack.skillMod",
                label: "splittermond.skillMod",
                template: "input"
            },
            {
                field: "data.secondaryAttack.attribute1",
                label: "splittermond.attributes",
                template: "select",
                choices: splittermond.attributeOptions
            },
            {
                field: "data.secondaryAttack.attribute2",
                label: "",
                template: "select",
                choices: splittermond.attributeOptions
            },
            {
                field: "data.secondaryAttack.damage",
                label: "splittermond.damage",
                template: "input"
            },
            {
                field: "data.secondaryAttack.range",
                label: "splittermond.range",
                template: "input"
            },
            {
                field: "data.secondaryAttack.weaponSpeed",
                label: "splittermond.weaponSpeed",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.secondaryAttack.minAttributes",
                label: "splittermond.minAttributes",
                template: "input"
            },
            {
                field: "data.secondaryAttack.features",
                label: "splittermond.features",
                template: "input"
            }
        ]
    }
]

splittermond.itemSheetProperties.armor = [
    ...splittermond.itemSheetProperties.equipment,
    {
        groupName: "splittermond.armorProperties",
        properties: [
            {
                field: "data.tickMalus",
                label: "splittermond.tickMalus",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.defenseBonus",
                label: "splittermond.defenseBonus",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.handicap",
                label: "splittermond.handicap",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.damageReduction",
                label: "splittermond.damageReduction",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.minStr",
                label: "splittermond.minStrength",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.features",
                label: "splittermond.features",
                template: "input"
            }
        ]
    }
]

splittermond.itemSheetProperties.shield = [
    ...splittermond.itemSheetProperties.equipment,
    {
        groupName: "splittermond.shieldProperties",
        properties: [
            {
                field: "data.skill",
                label: "splittermond.fightingSkill",
                template: "select",
                choices: splittermond.meleeFightingSkillOptions
            },
            {
                field: "data.tickMalus",
                label: "splittermond.tickMalus",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.defenseBonus",
                label: "splittermond.defenseBonus",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.handicap",
                label: "splittermond.handicap",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.minAttributes",
                label: "splittermond.minAttributes",
                template: "input"
            },
            {
                field: "data.features",
                label: "splittermond.features",
                template: "input"
            }
        ]
    }
]

splittermond.itemSheetProperties.spell = [
    {
        groupName: "splittermond.generalProperties",
        properties: [
            {
                field: "data.availableIn",
                label: "splittermond.availableIn",
                template: "input"
            },
            {
                field: "data.skill",
                label: "splittermond.skill",
                template: "select",
                choices: splittermond.spellSkillsOption
            },
            {
                field: "data.skillLevel",
                label: "splittermond.spellLevel",
                template: "inputNumberWithSpinner"
            },
            {
                field: "data.spellType",
                label: "splittermond.spellType",
                template: "input"
            },
            {
                field: "data.costs",
                label: "splittermond.focusCosts",
                template: "input"
            },
            {
                field: "data.difficulty",
                label: "splittermond.difficulty",
                template: "input"
            },
            {
                field: "data.damage",
                label: "splittermond.damage",
                template: "input"
            },
            {
                field: "data.range",
                label: "splittermond.range",
                template: "input"
            },
            {
                field: "data.castDuration",
                label: "splittermond.castDuration",
                template: "input"
            },
            {
                field: "data.effectDuration",
                label: "splittermond.effectDuration",
                template: "input"
            },
            {
                field: "data.effectArea",
                label: "splittermond.effectArea",
                template: "input"
            },
            {
                field: "data.enhancementCosts",
                label: "splittermond.enhancementCosts",
                template: "input"
            },
            {
                field: "data.enhancementDescription",
                label: "splittermond.enhancementDescription",
                template: "input"
            }
        ]
    },
    {
        groupName: "splittermond.degreeOfSuccessOptionsHeader",
        properties: [
            {
                field: "data.degreeOfSuccessOptions.castDuration",
                label: "splittermond.degreeOfSuccessOptions.castDuration",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.consumedFocus",
                label: "splittermond.degreeOfSuccessOptions.consumedFocus",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.exhaustedFocus",
                label: "splittermond.degreeOfSuccessOptions.exhaustedFocus",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.channelizedFocus",
                label: "splittermond.degreeOfSuccessOptions.channelizedFocus",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.effectDuration",
                label: "splittermond.degreeOfSuccessOptions.effectDuration",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.damage",
                label: "splittermond.degreeOfSuccessOptions.damage",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.range",
                label: "splittermond.degreeOfSuccessOptions.range",
                template: "bool"
            },
            {
                field: "data.degreeOfSuccessOptions.effectArea",
                label: "splittermond.degreeOfSuccessOptions.effectArea",
                template: "bool"
            }
        ]
    }
]

splittermond.itemSheetProperties.npcfeature = [
    {
        groupName: "splittermond.generalProperties",
        properties: [
            {
                field: "data.modifier",
                label: "splittermond.modifier",
                template: "input"
            }
        ]
    }
]

splittermond.itemSheetProperties.moonsign = [
    {
        groupName: "splittermond.generalProperties",
        properties: [
            {
                field: "data.enhancement",
                label: "splittermond.enhancementDescription",
                template: "input"
            },
            {
                field: "data.secretGift",
                label: "splittermond.secretGift",
                template: "input"
            }
        ]
    }
]

splittermond.icons = {
    equipment: {
        default: "icons/svg/chest.svg"
    },
    shield: {
        default: "icons/svg/shield.svg"
    },
    armor: {
        default: "icons/svg/statue.svg"
    },
    weapon: {
        default: "icons/svg/sword.svg"
    },
    spell: {
        default: "icons/svg/daze.svg"
    }
}

splittermond.modifier = {
    addsplinter: "splinterpoints +2",
    sturdy: "LP +1",
    resistbody: "KW +2",
    resistmind: "GW +2",
    focuspool: "FO +5",
    highini: "INI -3",
    resistpain: "woundMalus.mod -1",
    resistpain1: "woundMalus.mod -1",
    resistpain2: "woundMalus.mod -1",
    swift: "GSW +1",
    armour1: "handicap.armor.mod -1",
    shield1: "handicap.shield.mod -1",
    armour2: "tickmalus.armor.mod -1",
    shield2: "tickmalus.shield.mod -1",
    flashreflexes: "INI -3",
    goodreflexes: "VTD +1",
    arcanespeed: "GSW +1",
    sprinter: "GSW +1",
    focusregen: "focusRegeneration.multiplier 3",
    liferegen: "healthRegeneration.multiplier 3",
    naturalarmor: "SR +1",
    "schmerzimmunität": "woundMalus.mod -100",
    "schmerzresistenz": "woundMalus.mod -1",
    "schwächlich": "woundMalus.nbrLevels 3",
    "erhöhte fokusregeneration": "focusRegeneration.multiplier 3",
    "erhöhte lebensregeneration": "healthRegeneration.multiplier 3",
    "erhöhter fokuspool": "FO +5",
    "flink": "GSW +1",
    "sprinter": "GSW +1",
    "hoher geistiger widerstand": "GW +2",
    "hoher körperlicher widerstand": "KW +2",
    "natürlicher rüstungsschutz": "SR +1",
    "robust": "LP +1",
    "verbesserte initiative": "INI -3",
    "zusätzliche splitterpunkte": "splinterpoints +2",
    "stabile magie": "lowerFumbleResult +1",
    "blitzreflexe": "INI -3",
    "gute reflexe": "VTD +1",
    "rüstungsträger i": "handicap.armor.mod -1",
    "rüstungsträger 1": "handicap.armor.mod -1",
    "rüstungsträger ii": "tickmalus.armor.mod -1",
    "rüstungsträger 2": "tickmalus.armor.mod -1",
    "schildträger i": "handicap.shield.mod -1",
    "schildträger 1": "handicap.shield.mod -1",
    "schildträger ii": "tickmalus.shield.mod -1",
    "schildträger 2": "tickmalus.shield.mod -1",
    "natürlicher rüstungsschutz": "SR +1"
}

splittermond.fumbleTable = {
    fight: [
        {
            min: 1,
            max: 1,
            text: "splittermond.fumbleTable.fight.result1_1"
        },
        {
            min: 2,
            max: 3,
            text: "splittermond.fumbleTable.fight.result2_3"
        },
        {
            min: 4,
            max: 6,
            text: "splittermond.fumbleTable.fight.result4_6"
        },
        {
            min: 7,
            max: 9,
            text: "splittermond.fumbleTable.fight.result7_8"
        },
        {
            min: 10,
            max: 12,
            text: "splittermond.fumbleTable.fight.result10_12"
        },
        {
            min: 13,
            max: 15,
            text: "splittermond.fumbleTable.fight.result13_15"
        },
        {
            min: 16,
            max: 18,
            text: "splittermond.fumbleTable.fight.result16_18"
        },
        {
            min: 19,
            max: 20,
            text: "splittermond.fumbleTable.fight.result19_20"
        }
    ],
    magic: {
        sorcerer: [
            {
                min: 1,
                max: 2,
                text: "splittermond.fumbleTable.magic.sorcerer.result1_2"
            },
            {
                min: 3,
                max: 20,
                text: "splittermond.fumbleTable.magic.sorcerer.result3_20"
            },
            {
                min: 21,
                max: 35,
                text: "splittermond.fumbleTable.magic.sorcerer.result21_35"
            },
            {
                min: 36,
                max: 70,
                text: "splittermond.fumbleTable.magic.sorcerer.result36_70"
            },
            {
                min: 71,
                max: 100,
                text: "splittermond.fumbleTable.magic.sorcerer.result71_100"
            },
            {
                min: 101,
                max: 130,
                text: "splittermond.fumbleTable.magic.sorcerer.result101_130"
            },
            {
                min: 131,
                max: 175,
                text: "splittermond.fumbleTable.magic.sorcerer.result131_175"
            },
            {
                min: 176,
                max: 250,
                text: "splittermond.fumbleTable.magic.sorcerer.result176_250"
            },
            {
                min: 251,
                max: Infinity,
                text: "splittermond.fumbleTable.magic.sorcerer.result251"
            }
        ],
        priest: [
            {
                min: 1,
                max: 2,
                text: "splittermond.fumbleTable.magic.priest.result1_2"
            },
            {
                min: 3,
                max: 20,
                text: "splittermond.fumbleTable.magic.sorcerer.result3_20"
            },
            {
                min: 21,
                max: 35,
                text: "splittermond.fumbleTable.magic.priest.result21_35"
            },
            {
                min: 36,
                max: 70,
                text: "splittermond.fumbleTable.magic.priest.result36_70"
            },
            {
                min: 71,
                max: 100,
                text: "splittermond.fumbleTable.magic.priest.result71_100"
            },
            {
                min: 101,
                max: 130,
                text: "splittermond.fumbleTable.magic.priest.result101_130"
            },
            {
                min: 131,
                max: Infinity,
                text: "splittermond.fumbleTable.magic.priest.result131"
            }
        ]
    }
}




