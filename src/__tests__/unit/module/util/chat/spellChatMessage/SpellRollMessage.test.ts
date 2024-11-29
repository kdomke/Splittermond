import "../../../../foundryMocks"
import {afterEach, beforeEach, describe} from "mocha";
import {SpellRollMessage} from "module/util/chat/spellChatMessage/SpellRollMessage";
import sinon, {SinonSandbox, SinonStubbedInstance} from "sinon";
import {
    injectParent,
    setUpMockActor,
    setUpMockSpellSelfReference,
    withToObjectReturnsSelf
} from "./spellRollMessageTestHelper";
import {expect} from "chai";
import SplittermondSpellItem from "module/item/spell";
import SplittermondActor from "module/actor/actor";
import SplittermondItem from "module/item/item";
import {Cost} from "module/util/costs/Cost";
import {splittermond} from "module/config";
import {foundryApi} from "module/api/foundryApi";


describe("SpellRollMessage", () => {
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(foundryApi, "localize").callsFake((key:string)=>key)
    });
    afterEach(() => {sandbox.restore()})

    it("should load", () => {
        const spellRollMessage = createSpellRollMessage(sandbox);
        expect(spellRollMessage?.getData()).to.not.be.undefined;
    });

    it("should filter degree of success options that are too expensive on render", ()=>{
        const spellRollMessage = createSpellRollMessage(sandbox);
        spellRollMessage.updateSource({openDegreesOfSuccess:0});
        expect(spellRollMessage.getData().degreeOfSuccessOptions).to.be.empty;
    });

    it("should allow options that are checked, even if no degrees of success are left", ()=>{
        const spellRollMessage = createSpellRollMessage(sandbox);
        spellRollMessage.updateSource({openDegreesOfSuccess:1000});

        spellRollMessage.handleGenericAction({action:"consumedFocusUpdate", multiplicity: "1"});
        spellRollMessage.updateSource({openDegreesOfSuccess:0});

        expect(spellRollMessage.getData().degreeOfSuccessOptions).to.have.length(1);
        expect(spellRollMessage.getData().degreeOfSuccessOptions[0]).to.deep.contain({
            checked: true,
            disabled: false,
            action: "consumedFocusUpdate",
            multiplicity: "1",
            text: "3 EG splittermond.degreeOfSuccessOptions.consumedFocus"
        });
    });

    (["consumedFocusUpdate", "exhaustedFocusUpdate", "channeledFocusUpdate"]as const).forEach((action)=>{
       function mapUpdateFunctionToSpellCostType(input: typeof action){
           switch (input){
                case "consumedFocusUpdate": return "consumed";
                case "exhaustedFocusUpdate": return "exhausted";
                case "channeledFocusUpdate": return "channeled";
           }
       }
       [1,2,4,8].forEach((multiplicity)=> {
           it(`should check ${action} degree of success option with multiplicity ${multiplicity}`, () => {
               const spellRollMessage = createSpellRollMessage(sandbox);
               spellRollMessage.updateSource({openDegreesOfSuccess: 100});

               spellRollMessage.handleGenericAction({action, multiplicity: `${multiplicity}`});

               const spellCostType = mapUpdateFunctionToSpellCostType(action);
               expect(spellRollMessage.focusCostHandler[spellCostType].isChecked(multiplicity)).to.be.true;
           });

           it(`should uncheck ${action} degree of success option with multliplicity ${multiplicity}`, () => {
               const spellRollMessage = createSpellRollMessage(sandbox);
               spellRollMessage.updateSource({openDegreesOfSuccess: 100});

               spellRollMessage.handleGenericAction({action, multiplicity: `${multiplicity}`});
               spellRollMessage.handleGenericAction({action, multiplicity: `${multiplicity}`});

               expect(spellRollMessage.focusCostHandler.consumed.isChecked(multiplicity)).to.be.false;
           });
       });
    });
});

function createSpellRollMessage(sandbox:SinonSandbox){
    const mockSpell = setUpMockSpellSelfReference(sandbox);
    setNecessaryDefaultsForSpellproperties(mockSpell, sandbox);
    const mockActor = setUpMockActor(sandbox);
    linkSpellAndActor(mockSpell, mockActor);
    const spellRollMessage = withToObjectReturnsSelf(() => {
        return SpellRollMessage.initialize(mockSpell, {
            degreeOfSuccess: 0,
            degreeOfSuccessMessage: "Uma mensagem muito importante",
            difficulty: 0,
            hideDifficulty: false,
            isCrit: false,
            isFumble: false,
            modifierElements: [],
            roll: {dice: [], tooltip: "", total: 0},
            rollType: "standard",
            skill: {attributes: {}, id: "deathmagic", points: 0},
            succeeded: true,
        });
    });
    injectParent(spellRollMessage);
    return spellRollMessage;
}

function linkSpellAndActor(spellMock: SinonStubbedInstance<SplittermondSpellItem>, actorMock: SinonStubbedInstance<SplittermondActor>): void {
    actorMock.items = {get: () => spellMock} as unknown as Collection<SplittermondItem> //Our pseudo collection is supposed to return the spellMock regrardless of id entered.
    Object.defineProperty(spellMock, "actor", {value: actorMock, enumerable: true});
}

function setNecessaryDefaultsForSpellproperties(spellMock: SinonStubbedInstance<SplittermondSpellItem>, sandbox: sinon.SinonSandbox) {
    sandbox.stub(spellMock, "enhancementCosts").get(() => "1EG/+1V1");
    sandbox.stub(spellMock, "castDuration").get(() => 3);
    sandbox.stub(spellMock, "description").get(() => "description");
    spellMock.getCostsForFinishedRoll.returns(new Cost(10,4,false).asPrimaryCost());
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
