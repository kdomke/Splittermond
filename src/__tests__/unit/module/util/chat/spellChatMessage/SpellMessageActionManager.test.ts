import "__tests__/unit/foundryMocks.js"

import {describe, it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {Cost} from "module/util/costs/Cost";
import {SpellMessageActionsManager} from "module/util/chat/spellChatMessage/SpellMessageActionsManager";
import {
    injectParent,
    setUpCheckReportSelfReference,
    setUpMockActor,
    setUpMockSpellSelfReference,
    WithMockedRefs,
    withToObjectReturnsSelf
} from "./spellRollMessageTestHelper.js";
import {parseCostString} from "module/util/costs/costParser.js";
import SplittermondItem from "module/item/item";

describe("SpellActionManager", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    describe("Ticks", () => {
        it("should subtract from the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.updateSource({adjusted: 3});
            actionManager.ticks.updateSource({used: false});

            actionManager.ticks.subtract(3);

            expect(actionManager.ticks.adjusted).to.equal(0);
        });

        it("should add to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.updateSource({adjusted: 3});
            actionManager.ticks.updateSource({used: false});

            actionManager.ticks.add(3);

            expect(actionManager.ticks.adjusted).to.equal(6);
        });

        it("subtraction should be barred from alteration after usage", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.updateSource({adjusted: 3});
            actionManager.ticks.updateSource({used: true});

            actionManager.ticks.subtract(3);

            expect(actionManager.ticks.adjusted).to.equal(3);
        });

        it("add should be barred from alteration after usage", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.updateSource({adjusted: 3});
            actionManager.ticks.updateSource({used: true});

            actionManager.ticks.add(3);

            expect(actionManager.ticks.adjusted).to.equal(3);
        });

        it("should return a cost minimum of 1", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.ticks.updateSource({adjusted: 0});

            expect(actionManager.ticks.cost).to.equal("1");
        });
    });

    describe("Damage", () => {
        it("should add Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.updateSource({adjusted: 0});
            sandbox.stub(actionManager.damage.itemReference.getItem(), "damage").get(() => "1W6+1");


            actionManager.damage.addDamage(1)

            expect(actionManager.damage.cost).to.equal("1W6+2")
        });

        it("should subtract Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.updateSource({adjusted: 2});
            sandbox.stub(actionManager.damage.itemReference.getItem(), "damage").get(() => "1W6+1");

            actionManager.damage.subtractDamage(1)

            expect(actionManager.damage.cost).to.equal("1W6+2")
        });

        it("should not allow addition if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.updateSource({used: true});
            actionManager.damage.updateSource({adjusted: 3});

            actionManager.damage.addDamage(1)

            expect(actionManager.damage.adjusted).to.equal(3)
        });

        it("should not allow subtraction if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.damage.updateSource({used: true});
            actionManager.damage.updateSource({adjusted: 3});

            actionManager.damage.subtractDamage(1);

            expect(actionManager.damage.adjusted).to.equal(3);
        });
    });


    describe("Focus", () => {
        const modifier = parseCostString("1V1", true).asModifier();
        it("should pass adjusted focus to the actor", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({adjusted: new Cost(0, 0, false).asModifier()});
            actionManager.focus.spellReference.getItem().getCostsForFinishedRoll.returns(new Cost(9, 3, false).asPrimaryCost());
            //@ts-expect-error name exists but its not typed yet
            actionManager.focus.spellReference.getItem().name = "spell";

            actionManager.focus.subtractCost(modifier);
            actionManager.consumeFocus();

            expect(actionManager.focus.casterReference.getAgent().consumeCost.lastCall.args[1]).to.contain("11V2")
        });
        it("should add Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({adjusted: new Cost(0, 1, false, true).asModifier()});

            actionManager.focus.addCost(modifier)


            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 2, false, true).asModifier());
        });

        it("should subtract Costs to the adjusted value", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({adjusted: new Cost(0, 2, false, true).asModifier()});

            actionManager.focus.subtractCost(modifier)


            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 1, false, true).asModifier());
        });

        it("should apply strict costs", () => {
            const channeledModifier = parseCostString("K1V1", true).asModifier();
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({adjusted: new Cost(0, 1, false, true).asModifier()});

            actionManager.focus.addCost(channeledModifier)

            expect(actionManager.focus.adjusted).to.deep.equal({
                _consumed: 1,
                _channeled: 0,
                _exhausted: 0,
                _channeledConsumed: 1,
            })
        });

        it("should render a minimum cost of 1", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({adjusted: new Cost(0, -3, false, true).asModifier()});
            actionManager.focus.spellReference.getItem()
                .getCostsForFinishedRoll.returns(new Cost(0, 2, false).asPrimaryCost());

            expect(actionManager.focus.cost).to.equal("1");
        });

        it("should not allow addition if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({used: true});
            actionManager.focus.updateSource({adjusted: new Cost(0, 3, false, true).asModifier()});

            actionManager.focus.addCost(new Cost(1, 0, false).asModifier())

            expect(actionManager.focus.adjusted).to.deep.equal(new Cost(0, 3, false, true).asModifier());
        });

        it("should not allow subtraction if action was used", () => {
            const actionManager = createSpellActionManager(sandbox);
            actionManager.focus.updateSource({used: true});
            actionManager.focus.updateSource({adjusted: new Cost(0, 3, false, true).asModifier()});

            actionManager.focus.subtractCost(new Cost(1, 0, false).asModifier());

            expect(new Cost(0, 0, false).asPrimaryCost().add(actionManager.focus.adjusted).render()).to.equal("3V3")
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
        //@ts-expect-error name exists but its not typed yet
        actionManager.magicFumble.checkReportReference.get().skill = {name: "skillName"};
        //@ts-expect-error system exists but its not typed yet
        actionManager.focus.spellReference.getItem().system.skill = "skillName"
        //@ts-expect-error system exists but its not typed yet
        actionManager.focus.spellReference.getItem().actor.system.spellCostReduction = {getCostModifiers: () => []}

        actionManager.rollMagicFumble();

        expect(actionManager.magicFumble.casterReference.getAgent().rollMagicFumble.callCount).to.equal(1);
    })

    it("should spend splinterpoint on actor", () => {
        const actionManager = createSpellActionManager(sandbox);
        const getBonusFunction = sandbox.mock().returns(3);
        actionManager.splinterPoint.actorReference.getAgent().spendSplinterpoint.returns({pointSpent:true, getBonus: getBonusFunction})
        //@ts-expect-error name exists on skill but its not typed yet
        actionManager.splinterPoint.checkReportReference.get().skill = {name: "skillName"};

        actionManager.useSplinterPoint();

        expect(getBonusFunction.callCount).to.equal(1);
        expect(actionManager.splinterPoint.used).to.be.true;
    });
});

export function createSpellActionManager(sandbox: sinon.SinonSandbox): WithMockedRefs<SpellMessageActionsManager>{
    const spellReference = setUpMockSpellSelfReference(sandbox);
    const actorMock = setUpMockActor(sandbox);

    actorMock.items = {get: () => spellReference} as unknown as Collection<SplittermondItem> //Its not a collection, but good enough for the test;
    Object.defineProperty(spellReference, "actor", {value: actorMock, enumerable:true});

    const checkReportReference = setUpCheckReportSelfReference();

    return withToObjectReturnsSelf(() => {
        const actionManager = SpellMessageActionsManager.initialize(spellReference, checkReportReference);

        injectParent(actionManager);
        return actionManager as unknown as WithMockedRefs<SpellMessageActionsManager>; //TS cannot know that we dumped mocks into the init function.
    });
}