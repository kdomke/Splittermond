import {expect} from 'chai';
import {describe, it} from 'mocha';
import {createExpressions, ParsedModifier} from "../../../../../../module/actor/modifiers/parsing";
import {AmountExpression, MultiplyExpression} from "../../../../../../module/actor/modifiers/expressions/definitions";

describe('createExpressions', () => {
    const mockSource = { existing: { path: 'value' } };

    it('should handle valid number attributes', () => {
        const modifiers: ParsedModifier[] = [{
            path: 'test.path',
            attributes: {
                numAttr: 5,
                stringAttr: 'static'
            }
        }];

        const result = createExpressions(modifiers, mockSource);

        expect(result.errors).to.have.lengthOf(0);
        expect(result.modifiers[0].attributes.numAttr).to.be.an.instanceOf(AmountExpression);
        expect(result.modifiers[0].attributes.stringAttr).to.equal('static');
    });

    it('should handle valid reference expressions', () => {
        const modifiers: ParsedModifier[] = [{
            path: 'test.path',
            attributes: {
                refAttr: {
                    propertyPath: 'existing.path',
                    sign: 1
                }
            }
        }];

        const result = createExpressions(modifiers, mockSource);

        expect(result.errors).to.have.lengthOf(0);
        const expr = result.modifiers[0].attributes.refAttr as MultiplyExpression;
        expect(expr).to.be.an.instanceOf(MultiplyExpression);
        expect(expr.right).to.deep.equal({propertyPath: 'existing.path', source:mockSource});
    });

    it('should collect validation errors for invalid references', () => {
        const modifiers: ParsedModifier[] = [{
            path: 'invalid.path',
            attributes: {
                badRef: {
                    propertyPath: 'non.existing.path',
                    sign: -1
                }
            }
        }];

        const result = createExpressions(modifiers, mockSource);

        expect(result.errors).to.have.length.greaterThan(0);
        expect(result.modifiers).to.have.lengthOf(0);
    });

    it('should handle mixed valid/invalid modifiers', () => {
        const modifiers: ParsedModifier[] = [
            {
                path: 'good.modifier',
                attributes: { valid: 10 }
            },
            {
                path: 'bad.modifier',
                attributes: { invalid: { propertyPath: 'missing.path', sign: 1 } }
            }
        ];

        const result = createExpressions(modifiers, mockSource);

        expect(result.modifiers).to.have.lengthOf(1);
        expect(result.errors).to.have.lengthOf(1);
    });

    it('should maintain attribute structure', () => {
        const complexModifier: ParsedModifier = {
            path: 'complex.path',
            attributes: {
                num: 42,
                ref: { propertyPath: 'existing.path', sign: -1 },
                str: 'constant'
            }
        };

        const result = createExpressions([complexModifier], mockSource);

        expect(result.errors).to.have.lengthOf(0);
        const attrs = result.modifiers[0].attributes;
        expect(attrs.num).to.be.an.instanceOf(AmountExpression);
        expect(attrs.ref).to.be.an.instanceOf(MultiplyExpression);
        expect(attrs.str).to.equal('constant');
    });
});
