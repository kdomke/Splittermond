// STRAIGHT COPY OF public/template.json. (Via GPT-o1) DO NOT MODIFY WITHOUT UPDATING public/template.json


// Templates
interface DescriptionTemplate {
    description?: string | null;
    source?: string | null;
}

interface PhysicalPropertiesTemplate {
    quantity?: number | null;
    price?: string | null;
    weight?: number | null;
    hardness?: number | null;
    complexity?: string | null;
    availability?: string | null;
    quality?: number | null;
    durability?: number | null;
    damageLevel?: number | null;
    sufferedDamage?: number | null;
}

interface DefenseTemplate {
    tickMalus?: number | null;
    defenseBonus?: number | null;
    handicap?: number | null;
}

interface ModifierTemplate {
    modifier?: string | null;
}


export interface SplittermondWeaponSystemData
    extends DescriptionTemplate,
        PhysicalPropertiesTemplate,
        ModifierTemplate {
    damage?: string | null;
    range?: number | null;
    weaponSpeed?: number | null;
    skill?: string | null;
    skillMod?: number | null;
    features?: string | null;
    attribute1?: string | null;
    attribute2?: string | null;
    minAttributes?: string | null;
    prepared?: boolean | null;
    equipped?: boolean | null;
    secondaryAttack?: {
        skill?: string | null;
        skillMod?: number | null;
        attribute1?: string | null;
        attribute2?: string | null;
        damage?: string | null;
        range?: number | null;
        weaponSpeed?: number | null;
        minAttributes?: string | null;
        features?: string | null;
    } | null;
}

export interface SplittermondProjectileSystemData
    extends DescriptionTemplate,
        PhysicalPropertiesTemplate {
    skill?: string | null;
    subSkill?: string | null;
    weapon?: string | null;
    features?: string[] | null;
}

export interface SplittermondEquipmentSystemData
    extends DescriptionTemplate,
        PhysicalPropertiesTemplate,
        ModifierTemplate {}

export interface SplittermondShieldSystemData
    extends DescriptionTemplate,
        PhysicalPropertiesTemplate,
        DefenseTemplate,
        ModifierTemplate {
    skill?: string | null;
    features?: string[] | null;
    minAttributes?: string | null;
    equipped?: boolean | null;
}

export interface SplittermondArmorSystemData
    extends DescriptionTemplate,
        PhysicalPropertiesTemplate,
        DefenseTemplate,
        ModifierTemplate {
    minStr?: number | null;
    damageReduction?: number | null;
    features?: string[] | null;
    equipped?: boolean | null;
}

export interface SplittermondSpellSystemData extends DescriptionTemplate {
    availableIn?: string | null;
    skill?: string | null;
    skillLevel?: number | null;
    spellType?: string | null;
    costs?: string | null;
    difficulty?: string | null;
    damage?: string | null;
    range?: string | null;
    castDuration?: string | null;
    effectDuration?: string | null;
    effectArea?: string | null;
    enhancementDescription?: string | null;
    enhancementCosts?: string | null;
    features?: string | null;
    degreeOfSuccessOptions?: {
        castDuration?: boolean | null;
        consumedFocus?: boolean | null;
        exhaustedFocus?: boolean | null;
        channelizedFocus?: boolean | null;
        effectDuration?: boolean | null;
        damage?: boolean | null;
        range?: boolean | null;
        effectArea?: boolean | null;
    } | null;
}

export interface SplittermondStrengthSystemData
    extends DescriptionTemplate,
        ModifierTemplate {
    origin?: string | null;
    level?: number | null;
    quantity?: number | null;
    multiSelectable?: boolean | null;
    onCreationOnly?: boolean | null;
}


export interface SplittermondWeaknessSystemData extends DescriptionTemplate {}

export interface SplittermondMasterySystemData
    extends DescriptionTemplate,
        ModifierTemplate {
    availableIn?: string | null;
    skill?: string | null;
    isGrandmaster?: number | null;
    isManeuver?: boolean | null;
    level?: number | null;
}

export interface SplittermondSpeciesSystemData extends DescriptionTemplate {
    size?: number | null;
    attributeMod?: string | null;
    strengths?: string | null;
}

export interface SplittermondCultureSystemData extends DescriptionTemplate {
    typicalSpecies?: string | null;
    typicalAncestries?: string | null;
    cultureLore?: string | null;
    language?: string | null;
    strength?: string | null;
    skills?: string | null;
    mastery?: string | null;
}

export interface SplittermondAncestrySystemData extends DescriptionTemplate {
    resources?: string | null;
    skills?: string | null;
}

export interface SplittermondEducationSystemData extends DescriptionTemplate {
    strength?: string | null;
    resources?: string | null;
    skills?: string | null;
    masteries?: string | null;
}

export interface SplittermondResourceSystemData extends DescriptionTemplate {
    value?: number | null;
}

export interface SplittermondNpcfeatureSystemData
    extends DescriptionTemplate,
        ModifierTemplate {}

export interface SplittermondMoonsignSystemData extends DescriptionTemplate {
    enhancement?: string | null;
    secretGift?: string | null;
}

export interface SplittermondLanguageSystemData extends DescriptionTemplate {}

export interface SplittermondCultureloreSystemData
    extends DescriptionTemplate,
        ModifierTemplate {}

export interface SplittermondStatuseffectSystemData
    extends DescriptionTemplate,
        ModifierTemplate {
    level?: number | null;
    startTick?: number | null;
    interval?: number | null;
    times?: number | null;
}

export interface SplittermondSpelleffectSystemData
    extends DescriptionTemplate,
        ModifierTemplate {
    active?: boolean | null;
}

export interface SplittermondNpcattackSystemData extends DescriptionTemplate {
    damage?: string | null;
    range?: number | null;
    weaponSpeed?: number | null;
    skillValue?: number | null;
    features?: string | null;
}

export type SplittermondItemSystemData = SplittermondWeaponSystemData | SplittermondProjectileSystemData | SplittermondEquipmentSystemData | SplittermondShieldSystemData | SplittermondArmorSystemData | SplittermondSpellSystemData | SplittermondStrengthSystemData | SplittermondWeaknessSystemData | SplittermondMasterySystemData | SplittermondSpeciesSystemData | SplittermondCultureSystemData | SplittermondAncestrySystemData | SplittermondEducationSystemData | SplittermondResourceSystemData | SplittermondNpcfeatureSystemData | SplittermondMoonsignSystemData | SplittermondLanguageSystemData | SplittermondCultureloreSystemData | SplittermondStatuseffectSystemData | SplittermondSpelleffectSystemData | SplittermondNpcattackSystemData;
