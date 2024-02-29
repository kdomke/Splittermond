import "../../../../foundryMocks.js"

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
});

describe("SplittermondSpellRollMessage actions", () =>{
    it("should defer splinterpoint usage to the action manager",() => {
        const underTest = createTestRollMessage();

        underTest.useSplinterpoint();

        expect(underTest.actionManager.splinterPoint.used).to.be.true;
    });

    it("should disable focus degree of success options", () =>{
        const underTest = createTestRollMessage();

        underTest.consumeCosts();

        expect(underTest.actionManager.focus.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("exhaustedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("channelizedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("consumedFocus")).to.be.true;
    });

    it("should disable damage degree of success options", () => {
        const underTest = createTestRollMessage();

        underTest.applyDamage();

        expect(underTest.actionManager.damage.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("damage")).to.be.true;
    });

    it("should disable token advancement degree of success options", () => {
        const underTest = createTestRollMessage();

        underTest.advanceToken();

        expect(underTest.actionManager.ticks.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("castDuration")).to.be.true;
    });
});
function createTestRollMessage() {
    const spellRollMessage = createSplittermondSpellRollMessage();
    for (const key in splittermond.spellEnhancement) {
        spellRollMessage.degreeOfSuccessManager[key] = createSpellDegreeOfSuccessField(spellRollMessage.degreeOfSuccessManager);
    }
    return spellRollMessage;
}
