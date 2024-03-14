import "../../../../foundryMocks.js"
import {afterEach, describe, it} from "mocha";
import {expect} from "chai";
import {splittermond} from "../../../../../../module/config.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {createSpellDegreeOfSuccessField, createSplittermondSpellRollMessage} from "./spellRollMessageTestHelper.js";
import sinon from "sinon";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import {identity} from "../../../../foundryMocks.js";
import {api} from "../../../../../../module/api/api.js";
import {Cost} from "../../../../../../module/util/costs/Cost.js";
import SplittermondSpellItem from "../../../../../../module/item/spell.js";
import SplittermondActor from "../../../../../../module/actor/actor.js";
import {utilGameApi} from "../../../../../../module/util/utilGameApi.js";
import {SplittermondDataModel} from "../../../../../../module/data/SplittermondDataModel.js";
import {referencesUtils} from "../../../../../../module/data/references/referencesUtils.js";

[...Object.keys(splittermond.spellEnhancement)].forEach(key => {
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

describe("SplittermondSpellRollMessage enacts focus changes correctly", () => {
    let spellRollMessage;
    let mock;
    beforeEach(() => {
        spellRollMessage = createTestRollMessage();
        mock = sinon.createStubInstance(SplittermondSpellItem);
        sinon.stub(api, "getItem").returns(mock)});
    afterEach(() => sinon.restore());

    it("should reduce exhausted focus on check", () => {
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.exhaustedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("11V3");
    });

    it("should increase exhausted focus on uncheck", () => {
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(-1, 0, false, true).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.exhaustedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("12V3");
    });

    it("should reduce consumed focus on check", () => {
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.consumedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("11V2");
    });

    it("should increase consumed focus on uncheck", () => {
        spellRollMessage.degreeOfSuccessManager.consumedFocus.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, -1, false, true).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.consumedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("12V3");
    });

    it("should reduce channeled focus on check", () => {
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, true).asPrimaryCost());

        spellRollMessage.channelizedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("K11V3");
    });

    it("should increase channeled focus on uncheck", () => {
        spellRollMessage.degreeOfSuccessManager.channelizedFocus.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(-1, 0, true, true).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, true).asPrimaryCost());

        spellRollMessage.channelizedFocusUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("K12V3");
    });

    it("should increase focus costs on spell enhancement selection", () => {
        spellRollMessage.degreeOfSuccessManager.spellEnhancement.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, true, true).asModifier();
        mock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());
        sinon.stub(mock,"enhancementCosts").get(() => "2EG/+3V1")

        spellRollMessage.spellEnhancementUpdate();

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("15V4");
    })
});

describe("SplittermondSpellRollMessage enacts damage increases correctly", () => {
    const spellRollMessage = createTestRollMessage();
    const mock = sinon.createStubInstance(SplittermondSpellItem);
    before(() => sinon.stub(api, "getItem").returns(mock));
    after(() => sinon.restore());

    it("should increase damage on check", () => {
        spellRollMessage.degreeOfSuccessManager.damage.checked = false;
        spellRollMessage.actionManager.damage.adjusted = 0;
        sinon.stub(mock,"damage").get(() =>"1W6");

        spellRollMessage.damageUpdate();

        expect(spellRollMessage.actionManager.damage.cost).to.deep.equal("1W6+1");
    });

    it("should increase damage on check", () => {
        spellRollMessage.degreeOfSuccessManager.damage.checked = true;
        spellRollMessage.actionManager.damage.adjusted = 1;
        sinon.stub(mock,"damage").get(() =>"1W6");

        spellRollMessage.damageUpdate();

        expect(spellRollMessage.actionManager.damage.cost).to.deep.equal("1W6");
    });
});

describe("SplittermondSpellRollMessage enacts tick reduction correctly", () => {
    const spellRollMessage = createTestRollMessage();
    const mock = sinon.createStubInstance(SplittermondSpellItem);
    before(() => sinon.stub(api, "getItem").returns(mock));
    after(() => sinon.restore());

    it("should reduce ticks on check", () => {
        spellRollMessage.degreeOfSuccessManager.castDuration.checked = false;
        spellRollMessage.actionManager.ticks.adjusted = 3;

        spellRollMessage.castDurationUpdate();

        expect(spellRollMessage.actionManager.ticks.adjusted).to.equal(2);
    });

    it("should increase ticks on uncheck", () => {
        spellRollMessage.degreeOfSuccessManager.castDuration.checked = true;
        spellRollMessage.actionManager.ticks.adjusted = 1;

        spellRollMessage.castDurationUpdate();

        expect(spellRollMessage.actionManager.ticks.adjusted).to.equal(2);
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
        sinon.stub(api, "getActor").returns({spendSplinterpoint: () => ({getBonus: () => 5})})

        underTest.useSplinterpoint();

        expect(underTest.actionManager.splinterPoint.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.totalDegreesOfSuccess).to.equal(2);
    });

    it("should call actor consume focus", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.focus.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        underTest.actionManager.focus.adjusted = new Cost(0,0,false).asModifier();
        const stubbedActor = sinon.createStubInstance(SplittermondActor);
        stubbedActor.consumeCost = sinon.spy();
        sinon.stub(api, "getActor").returns(stubbedActor);
        sinon.stub(api, "getItem").returns({
            name: "spell",
            getCostsForFinishedRoll: () => new Cost(1, 1, true).asPrimaryCost(),
        });

        underTest.consumeCosts();

        expect(stubbedActor.consumeCost.called).to.be.true;
        expect(stubbedActor.consumeCost.firstCall.args).to.contain("K2V1")
    });

    it("should disable focus degree of success options", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.focus.casterReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(api, "getActor").returns({consumeCost: sinon.spy()});
        sinon.stub(api, "getItem").returns({
            name: "spell",
            getCostsForFinishedRoll: () => (new Cost(1, 0, false).asPrimaryCost())
        });

        underTest.consumeCosts();

        expect(underTest.actionManager.focus.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("exhaustedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("channelizedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("consumedFocus")).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("spellEnhancement")).to.be.true;
    });

    it("should disable damage degree of success options", async () => {
        const underTest = createTestRollMessage();
        const mock = sinon.createStubInstance(SplittermondSpellItem)
        sinon.stub(mock,"damage").get(() => "1W6");
        sinon.stub(utilGameApi, "roll").returns({evaluate: () => ({total: 3, dice:[{total: 3}]})});
        sinon.stub(api, "getItem").returns(mock);

        await underTest.applyDamage();

        expect(underTest.actionManager.damage.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("damage")).to.be.true;
        expect(utilGameApi.roll.firstCall.args[0]).to.equal("1d6+0");
    });

    it("should call ticks with value on the actor", () => {
        const underTest = createTestRollMessage();
        const addTicksMock = sinon.stub().withArgs(4);
        underTest.actionManager.ticks.actorReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        underTest.actionManager.ticks.adjusted = 4;
        sinon.stub(api, "getActor").returns({addTicks: addTicksMock});

        underTest.advanceToken();

        expect(api.getActor.called).to.be.true;
        expect(addTicksMock.firstCall.args).to.contain(4);
    });

    it("should disable token advancement degree of success options", () => {
        const underTest = createTestRollMessage();
        underTest.actionManager.ticks.actorReference = new AgentReference({id: "2", sceneId: "1", type: "actor"});
        sinon.stub(api, "getActor").returns({addTicks: sinon.spy()});

        underTest.advanceToken();

        expect(underTest.actionManager.ticks.used).to.be.true;
        expect(underTest.degreeOfSuccessManager.isUsed("castDuration")).to.be.true;
    });

    it("should pass fumbles to the fumble action", () => {
        const manager = createTestRollMessage();
        manager.actionManager.magicFumble.rollFumble = sinon.stub(manager.actionManager.magicFumble, "rollFumble");

        manager.rollMagicFumble();

        expect(manager.actionManager.magicFumble.rollFumble.called).to.be.true;
    });

    it("should not alter anything for active defense", () => {
        const manager = createTestRollMessage();
        const mockDefender = sinon.createStubInstance(SplittermondActor);
        const mockReference = sinon.createStubInstance(AgentReference);
        mockReference.getAgent.returns(mockDefender);
        const mockSpell = sinon.createStubInstance(SplittermondSpellItem);
        sinon.stub(mockSpell,"difficulty").get(() => "VTD");
        sinon.stub(referencesUtils, "findBestUserActor").returns(mockReference);
        sinon.stub(api, "getItem").returns(mockSpell);
        sinon.spy(SplittermondDataModel.prototype,"updateSource");

        manager.activeDefense();

        expect(mockDefender.activeDefenseDialog.called).to.be.true;
        expect(SplittermondDataModel.prototype.updateSource.called).to.be.false;
    })

});

function createTestRollMessage() {
    const spellRollMessage = createSplittermondSpellRollMessage();
    for (const key in {...splittermond.spellEnhancement, spellEnhancement: {}}) {
        spellRollMessage.degreeOfSuccessManager[key] = createSpellDegreeOfSuccessField(spellRollMessage.degreeOfSuccessManager);
    }
    return spellRollMessage;
}
