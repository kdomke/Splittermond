import {identity} from "../../../../foundryMocks.js";
import {describe, it} from "mocha";
import {expect} from "chai";
import {splittermond} from "../../../../../../module/config.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";

Object.keys(splittermond.spellEnhancement).forEach(key => {
    describe(`SplittermondSpellRollMessage behaves correctly for ${key}`, () => {
        const method = `${key}Update`;
        it(`should have an update method for '${key}'`, () => {
            const spellRollMessage = new SplittermondSpellRollMessage({});
            const method = `${key}Update`;
            expect(method in Object.getPrototypeOf(spellRollMessage), `${method} is in SpellRollMessage`).to.be.true;
        })

        it(`should reduce the open degrees if '${key}' is updated`, () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 3
            });
            const method = `${key}Update`;

            spellRollMessage[method]();
            expect(spellRollMessage.openDegreesOfSuccess).to.be.lessThan(3);
        });

        it("should increase the open degrees if a box is updated", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 3,
                degreeOfSuccessOptions: {
                   [key]:{checked: true, disabled: false}
                }
            });

            spellRollMessage[method]();
            expect(spellRollMessage.openDegreesOfSuccess).to.be.greaterThan(3);
        });

        it("should prohibit checking if a box is disabled", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 3,
                degreeOfSuccessOptions: {
                    [key]:{checked: false, disabled: true}
                }
            });

            expect(spellRollMessage.degreeOfSuccessOptionIsCheckable(key)).to.not.be.true;
        });

        it ("should prohibit unchecking if a box is disabled", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 3,
                degreeOfSuccessOptions: {
                    [key]:{checked: true, disabled: true}
                }
            });

            expect(spellRollMessage.degreeOfSuccessOptionIsCheckable(key)).to.not.be.true;
        });

        it("should allow checking with sufficient degrees of success", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 3,
                degreeOfSuccessOptions: {
                    [key]:{checked: false, disabled: false}
                }
            });

            expect(spellRollMessage.degreeOfSuccessOptionIsCheckable(key)).to.be.true;

        })

        it ("should prohibit checking if the total degrees of success are not enough", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 0,
                degreeOfSuccessOptions: {
                    [key]:{checked: false, disabled: false}
                }
            });

            expect(spellRollMessage.degreeOfSuccessOptionIsCheckable(key)).to.not.be.true;
        });

        it ("should not prohibit unchecking if the total degrees of success are not enough", () => {
            const spellRollMessage = new SplittermondSpellRollMessage({
                totalDegreesOfSuccess: 3,
                openDegreesOfSuccess: 0,
                degreeOfSuccessOptions: {
                    [key]:{checked: true, disabled: false}
                }
            });
            expect(spellRollMessage.degreeOfSuccessOptionIsCheckable(key)).to.be.true;
        });
    });
});