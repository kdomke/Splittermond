import {expect} from 'chai';
import sinon, {SinonSandbox} from 'sinon';
import {foundryApi} from "../../../../../../module/api/foundryApi";
import {clearMappers, normalizeKey, normalizeValue} from "../../../../../../module/actor/modifiers/parsing/normalizer";

describe('normalizeModifiers', () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        clearMappers();
        sandbox.stub(foundryApi, 'localize').callsFake((key: string) => {
            switch (key) {
                case "splittermond.modifiers.keys.emphasis":
                    return "Schwerpunkt";
                case "splittermond.modifiers.keys.damageType":
                    return "Schadensart";
                case "splittermond.modifiers.keys.value":
                    return "Wert";
                case "splittermond.derivedAttribute.speed.short":
                    return "GSW";
                case "splittermond.attribute.charisma.short":
                    return "AUS";
                case "splittermond.attribute.strength.short":
                    return "STR";
                case "splittermond.attribute.agility.short":
                    return "BEW";
                default:
                    return key;
            }
        });
    });

    afterEach(() => {
        sandbox.restore();
    });
    [
        ["Schadensart", "damageType"],
        ["Wert", "value"],
        ["Schwerpunkt", "emphasis"],
        ["AUS", "AUS"],
        ["GSW", "GSW"]

    ].forEach(([key, expected]) => {
        it(`should replace key '${key}' with`, () => {
            expect(normalizeKey(key)).to.deep.equal(expected);
        });
    });

    ([
        [{propertyPath: "AUS", sign: 1, original: 'AUS'}, {
            propertyPath: "attributes.charisma.value",
            sign: 1,
            original: "AUS"
        }],
        ["+AUS", {propertyPath: "attributes.charisma.value", sign: 1, original: "+AUS"}],
        ["-AUS", {propertyPath: "attributes.charisma.value", sign: -1, original: "-AUS"}],
    ] as const).forEach(([value, expected]) => {
        it(`should replace value'${value}'`, () => {
            expect(normalizeValue(value)).to.deep.equal(expected);
        });
    });
});