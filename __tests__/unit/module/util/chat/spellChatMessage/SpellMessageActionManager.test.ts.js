import "../../../../foundryMocks.js"

import {describe, it} from "mocha";
import {expect} from "chai";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import sinon from "sinon";
import {Cost} from "../../../../../../module/util/costs/Cost.js";
import {
    SpellMessageActionsManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageActionsManager.js";
import {
    injectParent,
    setUpCheckReportSelfReference,
    setUpMockActor,
    setUpMockSpellSelfReference,
    withToObjectReturnsSelf
} from "./spellRollMessageTestHelper.js";

describe("SpellActionManager", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    describe("Ticks", () => {
        it("should subtract from the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox)
            actionManager.ticks.adjusted = 3;
            actionManager.ticks.used = false;

            actionManager.ticks.subtract(3);

            expect(actionManager.ticks.adjusted).to.equal(0);
        });

        it("should add to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox)
            actionManager.ticks.adjusted = 3;
            actionManager.ticks.used = false;

            actionManager.ticks.add(3);

            expect(actionManager.ticks.adjusted).to.equal(6);
        });

        it("subtraction should be barred from alteration after usage", () => {
            const actionManager = createSpellActionManager(sandbox)
            actionManager.ticks.adjusted = 3;
            actionManager.ticks.used = true;

            actionManager.ticks.subtract(3);

            expect(actionManager.ticks.adjusted).to.equal(3);
        });

        it("add should be barred from alteration after usage", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.adjusted = 3;
            actionManager.ticks.used = true;

            actionManager.ticks.add(3);

            expect(actionManager.ticks.adjusted).to.equal(3);
        });

        it("should return a cost minmum of 1", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.adjusted = 0;

            expect(actionManager.ticks.cost).to.equal("1");
        });
    });

    describe("Damage", () => {
        it("should add Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.adjusted = 0;
            sandbox.stub(actionManager.damage.itemReference.getItem(), "damage").get(() => "1W6+1");


            actionManager.damage.addDamage(1)

            expect(actionManager.damage.cost).to.equal("1W6+2")
        });

        it("should subtract Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.adjusted = 2;
            sandbox.stub(actionManager.damage.itemReference.getItem(), "damage").get(() => "1W6+1");

            actionManager.damage.subtractDamage(1)

            expect(actionManager.damage.cost).to.equal("1W6+2")
        });

        it("should not allow addition if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.used = true
            actionManager.damage.adjusted = 3;

            actionManager.damage.addDamage(1)

            expect(actionManager.damage.adjusted).to.equal(3)
        });

        it("should not allow subtraction if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.used = true;
            actionManager.damage.adjusted = 3;

            actionManager.damage.subtractDamage(1);

            expect(actionManager.damage.adjusted).to.equal(3);
        });
    });


    describe("Focus", () => {
        it("should pass adjusted focus to the actor", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
            actionManager.focus.spellReference.getItem().getCostsForFinishedRoll.returns(new Cost(9, 3, 0).asPrimaryCost());
            actionManager.focus.spellReference.getItem().name = "spell";

            actionManager.focus.subtractCost("1V1");
            actionManager.consumeFocus();

            expect(actionManager.focus.casterReference.getAgent().consumeCost.lastCall.args[1]).to.contain("11V2")
        });
        it("should add Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.adjusted = new Cost(0, 1, false, true).asModifier();

            actionManager.focus.addCost("1V1")


            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 2, false, true).asModifier());
        });

        it("should subtract Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.adjusted = new Cost(0, 2, false, true).asModifier();

            actionManager.focus.subtractCost("1V1")


            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 1, false, true).asModifier());
        });

        it("should apply strict costs", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.adjusted = new Cost(0, 1, false, true).asModifier();

            actionManager.focus.addCost("K1V1")

            expect(actionManager.focus.adjusted).to.deep.equal({
                _consumed: 1,
                _channeled: 0,
                _exhausted: 0,
                _channeledConsumed: 1,
            })
        });

        it("should render a minimum cost of 1", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.adjusted = new Cost(0, -3, false, true).asModifier();
            actionManager.focus.spellReference.getItem()
                .getCostsForFinishedRoll.returns(new Cost(0, 2, 0).asPrimaryCost());

            expect(actionManager.focus.cost).to.equal("1");
        });

        it("should not allow addition if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.used = true
            actionManager.focus.adjusted = new Cost(0, 3, false, true).asModifier();

            actionManager.focus.addCost("1")

            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 3, false, true).asModifier());
        });

        it("should not allow subtraction if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.used = true
            actionManager.focus.adjusted = "3";

            actionManager.focus.subtractCost("1");

            expect(actionManager.focus.adjusted).to.equal("3")
        });

    });

    it("should react to fumbles", () => {
        const actionManager = createSpellActionManager(sandbox);
        actionManager.magicFumble.checkReportReference.get().isFumble = true;

        expect(actionManager.magicFumble.available).to.be.true;
        expect(actionManager.splinterPoint.available).to.be.false;
    });

    it("should pass fumbles to the actor", () => {
        const actionManager = createSpellActionManager(sandbox);
        actionManager.magicFumble.checkReportReference.get().skill = {name: "skillName"};

        actionManager.rollMagicFumble();

        expect(actionManager.magicFumble.casterReference.getAgent().rollMagicFumble.callCount).to.equal(1);
    })

    it("should spend splinterpoint on actor", () => {
        const actionManager = createSpellActionManager(sandbox);
        const getBonusFunction = sandbox.mock().returns(3);
        actionManager.splinterPoint.actorReference.getAgent().spendSplinterpoint.returns({getBonus: getBonusFunction})
        actionManager.splinterPoint.checkReportReference.get().skill = {name: "skillName"};

        actionManager.useSplinterPoint();

        expect(getBonusFunction.callCount).to.equal(1);
        expect(actionManager.splinterPoint.used).to.be.true;
    });
});

export function createSpellActionManager(sandbox) {
    const spellReference = setUpMockSpellSelfReference(sandbox);
    const actorMock = setUpMockActor(sandbox);

    actorMock.items = {get: () => spellReference};
    spellReference.getItem().actor = actorMock;

    const checkReportReference = setUpCheckReportSelfReference();

    return withToObjectReturnsSelf(() => {
        const casterReference = new AgentReference({type: "actor"});

        const actionManager = SpellMessageActionsManager.initialize(spellReference, checkReportReference);

        injectParent(actionManager);
        return actionManager;
    });
}