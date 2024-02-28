import {describe, it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {createSpellDegreeOfSuccessManager} from "./spellRollMessageTestHelper.js";

describe("SpellDegreeOfSuccessManager", () => {
    it("should reduce the total degrees of success as a field is checked", () => {
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.totalDegreesOfSuccess = 3
        underTest.usedDegreesOfSuccess = 0;
        underTest.testField.degreeOfSuccessCosts = 3;
        underTest.testField.checked = false;

        underTest.alterCheckState(/** @type {SpellDegreesOfSuccessOptions} */"testField" );

        expect(underTest.openDegreesOfSuccess).to.equal(0);
        expect(underTest.testField.checked).to.be.true;
    })

    it ("should increase the total degrees of success as a field is unchecked", () => {
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.totalDegreesOfSuccess = 3
        underTest.usedDegreesOfSuccess = 3;
        underTest.testField.degreeOfSuccessCosts = 3;
        underTest.testField.checked = true;

        underTest.alterCheckState(/** @type {SpellDegreesOfSuccessOptions} */"testField" );

        expect(underTest.openDegreesOfSuccess).to.equal(3);
        expect(underTest.testField.checked).to.be.false;
    });

    it("should delegate availability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.testField = sinon.spy(underTest.testField);

        underTest.isAvailable(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.isAvailable.called).to.be.true;
    });

    it("should delegate checkability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.testField = sinon.spy(underTest.testField);

        underTest.isCheckable(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.isCheckable.called).to.be.true;
    });

    it("should delegate check state queries to the field", () =>{
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.testField.checked = /** @type {boolean} */"horrendous test value";

        underTest.isChecked(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.checked).to.equal("horrendous test value");
    })

    it("should delegate used state queries to the field", () =>{
        const underTest = createSpellDegreeOfSuccessManager();
        underTest.testField.used = /** @type {boolean} */"horrendous test value";

        underTest.isUsed(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.used).to.equal("horrendous test value");
    });
})
