import "../../../../foundryMocks.js";
import {
    SpellMessageDegreesOfSuccessManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageDegreesOfSuccessManager.js";
import {
    SpellMessageDegreeOfSuccessField
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageDegreeOfSuccessField.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {
    SpellMessageActionsManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageActionsManager.js";
import {ItemReference} from "../../../../../../module/data/references/ItemReference.js";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import {Cost} from "../../../../../../module/util/costs/Cost.js";
import {OnAncestorReference} from "../../../../../../module/data/references/OnAncestorReference.js";
import SplittermondSpellItem from "../../../../../../module/item/spell.js";
import sinon from "sinon";
import {foundryApi} from "../../../../../../module/api/foundryApi.js";
import {splittermond} from "../../../../../../module/config.js";
import SplittermondActor from "../../../../../../module/actor/actor.js";
import {SplittermondDataModel} from "../../../../../../module/data/SplittermondDataModel.js";
export function setUpMockActor(sandbox){
    const actorMock = sandbox.createStubInstance(SplittermondActor);
    const apiGetActorMock = sandbox.stub(foundryApi, "getActor").returns(actorMock);
    actorMock.documentName = "Actor";
    actorMock.id = "1";
    return actorMock;
}

export function setUpMockSpellSelfReference(sandbox){
    const spellMock = sandbox.createStubInstance(SplittermondSpellItem);
    const apiGetItemMock = sandbox.stub(foundryApi, "getItem").returns(spellMock);
    spellMock.getItem = function() {return this;};
    Object.defineProperty(spellMock, "toObject", {
        value: function () {
            return this;
        }
    });
    return spellMock;
}

export function withToObjectReturnsSelf(wrappedFunction){
    const toObjectMock = sinon.stub(SplittermondDataModel.prototype, "toObject").callsFake(function () {
        return this;
    });
    const returnValue = wrappedFunction();
    toObjectMock.restore();
    return returnValue;
}

export function prepareForDegreeOfSuccessManager(spellMock, checkReport) {
    sinon.stub(spellMock, "degreeOfSuccessOptions").get(() => sinon.stub().returns(true))
    sinon.stub(spellMock, "enhancementCosts").get(() => "1EG/+1V1");
    sinon.stub(spellMock, "castDuration").get(() => 3);

    checkReport.degreeOfSuccess = checkReport.degreeOfSuccess ?? 3;
}

export function prepareForRenderer(spellMock, checkReport) {
    sinon.stub(spellMock, "description").get(() => "description");
    spellMock.name = spellMock.name ?? "name";
}

export function createContext(afterOrAfterEach){
    const sandbox = sinon.createSandbox();
    afterOrAfterEach(() => sandbox.restore());
    return sandbox;
}

export function withTeardown(messageClass, {
    spellMock = sinon.stub(),
    actorMock = sinon.stub(),
    apiGetItemMock = sinon.stub(),
    apiGetActorMock = sinon.stub()
}) {
    return (afterOrAfterEach) => {
        afterOrAfterEach(() => {
            apiGetItemMock.restore();
            apiGetActorMock.restore();
        });
        return {messageClass, spellMock, actorMock, apiGetItemMock, apiGetActorMock}
    }
}

export function createSplittermondSpellRollMessage() {
    const toObjectMock = sinon.stub(SplittermondDataModel.prototype, "toObject").callsFake(function () {
        return this;
    });
    const spellMock = sinon.createStubInstance(SplittermondSpellItem);
    const actorMock = sinon.createStubInstance(SplittermondActor);
    actorMock.documentName = "Actor";
    actorMock.id = "1";
    actorMock.items = {get: () => spellMock};
    spellMock.actor = actorMock;

    const apiGetItemMock = sinon.stub(foundryApi, "getItem").returns(spellMock);
    const apiGetActorMock = sinon.stub(foundryApi, "getActor").returns(actorMock);

    const checkReport = {};
    const checkReportReference = OnAncestorReference.for(SplittermondSpellRollMessage)
        .identifiedBy("constructorKey", "SplittermondSpellRollMessage").references("checkReport")
    prepareForDegreeOfSuccessManager(spellMock, checkReport);
    prepareForRenderer(spellMock, checkReport);

    const spellRollMessage = SplittermondSpellRollMessage.createRollMessage(
        spellMock,
        checkReport
    )
    postfixActionManager(spellRollMessage.actionManager);
    injectParent(spellRollMessage);
    toObjectMock.restore();
    return withTeardown(spellRollMessage, {spellMock, actorMock, apiGetItemMock, apiGetActorMock});
}

/** @param {SpellMessageActionsManager} actionManager */
export function postfixActionManager(actionManager) {
    actionManager.focus.adjusted = new Cost(0, 0, false).asModifier();
}

/** @param {object} object */
export function injectParent(object) {
    for (const key in object) {
        if (object[key] && typeof object[key] === "object" && key !== "parent") {
            object[key].parent = object;
            injectParent(object[key]);
        }
    }
}

export function createSpellDegreeOfSuccessManager() {
    const spellReference = sinon.createStubInstance(SplittermondSpellItem);
    spellReference.getItem = () => spellReference;
    const checkReportReference = {degreeOfSuccess: 3, isFumble: false, succeeded: true, skill: {name: "skillName"}};
    Object.defineProperty(checkReportReference, "get", {value: () => checkReportReference});
    Object.defineProperty(checkReportReference, "toObject", {value: function() {return this;}});
    Object.defineProperty(spellReference, "toObject", {value: function(){return this;}});
    prepareForDegreeOfSuccessManager(spellReference, checkReportReference);
    const manager = SpellMessageDegreesOfSuccessManager
        .fromRoll(spellReference, checkReportReference);
    manager.testField = createSpellDegreeOfSuccessField(manager);
    injectParent(manager);
    return manager;
}


/**
 * @param {SpellMessageDegreesOfSuccessManager} parent
 * @return {SpellMessageDegreeOfSuccessField}
 */
export function createSpellDegreeOfSuccessField(parent) {
    return new SpellMessageDegreeOfSuccessField({
        degreeOfSuccessCosts: 3,
        checked: false,
        used: false,
        isDegreeOfSuccessOption: true,
        parent
    })
}