import "../../../../foundryMocks.js"

import {describe, it} from "mocha";
import {expect} from "chai";
import {
    SpellMessageActionsManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageActionsManager.js";
import {createSpellActionManager} from "./spellRollMessageTestHelper.js";

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

        it("subtraction should be barred from alteration after usage", () =>{
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = true;

            manager.ticks.subtract(3);

            expect(manager.ticks.adjusted).to.equal(3);
        });

        it("add should be barred from alteration after usage", () =>{
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 3;
            manager.ticks.used = true;

            manager.ticks.add(3);

            expect(manager.ticks.adjusted).to.equal(3);
        });

        it("should return a cost minmum of 1", ()=> {
            const manager = createSpellActionManager()
            manager.ticks.adjusted = 0;

            expect(manager.ticks.cost).to.equal("1");
        });
    });

    describe("Damage", () => {
        it("should add Costs to the adjusted value", ()=>{
            const manager = createSpellActionManager();
            manager.damage.adjusted = "1V1";

            manager.damage.addCost("1V1")

            expect(manager.damage.adjusted).to.equal("2V2")
        });

        it("should subtract Costs to the adjusted value", ()=>{
            const manager = createSpellActionManager();
            manager.damage.adjusted = "2V2";

            manager.damage.subtractCost("1V1")

            expect(manager.damage.adjusted).to.equal("1V1")
        });

        it("should apply strict costs", () => {
            const manager = createSpellActionManager();
            manager.damage.adjusted = "1V1";

            manager.damage.addCost("K1V1")

            expect(manager.damage.adjusted).to.equal("1V1")
        });

        it("should render a minimum cost of 0", () =>{
            const manager = createSpellActionManager();
            manager.damage.adjusted = "0";

            expect(manager.damage.cost).to.equal("0")
        });

        it("should not allow addion if action was used",() =>{
            const manager = createSpellActionManager();
            manager.damage.used = true
            manager.damage.adjusted = "3";

            manager.damage.addCost("1")

            expect(manager.damage.adjusted).to.equal("3")
        });

        it("should not allow subtraction if action was used",() =>{
            const manager = createSpellActionManager();
            manager.damage.used = true
            manager.damage.adjusted = "3";

            manager.damage.subtractCost("1");

            expect(manager.damage.adjusted).to.equal("3")
        });
    });


    describe("Focus", () => {
        it("should add Costs to the adjusted value", ()=>{
            const manager = createSpellActionManager();
            manager.focus.adjusted = "1V1";

            manager.focus.addCost("1V1")

            expect(manager.focus.adjusted).to.equal("2V2")
        });

        it("should subtract Costs to the adjusted value", ()=>{
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

        it("should render a minimum cost of 1", () =>{
            const manager = createSpellActionManager();
            manager.focus.adjusted = "0";

            expect(manager.focus.cost).to.equal("1")
        });

        it("should not allow addion if action was used",() =>{
            const manager = createSpellActionManager();
            manager.focus.used = true
            manager.focus.adjusted = "3";

            manager.focus.addCost("1")

            expect(manager.focus.adjusted).to.equal("3")
        });

        it("should not allow subtraction if action was used",() =>{
            const manager = createSpellActionManager();
            manager.focus.used = true
            manager.focus.adjusted = "3";

            manager.focus.subtractCost("1");

            expect(manager.focus.adjusted).to.equal("3")
        });

    });

    it("should react to fumbles", () => {
        const manager = SpellMessageActionsManager.initialize({system: {}}, {isFumble: true});

        expect(manager.magicFumble.available).to.be.true;
        expect(manager.splinterPoint.available).to.be.false;
    })
})