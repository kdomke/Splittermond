import {ErrorMessage, ParsedModifier, Value} from "./index";
import {normalizeKey} from "./normalizer";
import {validateAllInputConsumed, validateKeys} from "./validators";

type SingleParseResult = ParsedModifier | ErrorMessage
type AttributeParseResult = { key: string, value: Value } | ErrorMessage

interface ParseResult {
    modifiers: ParsedModifier[],
    errors: ErrorMessage[]
}

export function parseModifiers(modifiers: string | null | undefined): ParseResult {
    if (!modifiers) {
        return {modifiers: [], errors: []};
    }
    const parsedModifiers = modifiers.trim().split(",")
        .map(m => m.trim())
        .filter(m => !!m)
        .map(parseModifier);
    return {
        modifiers: parsedModifiers.filter(m => typeof m !== "string"),
        errors: parsedModifiers.filter(m => typeof m == "string")
    }

}

function parseModifier(modifier: string): SingleParseResult {
    const pathPattern = /^\S+(?=\s)/;
    const valuePattern = /(?<=\s)[^\s="']+(?=$)/
    const pathMatch = pathPattern.exec(modifier);
    const attributeMatch = findAttributes(modifier);
    const valueMatch = valuePattern.exec(modifier);
    const allInputConsumed = validateAllInputConsumed(modifier, pathMatch, attributeMatch, valueMatch);
    if (!allInputConsumed || !pathMatch || !(attributeMatch.length > 0 || valueMatch)) {
        return `Modifier '${modifier}' is not of a modifier format`;
    }

    const parseResult = parsePath(pathMatch[0]);

    const attributeParseResult = parseAttributes(attributeMatch);
    if (typeof attributeParseResult === "string") {
        return attributeParseResult;
    }
    if (parseResult.attributes.emphasis && attributeParseResult.emphasis) {
        return `Modifier '${modifier}' contains duplicate declaration of emphasis`;
    }
    parseResult.attributes = {...parseResult.attributes, ...attributeParseResult};

    const value = valueMatch ? parseValue(valueMatch[0]) : null;
    if (value && attributeParseResult.value) {
        return `Modifier '${modifier}' contains duplicate declaration of value`;
    } else if (!value && !attributeParseResult.value) {
        return `Modifier '${modifier}' contains no declaration of value`;
    } else if (value) {
        parseResult.attributes.value = value;
    }
    return parseResult;
}

function findAttributes(modifier: string): string[] {
    const attributePattern = /(?<=\s)[^\s=]+=(?:"[^="]+"|[^\s'"=]+|'[^=']+')(?=\s|$)/g
    const attributeMatches = [];
    let match;
    while ((match = attributePattern.exec(modifier)) !== null) {
        attributeMatches.push(match[0]);
    }
    return attributeMatches;
}

function parsePath(path: string): ParsedModifier {
    const pathAndEmphasis = path.split("/");
    return {
        path: pathAndEmphasis[0],
        attributes: {...(pathAndEmphasis?.[1] ? {emphasis: pathAndEmphasis?.[1]} : {})}
    }
}

function parseAttributes(attributeMatches: string[]): Record<string, Value> | ErrorMessage {
    const errors: string[] = [];
    const attributes: Record<string, Value> = {};
    for (const attribute of attributeMatches) {
        const parseResult = parseAttribute(attribute.trim());
        if (typeof parseResult == "string") {
            errors.push(parseResult);
            continue;
        }
        if (parseResult.key in attributes) {
            errors.push(`Attribute '${parseResult.key}' exists several times in modifier.`);
        } else {
            const attributeErrors = [...validateKeys(parseResult.key)];
            if (attributeErrors.length > 0) {
                errors.push(...attributeErrors);
            } else {
                attributes[parseResult.key] = parseResult.value;
            }
        }
    }
    return errors.length == 0 ? attributes : errors.join("\n");

}

function parseAttribute(attribute: string): AttributeParseResult {
    const keyMatch = /\S+(?==)/.exec(attribute);
    const valueMatch = /(?<==).+/.exec(attribute);
    if (!keyMatch) {
        return `Could not identify key for Attribute ${attribute}`
    }
    if (!valueMatch) {
        return `Could not identify value for Attribute ${attribute}`
    }
    const validationFailure = validateKeys(keyMatch[0]);
    if (validationFailure.length > 0) {
        return `Invalid Key for Attribute ${attribute}, found ${validationFailure.join("\n")}`
    }
    const value = parseValue(valueMatch[0])
    //Only normalize keys here. We don't have enough information to reliably normalize values here.
    const normalizedKey = normalizeKey(keyMatch[0]);
    return {key: normalizedKey, value}
}

function parseValue(value: string) {
    const valueExpressionPattern = /(?<=\$\{)\S+(?=})/
    const numberPattern = /(?<=["']|^)[+-]?\d+(?=["']|$)/
    const quotedStringPattern = /(?<=["']).*(?=["'])/
    if (valueExpressionPattern.test(value)) {
        const sign: 1 | -1 = (/-(?=\s*\$\{)/.test(value) ? -1 : 1)
        const parsedValue = valueExpressionPattern.exec(value)![0];
        return {propertyPath: parsedValue, sign, original: parsedValue};
    } else if (numberPattern.test(value)) {
        return parseFloat(numberPattern.exec(value)![0])
    } else if (quotedStringPattern.test(value)) {
        return quotedStringPattern.exec(value)![0]
    } else {
        return value;
    }
}




