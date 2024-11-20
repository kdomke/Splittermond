import "../../../../foundryMocks.js"; // required for global state
import {describe, it} from "mocha";
import {expect} from "chai";
import {
    SpellMessageDegreeOfSuccessField
} from "module/util/chat/spellChatMessage/SpellMessageDegreeOfSuccessField";
import {
    SpellMessageDegreesOfSuccessManager
} from "module/util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager";
import {setUpCheckReportSelfReference} from "./spellRollMessageTestHelper";

describe("SpellMessageDegreeOfSuccessField", () => {
    it("should throw an error if no parent present", () => {
        const probe = new SpellMessageDegreeOfSuccessField({
            isDegreeOfSuccessOption: true,
            degreeOfSuccessCosts: 3,
            checked: false,
            used: false,
            multiplicity: 1,
        }, {parent: null});

        expect(() => probe.isAvailable()).to.throw(Error);
    });

    it("should ignore attempts at checking a used field", () => {
        const underTest = defaultSpellDegreeOfSuccessField();
        underTest.updateSource({checked: true});
        underTest.updateSource({used: true});

        underTest.alterCheckState();

        expect(underTest.checked).to.be.true;
    });

    it("should ignore attempts at checking an unavailable field", () => {
        const underTest = defaultSpellDegreeOfSuccessField();
        underTest.updateSource({checked: true});
        underTest.getParent().checkReportReference.get().degreeOfSuccess = -1;

        underTest.alterCheckState();

        expect(underTest.checked).to.be.true;
    });

    describe("field is checked", () => {
        it("should change the checked state to false", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.alterCheckState();
            expect(underTest.checked).to.be.false;
        });

        it("should be uncheckable if cost exceed available degrees of success", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.getParent().updateSource({usedDegreesOfSuccess : underTest.getParent().totalDegreesOfSuccess});

            expect(underTest.isCheckable()).to.be.true;
        });

        it("should be uncheckable if costs are within available degrees of success", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.getParent().checkReportReference.get().degreeOfSuccess += underTest.degreeOfSuccessCosts;

            expect(underTest.isCheckable()).to.be.true;
        });

        it("should not be uncheckable if it is used", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.updateSource({used: true});

            expect(underTest.isCheckable()).to.be.false;
        });
    });

    describe("field is unchecked", () => {
        it("should change the checked state to true", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: false});
            underTest.alterCheckState();
            expect(underTest.checked).to.be.true;
        });

        it("should not be checkable if cost exceed available degrees of success", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: false});
            underTest.getParent().updateSource({usedDegreesOfSuccess : underTest.getParent().totalDegreesOfSuccess});

            expect(underTest.isCheckable()).to.be.false;
        });

        it("should be checkable if costs are within available degrees of success", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.getParent().checkReportReference.get().degreeOfSuccess += underTest.degreeOfSuccessCosts;

            expect(underTest.isCheckable()).to.be.true;
        });

        it("should not be checkable if it is used", () => {
            const underTest = defaultSpellDegreeOfSuccessField();
            underTest.updateSource({checked: true});
            underTest.updateSource({used: true});

            expect(underTest.isCheckable()).to.be.false;
        });
    });
});

function defaultSpellDegreeOfSuccessField(): SpellMessageDegreeOfSuccessField {
    return new SpellMessageDegreeOfSuccessField({
        degreeOfSuccessCosts: 3,
        checked: false,
        used: false,
        isDegreeOfSuccessOption: true,
        multiplicity: 1,
    }, {parent: mockManager()});
}

function mockManager(): SpellMessageDegreesOfSuccessManager {
    const degreeOfSuccessManager = new SpellMessageDegreesOfSuccessManager({
        checkReportReference: setUpCheckReportSelfReference(),
        usedDegreesOfSuccess: 0,
    }as any/*we don't want to initialize all fields here*/);
    degreeOfSuccessManager.updateSource({checkReportReference: setUpCheckReportSelfReference()});
    degreeOfSuccessManager.checkReportReference.get().degreeOfSuccess = 3;

    degreeOfSuccessManager.updateSource({usedDegreesOfSuccess: 0});
    return degreeOfSuccessManager;
}
