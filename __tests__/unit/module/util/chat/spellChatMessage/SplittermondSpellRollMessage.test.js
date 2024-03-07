import "../../../../foundryMocks.js"

import {describe, it, afterEach} from "mocha";
import {expect} from "chai";
import {splittermond} from "../../../../../../module/config.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {createSpellDegreeOfSuccessField, createSplittermondSpellRollMessage} from "./spellRollMessageTestHelper.js";
import sinon from "sinon";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import {identity} from "../../../../foundryMocks.js";
import {referencesApi} from "../../../../../../module/data/references/referencesApi.js";

[...Object.keys(splittermond.spellEnhancement), "spellEnhancement"].forEach(key => {
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

describe("SplittermondSpellRollMessage actions", () => {
    afterEach(() => sinon.restore());
    it("should upgrade roll total by splinterpoint usage", () => {
        game.i18n = {localize: identity};
        const underTest = createTestRollMessage();
        underTest.renderer.checkReport = {
            roll: {total: 16, dice: [{total: 12}]},
            skill: {points: 1},
            difficulty: 15,
            rollType: "standard"
        };
        underTest.actionManager.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(referencesApi, "getActor").returns({spendSplinterpoint: () => ({getBonus: () => 5})})

        underTest.useSplinterpoint();

        expect(underTest.actionManager.splinterPoint.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.totalDegreesOfSuccess).to.equal(2);
    });

    it("should call actor consume focus", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(referencesApi, "getActor").returns({consumeCost: sinon.spy()});

        underTest.consumeCosts();

        expect(referencesApi.getActor.called).to.be.true;
    });

    it("should disable focus degree of success options", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(referencesApi, "getActor").returns({consumeCost: sinon.spy()});

        underTest.consumeCosts();

        expect(underTest.actionManager.focus.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("exhaustedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("channelizedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("consumedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("spellEnhancement")).to.be.true;
    });

    it("should disable damage degree of success options", () => {
        const underTest = createTestRollMessage();
        sinon.stub(referencesApi, "getItem").returns({name: "spell"});

        underTest.applyDamage();

        expect(underTest.actionManager.damage.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("damage")).to.be.true;
    });

    it("should call ticks with value on the actor",() => {
        const underTest = createTestRollMessage();
        const addTicksMock = sinon.stub().withArgs(4);
        underTest.actionManager.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        underTest.actionManager.ticks.adjusted = 4;
        sinon.stub(referencesApi, "getActor").returns({addTicks: addTicksMock});

        underTest.advanceToken();

        expect(referencesApi.getActor.called).to.be.true;
        expect(addTicksMock.called).to.be.true;
    });

    it("should disable token advancement degree of success options", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(referencesApi, "getActor").returns({addTicks: sinon.spy()});

        underTest.advanceToken();

        expect(underTest.actionManager.ticks.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("castDuration")).to.be.true;
    });

});

function createTestRollMessage() {
    const spellRollMessage = createSplittermondSpellRollMessage();
    for (const key in {...splittermond.spellEnhancement, spellEnhancement: {}}) {
        spellRollMessage.degreeOfSuccessManager[key] = createSpellDegreeOfSuccessField(spellRollMessage.degreeOfSuccessManager);
    }
    return spellRollMessage;
}
