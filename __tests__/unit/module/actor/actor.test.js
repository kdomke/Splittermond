import a from "../../foundryMocks.js" //set some global variables pertaining to foundry;
import {expect} from 'chai';
import {describe} from "mocha";
import SplittermondActor from "../../../../module/actor/actor.js";
import SplittermondItem from "../../../../module/item/item.js";
import {splittermond} from "../../../../module/config.js";

describe("Splittermond Actor Spell reduction", () => {
    global.CONFIG = {splittermond};
    it("should initialize spell cost management", () => {
        global.Actor.prototype.prepareBaseData = () => {};
        const actor = new SplittermondActor();
        actor.system = {skills:[], attributes:[]}
        actor.prepareBaseData();
        expect(actor.system.spellCostReduction).to.not.be.undefined;
        expect(actor.system.spellEnhancedCostReduction).to.not.be.undefined;
    });
});