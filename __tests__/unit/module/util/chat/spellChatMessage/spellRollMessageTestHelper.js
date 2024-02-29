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

export function createSpellActionManager() {
    const damage = new (SpellMessageActionsManager.defineSchema().damage).type({
        used: false,
        available: true,
        adjustedValue: "0"
    });
    const focus = new (SpellMessageActionsManager.defineSchema().focus).type({
        used: false,
        available: true,
        adjustedValue: "K3V3"
    });
    const ticks = new (SpellMessageActionsManager.defineSchema().ticks).type({
        used: false,
        available: true,
        adjustedValue: 3
    });
    return new SpellMessageActionsManager(
        {
            focus,
            damage,
            ticks,
            splinterPoint: {used: false, available: true}
        }
    )
}

export function createSplittermondSpellRollMessage() {
    const spellRollMessage = new SplittermondSpellRollMessage({
        degreeOfSuccessManager: createSpellDegreeOfSuccessManager(),
        actionManager: createSpellActionManager(),
        constructorRegistryKey: "SplittermondSpellRollMessage"
    });
    spellRollMessage.renderer = createRenderer(spellRollMessage);
    return spellRollMessage;
}

/** @param {SplittermondSpellRollMessage} parent*/
export function createRenderer(parent) {
    return new SplittermondSpellRollMessage({degreesOfSuccess: 3, parent});
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