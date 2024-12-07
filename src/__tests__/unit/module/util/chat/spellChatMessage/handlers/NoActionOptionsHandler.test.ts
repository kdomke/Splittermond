import {
    injectParent,
    setUpMockSpellSelfReference,
    WithMockedRefs,
    withToObjectReturnsSelf
} from "../spellRollMessageTestHelper";
import {
    NoActionOptionsHandler
} from "../../../../../../../module/util/chat/spellChatMessage/handlers/NoActionOptionsHandler";
import sinon, {SinonSandbox} from "sinon";
import {foundryApi} from "../../../../../../../module/api/foundryApi";
import {expect} from "chai";

describe("NoActionOptionsHandler", () => {
    let sandbox: SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(foundryApi,"localize").callsFake((text: string) => text)
    });
    afterEach(() => sandbox.restore());

    it("should not render options not presented on the spell", () => {
        const underTest = setUpNoActionsHandler(sandbox);
        underTest.effectDuration.isOption = false;
        underTest.effectArea.isOption = false;
        underTest.range.isOption = false;

        expect(underTest.renderDegreeOfSuccessOptions()).to.have.length(0);
    });

    it("should render options presented on the spell", () => {
        const underTest = setUpNoActionsHandler(sandbox);
        underTest.effectDuration.isOption = true;
        underTest.effectArea.isOption = true;
        underTest.range.isOption = true;

        expect(underTest.renderDegreeOfSuccessOptions()).to.have.length(3*4)
        expect(underTest.renderDegreeOfSuccessOptions()
            .map(o=>o.render.action)).to.contain.members(["effectAreaUpdate", "effectDurationUpdate", "rangeUpdate"])
    });

    [1, 2, 4, 8].forEach((multiplicity) => {
        it(`should check range option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "rangeUpdate", multiplicity: `${multiplicity}`}).action();

            expect(underTest.range.options.isChecked(multiplicity)).to.be.true;

        });
        it(`should check effect duration option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "effectDurationUpdate", multiplicity: `${multiplicity}`}).action();

            expect(underTest.effectDuration.options.isChecked(multiplicity)).to.be.true;
        });

        it(`should check effect area option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "effectAreaUpdate", multiplicity: `${multiplicity}`}).action();

            expect(underTest.effectArea.options.isChecked(multiplicity)).to.be.true;

        });

        it(`should produce negative cost for checked range option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "rangeUpdate", multiplicity: `${multiplicity}`}).action();
            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "rangeUpdate")

            expect(option?.cost).to.be.lessThan(0);

        });

        it(`should produce negative cost for checked effect area option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "effectAreaUpdate", multiplicity: `${multiplicity}`}).action();
            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "effectAreaUpdate")

            expect(option?.cost).to.be.lessThan(0);
        });

        it(`should produce negative cost for checked effect duration option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action: "effectDurationUpdate", multiplicity: `${multiplicity}`}).action();
            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "effectDurationUpdate")

            expect(option?.cost).to.be.lessThan(0);
        });

        it(`should produce positive cost for checked range option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "rangeUpdate")

            expect(option?.cost).to.be.greaterThan(0);

        });

        it(`should produce positive cost for checked effect area option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "effectAreaUpdate")

            expect(option?.cost).to.be.greaterThan(0);
        });

        it(`should produce positive cost for checked effect duration option for multiplicity ${multiplicity}`, () => {
            const underTest = setUpNoActionsHandler(sandbox);

            const option = underTest.renderDegreeOfSuccessOptions()
                .find(o=>o.render.multiplicity === `${multiplicity}` && o.render.action === "effectDurationUpdate")

            expect(option?.cost).to.be.greaterThan(0);
        });
    });
});

function setUpNoActionsHandler(sandbox: SinonSandbox): WithMockedRefs<NoActionOptionsHandler> {
    const spellMock = setUpMockSpellSelfReference(sandbox)
    sandbox.stub(spellMock,"degreeOfSuccessOptions").value({effectArea: true, range: true, effectDuration: true});
    return withToObjectReturnsSelf(() => {
        const handler = NoActionOptionsHandler.initialize(spellMock)
        injectParent(handler);
        return handler;
    })
}