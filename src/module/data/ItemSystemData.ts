export interface SplittermondSpellSystemData {
    "description": string | null | undefined,
    "source": string | null | undefined
    "availableIn": string | null | undefined,
    "skill": string | null | undefined,
    "skillLevel": number | null | undefined,
    "spellType": string | null | undefined,
    "costs": string | null | undefined,
    "difficulty": string | null | undefined,
    "damage": string | null | undefined,
    "range": string | null | undefined,
    "castDuration": string | null | undefined,
    "effectDuration": string | null | undefined,
    "effectArea": string | null | undefined,
    "enhancementDescription": string | null | undefined,
    "enhancementCosts": string | null | undefined,
    "features": string | null | undefined,
    "degreeOfSuccessOptions": {
        "castDuration": boolean,
        "consumedFocus": boolean,
        "exhaustedFocus": boolean,
        "channelizedFocus": boolean,
        "effectDuration": boolean,
        "damage": boolean,
        "range": boolean,
        "effectArea": boolean
    }
}

export interface SplittermondMasterySystemData {
    description: string | null | undefined,
    source: string | null | undefined,
    modifier: string | null | undefined,
    availableIn: string | null | undefined,
    skill: string | null | undefined,
    isGrandmaster: string | null | undefined,
    isManeuver: string | null | undefined,
    level: number | null | undefined,
}