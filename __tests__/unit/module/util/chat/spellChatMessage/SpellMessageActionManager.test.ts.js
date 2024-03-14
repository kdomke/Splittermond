import "../../../../foundryMocks.js"

import {describe, it} from "mocha";
import {expect} from "chai";
import {createSpellActionManager} from "./spellRollMessageTestHelper.js";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import sinon from "sinon";
import {referencesApi} from "../../../../../../module/data/references/referencesApi.js";
import {Cost} from "../../../../../../module/util/costs/Cost.js";
import SplittermondActor from "../../../../../../module/actor/actor.js";
import SplittermondSpellItem from "../../../../../../module/item/spell.js";

describe("SpellActionManager", () => {

    describe("Ticks", () => {
        it("should subtract from the adjusted value", () => {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = false;

            manager.ticks.subtract(3);

            expect(manager.ticks.adjusted).to.equal(0);
        });

        it("should add to the adjusted value", () => {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = false;

            manager.ticks.add(3);

            expect(manager.ticks.adjusted).to.equal(6);
        });

        it("subtraction should be barred from alteration after usage", () => {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = true;

            manager.ticks.subtract(3);

            expect(manager.ticks.adjusted).to.equal(3);
        });

        it("add should be barred from alteration after usage", () => {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = true;

            manager.ticks.add(3);

            expect(manager.ticks.adjusted).to.equal(3);
        });

        it("should return a cost minmum of 1", () => {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 0;

            expect(manager.ticks.cost).to.equal("1");
        });
    });

    describe("Damage", () => {
        it("should add Costs to the adjusted value", () => {
            const manager = createSpellActionManager();
            manager.damage.adjusted = "1W6+1";

            manager.damage.addCost(1)

            expect(manager.damage.adjusted).to.equal("1W6+2")
        });

        it("should subtract Costs to the adjusted value", () => {
            const manager = createSpellActionManager();
            manager.damage.adjusted = "1W6+2";

            manager.damage.subtractCost(1)

            expect(manager.damage.adjusted).to.equal("1W6+1")
        });

        it("should render a minimum cost of 0", () => {
            const manager = createSpellActionManager();
            manager.damage.adjusted = "0";

            expect(manager.damage.cost).to.equal("0")
        });

        it("should not allow addion if action was used", () => {
            const manager = createSpellActionManager();
            manager.damage.used = true
            manager.damage.adjusted = "3";

            manager.damage.addCost("1")

            expect(manager.damage.adjusted).to.equal("3")
        });

        it("should not allow subtraction if action was used", () => {
            const manager = createSpellActionManager();
            manager.damage.used = true
            manager.damage.adjusted = "3";

            manager.damage.subtractCost("1");

            expect(manager.damage.adjusted).to.equal("3")
        });
    });


    describe("Focus", () => {
        it("should pass adjusted focus to the actor", () => {
            const manager = createSpellActionManager();
            manager.focus.adjusted = new Cost(0,0,false).asModifier();
            sinon.stub(referencesApi, "getActor").returns({consumeCost: sinon.spy()});
            sinon.stub(referencesApi, "getItem").returns({
                name: "spell",
                getCostsForFinishedRoll: () => new Cost(9, 3, 0).asPrimaryCost()
            });

            manager.focus.subtractCost("1V1");
            manager.consumeFocus();

            expect(referencesApi.getActor("").consumeCost.lastCall.args[1]).to.contain("11V2")
        });
        it("should add Costs to the adjusted value", () => {
            const manager = createSpellActionManager();
            manager.focus.adjusted = "1V1";

            manager.focus.addCost("1V1")

            expect(manager.focus.adjusted).to.equal("2V2")
        });

        it("should subtract Costs to the adjusted value", () => {
            const manager = createSpellActionManager();
            manager.focus.adjusted = "2V2";

            manager.focus.subtractCost("1V1")

            expect(manager.focus.adjusted).to.equal("1V1")
        });

        it("should apply strict costs", () => {
            const manager = createSpellActionManager();
            manager.focus.adjusted = "1V1";

            manager.focus.addCost("K1V1")

            expect(manager.focus.adjusted).to.equal("1V1")
        });

        it("should render a minimum cost of 1", () => {
            const manager = createSpellActionManager();
            manager.focus.adjusted = "0";

            expect(manager.focus.cost).to.equal("1")
        });

        it("should not allow addition if action was used", () => {
            const manager = createSpellActionManager();
            manager.focus.used = true
            manager.focus.adjusted = "3";

            manager.focus.addCost("1")

            expect(manager.focus.adjusted).to.equal("3")
        });

        it("should not allow subtraction if action was used", () => {
            const manager = createSpellActionManager();
            manager.focus.used = true
            manager.focus.adjusted = "3";

            manager.focus.subtractCost("1");

            expect(manager.focus.adjusted).to.equal("3")
        });

    });

    it("should react to fumbles", () => {
        const manager = createSpellActionManager();
        const actorMock = sinon.createStubInstance(SplittermondActor);
        const spellMock = sinon.createStubInstance(SplittermondSpellItem);
        sinon.stub(referencesApi, "getActor").returns(actorMock);
        sinon.stub(referencesApi, "getItem").returns(spellMock);
        manager.magicFumble.checkReportReference.get().isFumble = true;

        expect(manager.magicFumble.available).to.be.true;
        expect(manager.splinterPoint.available).to.be.false;
    });

    it("should pass fumbles to the actor", () => {
        const manager = createSpellActionManager();
        const actorMock = sinon.createStubInstance(SplittermondActor);
        const spellMock = sinon.createStubInstance(SplittermondSpellItem);
        sinon.stub(referencesApi, "getActor").returns(actorMock);
        sinon.stub(referencesApi, "getItem").returns(spellMock);

        manager.rollMagicFumble();

        expect(actorMock.rollMagicFumble.callCount).to.equal(1);
    })



    it("should spend splinterpoint on actor", () => {
        const getBonusFunction = sinon.mock().returns(3);
        sinon.stub(referencesApi, "getActor").returns({
            id: "1",
            documentName: "Actor",
            spendSplinterpoint: () => ({getBonus: getBonusFunction})
        })
        const manager = createSpellActionManager();
        manager.casterReference = new AgentReference({id: "1", sceneId: null, type: "actor"})

        manager.useSplinterPoint();

        expect(getBonusFunction.callCount).to.equal(1);
        expect(manager.splinterPoint.used).to.be.true;
    });
})