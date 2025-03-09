import {NpcFeatureDataModelType} from "../../item";
import {PartialItemData} from "./types";
import {LanguageMapper} from "../../item/LanguageMapper";
import {DamageType, damageTypes} from "../../config/damageTypes";
import {foundryApi} from "../../api/foundryApi";


function initLanguageMapper(localizer: (key: string) => string) {
    let languageMapper: LanguageMapper<DamageType>;

    function getLanguageMapper() {
        if (!languageMapper) {
            const codeToTranslation = new Map<DamageType, string>(damageTypes.map(t => [t, localizer(`splittermond.damageTypes.long.${t}`)]));
            const additionalTranslations = new Map<string, DamageType>(damageTypes.map(t => [localizer(`splittermond.damageTypes.short.${t}`), t]));
            additionalTranslations.set("Physischen Schaden", "physical");
            additionalTranslations.set("Mentalen Schaden", "mental");
            additionalTranslations.set("Mentalschaden", "mental");
            languageMapper = new LanguageMapper<DamageType>(codeToTranslation, additionalTranslations);
        }
        return languageMapper;
    }

    return getLanguageMapper;
}

const languageMapper = initLanguageMapper((s) => foundryApi.localize(s));


export function mapNameToSystemFeature(data: PartialItemData<NpcFeatureDataModelType>) {
    const modifiers = [...data.system.modifier?.split(",") ?? [],
        ...susceptibilityFromName(data)]
    return {
        type: data.type,
        name: data.name,
        system: {
            ...data.system,
            ...(modifiers.length > 0 ? {modifier: modifiers.join(", ")} : {})
        }
    }
}

    function susceptibilityFromName(data: PartialItemData<NpcFeatureDataModelType>) {
        const stringMatcher = /(?<type>verwundbarkeit|resistenz)\s+gegen\s+(?<damageType>[A-zäöüß]+(?:\s+[A-zäöüß]+)?)(?:\s+(?<modifier>\d*))?/
        const matchResult = stringMatcher.exec(data.name.toLowerCase());
        const concernsSusceptibility = matchResult !== null;
        if (!concernsSusceptibility) {
            return [];
        }
        const isResistant = matchResult.groups?.type.includes("resistenz");
        const translatedDamageType = matchResult.groups?.damageType;
        const translatedDamageValue = matchResult.groups?.modifier ?? "1";

        const code = translatedDamageType ? languageMapper().toCode(translatedDamageType) : undefined;
        if(!code){
            return  [];
        }

        return [`susceptibility.${code} ${isResistant ? "-" : ""}${translatedDamageValue}`];
    }