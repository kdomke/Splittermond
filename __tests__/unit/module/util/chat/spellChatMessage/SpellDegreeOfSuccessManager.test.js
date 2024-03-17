import {describe, it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {
    injectParent,
    setUpCheckReportSelfReference,
    setUpMockSpellSelfReference
} from "./spellRollMessageTestHelper.js";
import {
    SpellMessageDegreesOfSuccessManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {
    SpellMessageDegreeOfSuccessField
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageDegreeOfSuccessField.js";

describe("SpellDegreeOfSuccessManager", () => {
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());
    it("should reduce the total degrees of success as a field is checked", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.checkReportReference.get().degreeOfSuccess = 3
        underTest.usedDegreesOfSuccess = 0;
        underTest.testField.degreeOfSuccessCosts = 3;
        underTest.testField.checked = false;

        underTest.alterCheckState(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.openDegreesOfSuccess).to.equal(0);
        expect(underTest.testField.checked).to.be.true;
    })

    it("should increase the total degrees of success as a field is unchecked", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.checkReportReference.get().degreeOfSuccess = 3
        underTest.usedDegreesOfSuccess = 3;
        underTest.testField.degreeOfSuccessCosts = 3;
        underTest.testField.checked = true;

        underTest.alterCheckState(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.openDegreesOfSuccess).to.equal(3);
        expect(underTest.testField.checked).to.be.false;
    });

    it("should delegate availability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField = sinon.spy(underTest.testField);

        underTest.isAvailable(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.isAvailable.called).to.be.true;
    });

    it("should delegate checkability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField = sinon.spy(underTest.testField);

        underTest.isCheckable(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.isCheckable.called).to.be.true;
    });

    it("should delegate check state queries to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField.checked = /** @type {boolean} */"horrendous test value";

        underTest.isChecked(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.checked).to.equal("horrendous test value");
    })

    it("should delegate used state queries to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField.used = /** @type {boolean} */"horrendous test value";

        underTest.isUsed(/** @type {SpellDegreesOfSuccessOptions} */"testField");

        expect(underTest.testField.used).to.equal("horrendous test value");
    });
})

function createSpellDegreeOfSuccessManager(sandbox) {
    const spellReference = setUpMockSpellSelfReference(sandbox);
    sandbox.stub(spellReference, "degreeOfSuccessOptions").get(() => sandbox.stub().returns(false))
    sandbox.stub(spellReference, "enhancementCosts").get(() => "1EG/+1V1");
    sandbox.stub(spellReference, "castDuration").get(() => 3);

    const checkReportReference = setUpCheckReportSelfReference();
    checkReportReference.degreeOfSuccess = 3;


    const manager = SpellMessageDegreesOfSuccessManager.fromRoll(spellReference, checkReportReference);
    manager.testField = createSpellDegreeOfSuccessField(manager);
    injectParent(manager);
    return manager;
}


/**@return {SpellMessageDegreeOfSuccessField}*/
function createSpellDegreeOfSuccessField() {
    return new SpellMessageDegreeOfSuccessField({
        degreeOfSuccessCosts: 3,
        checked: false,
        used: false,
        isDegreeOfSuccessOption: true,
    })
}
