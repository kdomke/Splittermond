import "../../../../foundryMocks.js"
import {afterEach, describe, it} from "mocha";
import {expect} from "chai";
import {splittermond} from "../../../../../../module/config.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {
    injectParent,
    setUpMockActor,
    setUpMockSpellSelfReference,
    withToObjectReturnsSelf
} from "./spellRollMessageTestHelper.js";
import sinon from "sinon";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import {identity} from "../../../../foundryMocks.js";
import {foundryApi} from "../../../../../../module/api/foundryApi.js";
import {Cost} from "../../../../../../module/util/costs/Cost.js";
import SplittermondActor from "../../../../../../module/actor/actor.js";
import {SplittermondDataModel} from "../../../../../../module/data/SplittermondDataModel.js";
import {referencesUtils} from "../../../../../../module/data/references/referencesUtils.js";


[...Object.keys(splittermond.spellEnhancement)].forEach(key => {
    describe(`SplittermondSpellRollMessage behaves correctly for ${key}`, () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });
        afterEach(() => sandbox.restore());
        const method = `${key}Update`;
        it(`should have an update method for '${key}'`, () => {
            const spellRollMessage = new SplittermondSpellRollMessage({});
            const method = `${key}Update`;
            expect(method in Object.getPrototypeOf(spellRollMessage), `${method} is in SpellRollMessage`).to.be.true;
        })

        it(`should delegate to the degree of success manager for ${key}`, () => {
            const {spellRollMessage} = createTestRollMessage(sandbox);
            spellRollMessage.degreeOfSuccessManager = sinon.spy(spellRollMessage.degreeOfSuccessManager);
            spellRollMessage[method]({multiplicity: 1});

            expect(spellRollMessage.degreeOfSuccessManager.alterCheckState.called).to.be.true;
        })
    });
});

describe("SplittermondSpellRollMessage enacts focus changes correctly", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    it("should reduce exhausted focus on check", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus1.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.exhaustedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("11V3");
    });

    it("should increase exhausted focus on uncheck", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus1.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(-1, 0, false, true).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.exhaustedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("12V3");
    });

    it("should reduce consumed focus on check", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus1.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.consumedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("11V2");
    });

    it("should increase consumed focus on uncheck", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.consumedFocus1.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, -1, false, true).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());

        spellRollMessage.consumedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("12V3");
    });

    it("should reduce channeled focus on check", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.exhaustedFocus1.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, true).asPrimaryCost());

        spellRollMessage.channelizedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("K11V3");
    });

    it("should increase channeled focus on uncheck", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.channelizedFocus1.checked = true;
        spellRollMessage.actionManager.focus.adjusted = new Cost(-1, 0, true, true).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, true).asPrimaryCost());

        spellRollMessage.channelizedFocusUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("K12V3");
    });

    it("should increase focus costs on spell enhancement selection", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.spellEnhancement.checked = false;
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, true, true).asModifier();
        spellMock.getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());
        sinon.stub(spellMock, "enhancementCosts").get(() => "2EG/+3V1")

        spellRollMessage.spellEnhancementUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.focus.cost).to.deep.equal("15V4");
    });
});

describe("SplittermondSpellRollMessage enacts damage increases correctly", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    it("should increase damage on check", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.damage1.checked = false;
        spellRollMessage.actionManager.damage.adjusted = 0;
        sinon.stub(spellMock, "damage").get(() => "1W6");

        spellRollMessage.damageUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.damage.cost).to.deep.equal("1W6+1");
    });

    it("should increase damage on check", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.damage1.checked = true;
        spellRollMessage.actionManager.damage.adjusted = 1;
        sinon.stub(spellMock, "damage").get(() => "1W6");

        spellRollMessage.damageUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.damage.cost).to.deep.equal("1W6");
    });
});

describe("SplittermondSpellRollMessage enacts tick reduction correctly", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    it("should reduce ticks on check", () => {
        const {spellRollMessage} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.castDuration1.checked = false;
        spellRollMessage.actionManager.ticks.adjusted = 3;

        spellRollMessage.castDurationUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.ticks.adjusted).to.equal(2);
    });

    it("should increase ticks on uncheck", () => {
        const {spellRollMessage} = createTestRollMessage(sandbox);
        spellRollMessage.degreeOfSuccessManager.castDuration1.checked = true;
        spellRollMessage.actionManager.ticks.adjusted = 1;

        spellRollMessage.castDurationUpdate({multiplicity: 1});

        expect(spellRollMessage.actionManager.ticks.adjusted).to.equal(2);
    });
});

describe("SplittermondSpellRollMessage actions", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    it("should upgrade roll total by splinterpoint usage", async () => {
        game.i18n = {localize: identity};
        const {spellRollMessage, spellMock, actorMock} = createTestRollMessage(sandbox);
        spellRollMessage.checkReport.degreesOfSuccess = 1;
        spellRollMessage.checkReport.roll = {...spellRollMessage.checkReport.roll, total: 16, dice: [{total: 12}]};
        spellRollMessage.checkReport.skill = {...spellRollMessage.checkReport.skill, points: 1};
        spellRollMessage.checkReport.difficulty = 15;
        spellRollMessage.checkReport.rollType = "standard";
        spellRollMessage.checkReport.skill = {...spellRollMessage.checkReport.skill, name: "skill"};

        actorMock.spendSplinterpoint.returns({getBonus: () => 5});

        await spellRollMessage.useSplinterpoint();

        expect(spellRollMessage.actionManager.splinterPoint.used).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.totalDegreesOfSuccess).to.equal(2);
    });

    it("should call actor consume focus", () => {
        const {spellRollMessage, spellMock, actorMock} = createTestRollMessage(sandbox);
        spellRollMessage.actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
        actorMock.consumeCost = sinon.spy();
        spellMock.getCostsForFinishedRoll.returns(new Cost(1, 1, true).asPrimaryCost());

        spellRollMessage.consumeCosts();

        expect(actorMock.consumeCost.called).to.be.true;
        expect(actorMock.consumeCost.firstCall.args).to.contain("K2V1")
    });

    it("should disable focus degree of success options", () => {
        const {spellRollMessage, spellMock, actorMock} = createTestRollMessage(sandbox);
        spellRollMessage.actionManager.focus.casterReference = new AgentReference({
            id: "2",
            sceneId: "1",
            type: "actor"
        });
        spellMock.getCostsForFinishedRoll.returns(new Cost(1, 0, false).asPrimaryCost());

        spellRollMessage.consumeCosts();

        expect(spellRollMessage.actionManager.focus.used).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("exhaustedFocus")).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("channelizedFocus")).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("consumedFocus")).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("spellEnhancement")).to.be.true;
    });

    it("should disable damage degree of success options", async () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        sandbox.stub(spellMock, "damage").get(() => "1W6");
        spellMock.system = {...spellMock,features : ""};
        sandbox.stub(foundryApi, "roll").returns({evaluate: () => ({total: 3, dice: [{total: 3}]})});

        await spellRollMessage.applyDamage();

        expect(spellRollMessage.actionManager.damage.used).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("damage")).to.be.true;
        expect(foundryApi.roll.firstCall.args[0]).to.equal("1d6+0");
    });

    it("should call ticks with value on the actor", () => {
        const {spellRollMessage, actorMock} = createTestRollMessage(sandbox);
        const addTicksMock = sinon.stub().withArgs(4);
        actorMock.addTicks = addTicksMock;
        spellRollMessage.actionManager.ticks.adjusted = 4;

        spellRollMessage.advanceToken();

        expect(actorMock.addTicks.called).to.be.true;
        expect(addTicksMock.firstCall.args).to.contain(4);
    });

    it("should disable token advancement degree of success options", () => {
        const {spellRollMessage, actorMock} = createTestRollMessage(sandbox);

        spellRollMessage.advanceToken();

        expect(spellRollMessage.actionManager.ticks.used).to.be.true;
        expect(spellRollMessage.degreeOfSuccessManager.isUsed("castDuration")).to.be.true;
        expect(actorMock.addTicks.called).to.be.true;
    });

    it("should pass fumbles to the fumble action", () => {
        const {spellRollMessage} = createTestRollMessage(sandbox);
        spellRollMessage.actionManager.magicFumble.rollFumble = sinon.stub(spellRollMessage.actionManager.magicFumble, "rollFumble");

        spellRollMessage.rollMagicFumble();

        expect(spellRollMessage.actionManager.magicFumble.rollFumble.called).to.be.true;
    });

    it("should not alter anything for active defense", () => {
        const {spellRollMessage, spellMock} = createTestRollMessage(sandbox);
        const mockDefender = sinon.createStubInstance(SplittermondActor);
        const mockReference = sinon.createStubInstance(AgentReference);
        mockReference.getAgent.returns(mockDefender);
        sinon.stub(spellMock, "difficulty").get(() => "VTD");
        sinon.stub(referencesUtils, "findBestUserActor").returns(mockReference);
        sinon.spy(SplittermondDataModel.prototype, "updateSource");

        spellRollMessage.activeDefense();

        expect(mockDefender.activeDefenseDialog.called).to.be.true;
        expect(SplittermondDataModel.prototype.updateSource.called).to.be.false;
    })

});

function createTestRollMessage(sandbox) {
    return withToObjectReturnsSelf(() => {
        const spellMock = setUpMockSpellSelfReference(sandbox);
        const actorMock = setUpMockActor(sandbox);
        linkSpellAndActor(spellMock, actorMock);
        setNecessaryDefaultsForSpellproperties(spellMock, sandbox);

        const checkReport = {degreeOfSuccess: 3};

        const spellRollMessage = SplittermondSpellRollMessage.createRollMessage(
            spellMock,
            checkReport
        )
        injectParent(spellRollMessage);
        return {spellRollMessage, spellMock, actorMock};
    });
}

function linkSpellAndActor(spellMock, actorMock) {
    actorMock.items = {get: () => spellMock};
    spellMock.actor = actorMock;
}

function setNecessaryDefaultsForSpellproperties(spellMock, sandbox) {
    sandbox.stub(spellMock, "degreeOfSuccessOptions").get(() => sandbox.stub().returns(true))
    sandbox.stub(spellMock, "enhancementCosts").get(() => "1EG/+1V1");
    sandbox.stub(spellMock, "castDuration").get(() => 3);
    sandbox.stub(spellMock, "description").get(() => "description");
    spellMock.name = "name";
}
