import {describe} from "mocha";
import sinon, {SinonSandbox, SinonStubbedInstance} from "sinon";
import {
    setUpCheckReportSelfReference,
    setUpMockActor,
    setUpMockSpellSelfReference,
    WithMockedRefs,
    withToObjectReturnsSelf
} from "../spellRollMessageTestHelper";
import {AgentReference} from "module/data/references/AgentReference";
import {expect} from "chai";
import {splittermond} from "module/config";
import SplittermondSpellItem from "module/item/spell";
import SplittermondActor from "module/actor/actor";
import SplittermondItem from "module/item/item";
import {foundryApi} from "module/api/foundryApi";
import {DamageActionHandler} from "../../../../../../../module/util/chat/spellChatMessage/handlers/DamageActionHandler";
import {Dice} from "../../../../../../../module/util/dice";

describe("DamageActionHandler", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(foundryApi, "localize").callsFake((key:string)=>key)
    });
    afterEach(() => {
        sandbox.restore();
    });

    describe("options", ()=>{
        it("should deliver damage addition options",()=>{
            const underTest = setUpDamageActionHandler(sandbox);
            sandbox.stub(underTest.spellReference.getItem(), "damage").get(()=>"1");
            underTest.checkReportReference.get().succeeded = true;

            const options = underTest.renderDegreeOfSuccessOptions()

            expect(options).to.have.length(4);
        });

        it("active options addToDamage", () =>{
            const underTest = setUpDamageActionHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"}).action();

            expect(underTest.damageAddition).to.equal(2);
        });

        it("unchecking options should reset damage addition", () =>{
            const underTest = setUpDamageActionHandler(sandbox);

            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"}).action();
            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"}).action();

            expect(underTest.damageAddition).to.equal(0);
        });

        it("should not render options if they are not an option",() =>{
            const underTest = setUpDamageActionHandler(sandbox);
            underTest.checkReportReference.get().succeeded = false;

            const options = underTest.renderDegreeOfSuccessOptions();
            expect(options).to.have.length(0);
        });
    });

    describe("Increasing damage", ()=>{
        it("should not render action if its not an option", ()=>{
            const underTest = setUpDamageActionHandler(sandbox);
            underTest.checkReportReference.get().succeeded = false;

            const actions = underTest.renderActions();

            expect(actions).to.have.length(0);
        });

        it("should disable all options after consuming ticks", () =>{
            const underTest = setUpDamageActionHandler(sandbox);
            sandbox.stub(underTest.spellReference.getItem(), "damage").get(()=>"1");
            underTest.checkReportReference.get().succeeded = true;

            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"});

            underTest.useAction({action:"applyDamage"});

            const options = underTest.renderDegreeOfSuccessOptions();

            expect(options).to.have.length(4);
            expect(options.map(o =>o.render.disabled).reduce((a,b)=>a&&b,true)).to.be.true;
        });

        it("should invoke Dice module on damage application", () =>{
            const underTest = setUpDamageActionHandler(sandbox);
            const diceModuleStub = sandbox.stub(Dice, "damage");
            sandbox.stub(underTest.spellReference.getItem(), "damage").get(()=>"1");

            underTest.useAction({action:"applyDamage"});

            expect(diceModuleStub.called).to.be.true;
        });

        it("should respect damage increases", () =>{
            const underTest = setUpDamageActionHandler(sandbox);
            const diceModuleStub = sandbox.stub(Dice, "damage");
            sandbox.stub(underTest.spellReference.getItem(), "damage").get(()=>"1");
            underTest.checkReportReference.get().succeeded = true;

            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"}).action();
            underTest.useAction({action:"applyDamage"});

            expect(diceModuleStub.calledWith("0W0+2",undefined, "name")).to.be.true;
        });

        it("should not allow using actions multiple times", ()=>{
            const underTest = setUpDamageActionHandler(sandbox);
            const diceModuleStub = sandbox.stub(Dice, "damage");
            sandbox.stub(underTest.spellReference.getItem(), "damage").get(()=>"1");

            underTest.useDegreeOfSuccessOption({action:"damageUpdate", multiplicity: "2"}).action();
            underTest.useAction({action:"applyDamage"});
            underTest.useAction({action:"applyDamage"});

            expect(diceModuleStub.calledOnce).to.be.true;
        });

    });
});

function setUpDamageActionHandler(sandbox:SinonSandbox):WithMockedRefs<DamageActionHandler>{
    const spellReference = setUpMockSpellSelfReference(sandbox)
    setNecessaryDefaultsForSpellproperties(spellReference, sandbox);
    const actor = setUpMockActor(sandbox);
    const checkReportReference = setUpCheckReportSelfReference();
    linkSpellAndActor(spellReference, actor);
    return withToObjectReturnsSelf(()=>{
        return DamageActionHandler.initialize(
            AgentReference.initialize(actor),
            spellReference,
            checkReportReference)
    })as unknown as WithMockedRefs<DamageActionHandler> /*TS cannot know that we're injecting mocks*/
}
function linkSpellAndActor(spellMock: SinonStubbedInstance<SplittermondSpellItem>, actorMock: SinonStubbedInstance<SplittermondActor>): void {
    actorMock.items = {get: () => spellMock} as unknown as Collection<SplittermondItem> //Our pseudo collection is supposed to return the spellMock regrardless of id entered.
    Object.defineProperty(spellMock, "actor", {value: actorMock, enumerable: true});
}

function setNecessaryDefaultsForSpellproperties(spellMock: SinonStubbedInstance<SplittermondSpellItem>, sandbox: sinon.SinonSandbox) {
    sandbox.stub(spellMock,"degreeOfSuccessOptions").get(()=>({
        consumedFocus:true,
        exhaustedFocus:true,
        channelizedFocus:true,
        damage: true,
        castDuration: true,
        effectDuration: true,
        range: true,
        effectArea: true,
    }as Record<keyof typeof splittermond.spellEnhancement, boolean>));
    //@ts-expect-error name is a property that is not typed yet.
    spellMock.name = "name";
}
