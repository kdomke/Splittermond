import {parseModifiers} from "../../../../../../module/actor/modifiers/parsing/parser";
import {expect} from "chai";


describe('Modifier Parser', () => {

    ([
        ["AUS +1", {path: "aus", attributes: {value: 1}}],
        ["bonuscap -1", {path: "bonuscap", attributes: {value: -1}}],
        ["speed.multiplier 2", {path: "speed.multiplier", attributes: {value: 2}}],
        ["generalskills.firemagic/Schaden +2", {
            path: "generalskills.firemagic",
            attributes: {emphasis: "Schaden", value: 2}
        }],
    ] as const).forEach(([input, expected]) => {
        it(`should parse the old style ${input}`, () => {
                const parseResult = parseModifiers(input)
                expect(parseResult).to.deep.equal([expected])
            }
        );

        it(`should parse ${input} with random capitalization`, () => {
            const enlargedPath = input.substring(0, 2) + input[2].toUpperCase() + input.substring(3)
            const parseResult = parseModifiers(enlargedPath)
            expect(parseResult).to.deep.equal([expected])
        });
    });
    ([
        ["AUS value=${GSW}", {path: "aus", attributes: {value: {propertyPath: "GSW"}}}],
        ["damage weapon='Fulnisches Doppelschwert' +1", {
            path: "damage",
            attributes: {weapon: "Fulnisches Doppelschwert", value: 1}
        }],
        ["generalSkills.firemagic emphasis=Schaden value=2", {
            path: "generalskills.firemagic",
            attributes: {value: 2, emphasis: "Schaden"}
        }],
        ['handicap.shield.mod value="3"', {path: "handicap.shield.mod", attributes: {value: 3}}],
    ] as const).forEach(([input, expected]) => {
        it(`should parse the new style mod '${input}'`, () => {
            const parseResult = parseModifiers(input)
            expect(parseResult).to.deep.equal([expected])
        });
    });

    ["", null, undefined].forEach(input => {
        it(`should return empty array for empty input '${input}'`, () => {
            const parseResult = parseModifiers(input);
            expect(parseResult).to.deep.equal([]);
        });
    });

    ["AUS a='b\" 1", "AUS a='=' 1", "AUS ==1 1", "AUS", "AUS=1", 'damage/Sehr gute Handschuhe damageType="fire" value=1'].forEach(input => {
        it(`should return error for invalid modifier format ${input}`, () => {
            expect(() => parseModifiers(input)).to.throw(`Could not parse modifiers, found errors: Modifier '${input}' is not of a modifier format`);
        });
    });

    it('should return error for duplicate emphasis declaration', () => {
        const input = 'AUS/Schaden emphasis="Schaden" +1';
        expect(() => parseModifiers(input)).to.throw('Could not parse modifiers, found errors: Modifier \'AUS/Schaden emphasis="Schaden" +1\' contains duplicate declaration of emphasis');
    });

    it('should return error for duplicate attribute declaration', () => {
        const input = 'damage damageType="fire" damageType=\'light\' +1';
        expect(() => parseModifiers(input)).to.throw('Could not parse modifiers, found errors: Attribute \'damageType\' exists several times in modifier.');
    });

    it('should return error for duplicate value declaration', () => {
        const input = 'AUS value=2 +1';
        expect(() => parseModifiers(input)).to.throw('Could not parse modifiers, found errors: Modifier \'AUS value=2 +1\' contains duplicate declaration of value');
    });

    it('should return error for missing value declaration', () => {
        const input = 'AUS emphasis=Schaden';
        expect(() => parseModifiers(input)).to.throw('Could not parse modifiers, found errors: Modifier \'AUS emphasis=Schaden\' contains no declaration of value');
    });

    ["AUS 1='a' 1"].forEach(input => {
        it(`should return error for invalid key ${input}`, () => {
            expect(() => parseModifiers(input)).to.throw('Could not parse modifiers, found errors: Modifier \'AUS emphasis=Schaden\' contains no declaration of value');
        });
    });

})