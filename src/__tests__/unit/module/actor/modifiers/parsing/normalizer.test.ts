import {expect} from 'chai';
import sinon, {SinonSandbox} from 'sinon';
import {foundryApi} from "../../../../../../module/api/foundryApi";
import {normalizeModifiers, ParsedExpression, ParsedModifier} from "../../../../../../module/actor/modifiers/parsing";
import {clearMappers} from "../../../../../../module/actor/modifiers/parsing/normalizer";
import {createTestRoll} from "../../../../RollMock";

describe('normalizeModifiers', () => {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        clearMappers();
        sandbox.stub(foundryApi, 'localize').callsFake((key: string) => {
            switch (key) {
                case "splittermond.derivedAttributes.speed.short":
                    return "GSW";
                case "splittermond.attributes.charisma.short":
                    return "AUS";
                case "splittermond.attributes.strength.short":
                    return "STR";
                case "splittermond.attributes.agility.short":
                    return "BEW";
                default:
                    return key;
            }
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should replace attribute strings with property paths', () => {
        const input: ParsedModifier[] = [{
            path: 'damage',
            attributes: {
                value: 'AUS',
                damageType: 'fire'
            }
        }];

        const result = normalizeModifiers(input);

        expect(result[0].attributes.value).to.deep.equal({
            propertyPath: 'attributes.charisma.value',
            sign: 1,
            original: "AUS"
        });
        expect(result[0].attributes.damageType).to.equal('fire');
    });

    it('should replace derived attribute strings in objects', () => {
        const input: ParsedModifier[] = [{
            path: 'gsw.mult',
            attributes: {
                value: {propertyPath: 'GSW', sign: 1, original: 'GSW'}
            }
        }];

        const result = normalizeModifiers(input);
        const expr = result[0].attributes.value as ParsedExpression;

        expect(expr.propertyPath).to.equal('derivedAttributes.speed.value');
    });

    it('should leave numbers and non-matching strings unchanged', () => {
        const testRoll = createTestRoll("1d2",[1]);
        const input: ParsedModifier[] = [{
            path: 'generalSkills.melee',
            attributes: {
                value: 2,
                roll: testRoll,
                bonus: 'unknownAttribute'
            }
        }];

        const result = normalizeModifiers(input);

        expect(result[0].attributes.value).to.equal(2);
        expect(result[0].attributes.roll).to.equal(testRoll);
        expect(result[0].attributes.bonus).to.equal('unknownAttribute');
    });

    it('should handle mixed value types', () => {
        const input: ParsedModifier[] = [{
            path: 'complex',
            attributes: {
                str: 'STR',
                dex: {propertyPath: 'BEW', sign: 1, original:'BEW'},
                int: 5,
                custom: 'unknown'
            }
        }];

        const result = normalizeModifiers(input);

        expect(result[0].attributes.str).to.deep.equal({
            propertyPath: 'attributes.strength.value',
            sign:1,
            original: 'STR'
        });
        expect((result[0].attributes.dex as ParsedExpression).propertyPath)
            .to.equal('attributes.agility.value');
        expect(result[0].attributes.int).to.equal(5);
        expect(result[0].attributes.custom).to.equal('unknown');
    });
});