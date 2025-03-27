import {ParsedModifier, Value} from "./index";
import {initMapper, LanguageMapper} from "../../../util/LanguageMapper";
import {attributes, derivedAttributes} from "../../../config/attributes";
import {isRoll} from "../../../api/Roll";

const modifierKeys = ["emphasis", "damageType", "value"] as const;
const attributeMapper = initMapper(attributes)
    .withTranslator((t) => `splittermond.attributes.${t}.long`)
    .andOtherMappers((t) => `splittermond.attributes.${t}.short`)
    .build();
const derivedAttributeMapper = initMapper(derivedAttributes)
    .withTranslator((t) => `splittermond.derivedAttributes.${t}.long`)
    .andOtherMappers((t) => `splittermond.derivedAttributes.${t}.short`)
    .build();
const modifierKeyMapper = initMapper(modifierKeys)
    .withTranslator((t) => `splittermond.modifiers.keys.${t}`)
    .build()

/**
 * Only use for testing
 */
export function clearMappers() {
    (attributeMapper as any).clear();
    (derivedAttributeMapper as any).clear();
    (modifierKeyMapper as any).clear();
}

export function normalizeModifiers(modifiers: ParsedModifier[]) {
    const normalized = modifiers.map(m => ({...m}))
    normalized.forEach(normalizeModifier);
    return normalized;
}

function normalizeModifier(modifier: ParsedModifier) {
    for (const key in modifier.attributes) {
        const value = modifier.attributes[key];
        modifier.attributes[key] = normalizeValue(value);
    }
}

export function normalizeKey(key: string) {
    const replacer = new Or(replaceModifierKey)
    const replacement = replacer.tryReplace(key)
    if (replacement !== key) {
        return replacement;
    }
    return key;
}

export function normalizeValue(value: Value) {
    const replacer = new Or(replaceAttribute, replaceDerivedAttribute)
    if (typeof value === "string") {
        const sign: 1 | -1 = /^-/.test(value) ? -1 : 1;
        const replacement = replacer.tryReplace(value.replace(/^[-+]/, ""));
        if (replacement !== value) {
            return {propertyPath: replacement, sign, original: value};
        }
    } else if (typeof value === "object" && !isRoll(value)) {
        const replacement = replacer.tryReplace(value.propertyPath);
        if (replacement !== value.propertyPath) {
            value.propertyPath = replacement;
            return value;
        }
    }
    return value;
}

function replaceModifierKey(key:string){
    return createReplace(modifierKeys, modifierKeyMapper(), (v) => v)(key)
}

function replaceAttribute(value: string): string {
    return createReplace(attributes, attributeMapper(), (v) => `attributes.${v}.value`)(value)
}

function replaceDerivedAttribute(value: string): string {
    return createReplace(
        derivedAttributes,
        derivedAttributeMapper(),
        (v) => `derivedAttributes.${v}.value`
    )(value)
}

function createReplace<T extends string>(collection: Readonly<T[]>, mapper: LanguageMapper<T>, path: (v: string) => string) {
    return (value: string) => {
        const identifiedValue = mapper.toCode(value)
        if (identifiedValue && collection.includes(identifiedValue)) {
            return path(identifiedValue);
        }
        return value;
    }
}

class Or {
    private replaceOperations: ((x: string) => string)[] = [];

    constructor(...replaceOperations: ((x: string) => string)[]) {
        this.replaceOperations = replaceOperations
    }

    tryReplace(value: string): string {
        for (const operation of this.replaceOperations) {
            const replacement = operation(value);
            if (replacement !== value) {
                return replacement;
            }
        }
        return value;
    }
}
