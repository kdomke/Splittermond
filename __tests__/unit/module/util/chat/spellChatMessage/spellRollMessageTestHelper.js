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

export function createSpellActionManager() {
    const casterReference= new AgentReference({type:"actor"});
    const spellReference = new ItemReference({});
    const checkReportReference= {degreeOfSuccess: 3, isFumble: false, succeeded: true, skill:{name:"skillName"}};
    Object.defineProperty(checkReportReference, "get", {value: () => checkReportReference});

    const actionManager = new SpellMessageActionsManager();
    const focus = new (SpellMessageActionsManager.defineSchema().focus).type({
        spellReference,
        checkReportReference,
        used: false,
        available: true,
        adjusted: new Cost(1,0,false).asModifier(),
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
        parent:actionManager,
    });

    const splinterPoint = new (SpellMessageActionsManager.defineSchema().splinterPoint).type({
        checkReportReference:checkReportReference,
        actorReference:casterReference,
        used: false,
        parent:actionManager,
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

export function createSplittermondSpellRollMessage() {
    const checkReport= {degreeOfSuccess: 3, isFumble: false, succeeded: true, skill: {name: "skillName"}};
    const checkReportReference = OnAncestorReference.for(SplittermondSpellRollMessage)
        .identifiedBy("constructorKey", "SplittermondSpellRollMessage").references("checkReport")
    const spellRollMessage = new SplittermondSpellRollMessage({
        spellReference: new ItemReference({id:"1", agentReference:null}),
        degreeOfSuccessManager: createSpellDegreeOfSuccessManager(checkReportReference),
        actionManager: createSpellActionManager(),
        constructorKey: "SplittermondSpellRollMessage"
    });
    checkReportReference.parent = spellRollMessage;
    spellRollMessage.degreeOfSuccessManager.parent = spellRollMessage;
    spellRollMessage.renderer = createRenderer(spellRollMessage);
    return spellRollMessage;
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

export function createSpellDegreeOfSuccessManager(checkReportReference =null) {
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