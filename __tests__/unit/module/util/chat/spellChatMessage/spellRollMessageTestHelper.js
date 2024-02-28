import {identity} from "../../../../foundryMocks.js";
import {
    SpellDegreesOfSuccessManager
} from "../../../../../../module/util/chat/spellChatMessage/SpellDegreesOfSuccessManager.js";
import {
    SpellMessageDegreeOfSuccessField
} from "../../../../../../module/util/chat/spellChatMessage/SpellMessageDegreeOfSuccessField.js";
import {
    SplittermondSpellRollMessage
} from "../../../../../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";

export function createSplittermondSpellRollMessage() {
    return new SplittermondSpellRollMessage({
        degreeOfSuccessManager: createSpellDegreeOfSuccessManager(),
        constructorRegistryKey: "SplittermondSpellRollMessage"
    });

}

export function createSpellDegreeOfSuccessManager() {
    const manager = new SpellDegreesOfSuccessManager({
        initialDegreesOfSuccess: 3,
        totalDegreesOfSuccess: 3,
        usedDegreesOfSuccess: 0
    });
    manager.testField = createSpellDegreeOfSuccessField(manager)
    return manager;
}


/**
 * @param {SpellDegreesOfSuccessManager} parent
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