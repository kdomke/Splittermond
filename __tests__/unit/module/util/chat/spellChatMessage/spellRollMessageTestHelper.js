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

export function createSpellActionManager() {
    const casterReference = new AgentReference({type: "actor"});
    const spellReference = new ItemReference({});
    const checkReportReference = {degreeOfSuccess: 3, isFumble: false, succeeded: true, skill: {name: "skillName"}};
    Object.defineProperty(checkReportReference, "get", {value: () => checkReportReference});

    const actionManager = new SpellMessageActionsManager();
    const focus = new (SpellMessageActionsManager.defineSchema().focus).type({
        spellReference,
        checkReportReference,
        used: false,
        available: true,
        adjusted: new Cost(1, 0, false).asModifier(),
    });
    const damage = new (SpellMessageActionsManager.defineSchema().damage).type({
        used: false,
        available: true,
        itemReference: spellReference,
        checkReportReference,
    });
    const ticks = new (SpellMessageActionsManager.defineSchema().ticks).type({
        used: false,
        available: true,
        adjusted: 3,
        parent: actionManager,
    });

    const splinterPoint = new (SpellMessageActionsManager.defineSchema().splinterPoint).type({
        checkReportReference: checkReportReference,
        actorReference: casterReference,
        used: false,
        parent: actionManager,
    });

    const magicFumble = new (SpellMessageActionsManager.defineSchema().magicFumble).type({
        casterReference,
        spellReference,
        checkReportReference,
        used: false,
    });
    const activeDefense = new (SpellMessageActionsManager.defineSchema().activeDefense).type({
        itemReference: spellReference,
        checkReportReference,
        used: false,
    });
    actionManager.updateSource({focus, damage, ticks, splinterPoint, magicFumble, activeDefense})
    return actionManager;
}

function prepareForDegreeOfSuccessManager(spellMock, checkReport) {
    sinon.stub(spellMock, "degreeOfSuccessOptions").get(() => sinon.stub().returns(true))
    sinon.stub(spellMock, "enhancementCosts").get(() => "1EG/+1V1");
    sinon.stub(spellMock, "castDuration").get(() => 3);

    checkReport.degreeOfSuccess = checkReport.degreeOfSuccess ?? 3;
}
function prepareForRenderer(spellMock, checkReport) {
   sinon.stub(spellMock,"description").get(() => "description");
   spellMock.name = spellMock.name ?? "name";
}

function withTeardown(messageClass, {spellMock=sinon.stub(), actorMock=sinon.stub(),apiGetItemMock=sinon.stub(), apiGetActorMock=sinon.stub()}) {
    return (afterOrAfterEach)=>{
        afterOrAfterEach(()=>{
            apiGetItemMock.restore();
            apiGetActorMock.restore();
        });
        return {messageClass, spellMock, actorMock, apiGetItemMock, apiGetActorMock, afterOrAfterEach}
    }
}
export function createSplittermondSpellRollMessage() {
    const toObjectMock = sinon.stub(SplittermondDataModel.prototype, "toObject").callsFake(function(){
        this.parent = "any";
        return this;});
    const spellMock = sinon.createStubInstance(SplittermondSpellItem);
    const actorMock = sinon.createStubInstance(SplittermondActor);
    actorMock.documentName = "Actor";
    actorMock.id = "1";
    actorMock.items = {get:() => spellMock};
    spellMock.actor = actorMock;

    const apiGetItemMock = sinon.stub(foundryApi, "getItem").returns(spellMock);
    const apiGetActorMock = sinon.stub(foundryApi, "getActor").returns(actorMock);
    const checkReport = {};//degreeOfSuccess: 3, isFumble: false, succeeded: true, skill: {name: "skillName"}};
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
    return withTeardown(spellRollMessage, {spellMock, actorMock,apiGetItemMock, apiGetActorMock});
}

function postfixActionManager(actionManager) {
   actionManager.focus.adjusted = new Cost(0,0,false).asModifier();
}

function injectParent(object) {
    for (const key in object) {
        if (object[key] && typeof object[key] === "object" && key !== "parent") {
            object[key].parent = object;
            injectParent(object[key]);
        }
    }
}

/** @param {SplittermondSpellRollMessage} parent*/
export function createRenderer(parent) {
    return new SplittermondSpellRollMessage({
        messageTitle: "spelly spell",
        spellEnhancementDescription: "spell enhancement description",
        degreesOfSuccess: 3,
        parent
    });
}

export function createSpellDegreeOfSuccessManager(checkReportReference = null) {
    if (!checkReportReference) {
        checkReportReference = {degreeOfSuccess: 3, isFumble: false, succeeded: true, skill: {name: "skillName"}};
        Object.defineProperty(checkReportReference, "get", {value: () => checkReportReference});
    }
    const manager = new SpellMessageDegreesOfSuccessManager({
        checkReportReference,
        usedDegreesOfSuccess: 0
    });
    manager.testField = createSpellDegreeOfSuccessField(manager)
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