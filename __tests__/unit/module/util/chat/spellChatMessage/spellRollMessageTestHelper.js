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
import {c} from "sinon/lib/sinon/spy-formatters.js";
import {ItemReference} from "../../../../../../module/data/references/ItemReference.js";
import {AgentReference} from "../../../../../../module/data/references/AgentReference.js";
import {Cost} from "../../../../../../module/util/costs/Cost.js";

export function createSpellActionManager() {
    const casterReference= new AgentReference({id:"1", sceneId:null, type:"actor"})
    const spellReference = new ItemReference({id:"1", agentReference:null})
    const actionManager = new SpellMessageActionsManager();
    const damage = new (SpellMessageActionsManager.defineSchema().damage).type({
        used: false,
        available: true,
        adjusted: "1d6",
        parent:actionManager,
    });
    const focus = new (SpellMessageActionsManager.defineSchema().focus).type({
        used: false,
        available: true,
        adjusted: new Cost(1,0,false).asModifier(),
        parent:actionManager,
    });
    const ticks = new (SpellMessageActionsManager.defineSchema().ticks).type({
        used: false,
        available: true,
        adjusted: 3,
        parent:actionManager,
    });

    const splinterPoint = new (SpellMessageActionsManager.defineSchema().splinterPoint).type({
        used: false,
        available: true,
        parent:actionManager,
    });

    const magicFumble = new (SpellMessageActionsManager.defineSchema().magicFumble).type({
        used: false,
        available: true,
        parent:actionManager,
    });
    actionManager.updateSource({casterReference, spellReference, focus, damage, ticks, splinterPoint, magicFumble})
    return actionManager;
}

export function createSplittermondSpellRollMessage() {
    const spellRollMessage = new SplittermondSpellRollMessage({
        spellReference: new ItemReference({id:"1", agentReference:null}),
        degreeOfSuccessManager: createSpellDegreeOfSuccessManager(),
        actionManager: createSpellActionManager(),
        constructorRegistryKey: "SplittermondSpellRollMessage"
    });
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

export function createSpellDegreeOfSuccessManager() {
    const manager = new SpellMessageDegreesOfSuccessManager({
        initialDegreesOfSuccess: 3,
        totalDegreesOfSuccess: 3,
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