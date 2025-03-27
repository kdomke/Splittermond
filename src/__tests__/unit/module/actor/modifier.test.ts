import {describe, it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import Modifier from "module/actor/modifier.js";
import SplittermondItem from "../../../../module/item/item";
import {TooltipFormula} from "../../../../module/util/tooltip";
import { of } from "module/actor/modifiers/expressions/definitions";

describe("Modifier", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => sandbox = sinon.createSandbox());
    afterEach(() => sandbox.restore());
    const mockOrigin = {} as SplittermondItem;

    it("should initialize with correct values", () => {
        const mod = new Modifier("speed.multiplier", "Speed Boost", of(2), mockOrigin, "magic", true);
        expect(mod.value).to.deep.equal(of(2));
        expect(mod.path).to.equal("speed.multiplier");
        expect(mod.selectable).to.be.true;
    });

    it("should detect malus/bonus correctly", () => {
        const bonus = new Modifier("path", "test", of(2));
        const malus = new Modifier("path", "test", of(-3));
        const neutral = new Modifier("path", "test", of(0));

        expect(bonus.isBonus).to.be.true;
        expect(malus.isMalus).to.be.true;
        expect(neutral.isBonus).to.be.false;
        expect(neutral.isMalus).to.be.false;
    });

    it("should format tooltip correctly", () => {
        const bonus = new Modifier("path", "Bonus", of(2));
        const malus = new Modifier("path", "Malus", of(-3));
        const formula = sandbox.createStubInstance(TooltipFormula)

        bonus.addTooltipFormulaElements(formula);
        malus.addTooltipFormulaElements(formula);

        expect(formula.addBonus.calledWith("+2","Bonus")).to.be.true;
        expect(formula.addMalus.calledWith("-3", "Malus")).to.be.true;
    });
});


