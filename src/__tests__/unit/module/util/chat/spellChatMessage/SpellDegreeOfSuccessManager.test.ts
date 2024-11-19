import {describe, it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {
    injectParent,
    setUpCheckReportSelfReference,
    setUpMockSpellSelfReference
} from "./spellRollMessageTestHelper";
import
{SpellMessageDegreesOfSuccessManager}
    from "module/util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager";
import {
    SpellMessageDegreeOfSuccessField
} from "module/util/chat/spellChatMessage/SpellMessageDegreeOfSuccessField";

describe("SpellDegreeOfSuccessManager", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => sandbox.restore());

    it("should reduce the total degrees of success as a field is checked", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.checkReportReference.get().degreeOfSuccess = 3;
        underTest.update({usedDegreesOfSuccess: 0});
        underTest.testField1.update({degreeOfSuccessCosts: 3});
        underTest.testField1.update({checked: false});

        underTest.alterCheckState("testField", 1);

        expect(underTest.openDegreesOfSuccess).to.equal(0);
        expect(underTest.testField1.checked).to.be.true;
    });

    it("should increase the total degrees of success as a field is unchecked", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.checkReportReference.get().degreeOfSuccess = 3;
        underTest.update({usedDegreesOfSuccess: 0});
        underTest.testField1.update({degreeOfSuccessCosts: 3});
        underTest.testField1.update({checked: true});

        underTest.alterCheckState("testField", 1);

        expect(underTest.openDegreesOfSuccess).to.equal(6);
        expect(underTest.testField1.checked).to.be.false;
    });

    it("should delegate availability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField1 = sinon.spy(underTest.testField1); //This works becasue testField1 is not part of the dataModel

        underTest.isAvailable("testField", 1);

        expect((underTest.testField1.isAvailable as any).called).to.be.true;
    });

    it("should delegate checkability checks to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField1 = sinon.spy(underTest.testField1);

        underTest.isCheckable("testField", 1);

        expect((underTest.testField1.isCheckable as any).called).to.be.true;
    });

    it("should delegate check state queries to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField1.update({checked: "horrendous test value" as any});

        underTest.isChecked("testField", 1);

        expect(underTest.testField1.checked).to.equal("horrendous test value");
    });

    it("should delegate used state queries to the field", () => {
        const underTest = createSpellDegreeOfSuccessManager(sandbox);
        underTest.testField1.update({used: "horrendous test value" as any});

        underTest.isUsed("testField");

        expect(underTest.testField1.used).to.equal("horrendous test value");
    });
});

function createSpellDegreeOfSuccessManager(sandbox: sinon.SinonSandbox): SpellMessageDegreesOfSuccessManager & {
    testField1: SpellMessageDegreeOfSuccessField
} {
    const spellReference = setUpMockSpellSelfReference(sandbox);
    sandbox.stub(spellReference, "degreeOfSuccessOptions").get(() => sandbox.stub().returns(false));
    sandbox.stub(spellReference, "enhancementCosts").get(() => "1EG/+1V1");
    sandbox.stub(spellReference, "castDuration").get(() => 3);

    const checkReportReference = setUpCheckReportSelfReference();
    checkReportReference.degreeOfSuccess = 3;

    const manager = SpellMessageDegreesOfSuccessManager.fromRoll(spellReference, checkReportReference);
    Object.defineProperty(manager, "testField1", {
        value: createSpellDegreeOfSuccessField(),
        writable: true,
        enumerable: true
    });
    injectParent(manager);
    return manager as SpellMessageDegreesOfSuccessManager & { testField1: SpellMessageDegreeOfSuccessField };
}

function createSpellDegreeOfSuccessField(): SpellMessageDegreeOfSuccessField {
    return new SpellMessageDegreeOfSuccessField({
        degreeOfSuccessCosts: 3,
        checked: false,
        used: false,
        isDegreeOfSuccessOption: true,
        multiplicity: 1
    });
}