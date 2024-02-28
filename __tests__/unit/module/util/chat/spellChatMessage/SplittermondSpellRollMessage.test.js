import {describe, it} from "mocha";
import {expect} from "chai";
import {splittermond} from "../../../../../../module/config.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {createSpellDegreeOfSuccessField, createSplittermondSpellRollMessage} from "./spellRollMessageTestHelper.js";
import sinon from "sinon";

Object.keys(splittermond.spellEnhancement).forEach(key => {
    describe(`SplittermondSpellRollMessage behaves correctly for ${key}`, () => {
        const method = `${key}Update`;
        it(`should have an update method for '${key}'`, () => {
            const spellRollMessage = new SplittermondSpellRollMessage({});
            const method = `${key}Update`;
            expect(method in Object.getPrototypeOf(spellRollMessage), `${method} is in SpellRollMessage`).to.be.true;
        })

        it("should delegate spell costs to the degree of success manager", () => {
            const spellRollMessage = createTestRollMessage();
            spellRollMessage.degreeOfSuccessManager = sinon.spy(spellRollMessage.degreeOfSuccessManager);
            spellRollMessage[method]();

            expect(spellRollMessage.degreeOfSuccessManager.alterCheckState.called).to.be.true;
        })
    });

    function createTestRollMessage() {
        const spellRollMessage = createSplittermondSpellRollMessage();
        for (key in splittermond.spellEnhancement) {
            spellRollMessage.degreeOfSuccessManager[key] = createSpellDegreeOfSuccessField(spellRollMessage.degreeOfSuccessManager);
        }
        return spellRollMessage;
    }
});