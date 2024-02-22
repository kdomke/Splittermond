import {splittermond} from '../../../config.js';
import {parseCostString, parseSpellEnhancementDegreesOfSuccess} from "../../costs/costParser.js";

export function initializeModule(i18n) {

    return addDegreeOfSuccessOptions;

    /**
     * @param {SplittermondSpellForChat} spell
     * @param {number} degreesOfSuccess
     * @param {string} messageId
     */
    function addDegreeOfSuccessOptions(spell, degreesOfSuccess, messageId) {
        const degreeOfSuccessOptions = [];
        return {addDegreeOfSuccessOption, addSpellEnhancement, build}

        /**
         * @param {SpellDegreesOfSuccessOptions} option
         * @param {(degreeOfSuccessOption:SplittermondSpellEnhancement)=>boolean}onlyIf
         */
        function addDegreeOfSuccessOption(option, onlyIf) {
            const degreeOfSuccessOption = transformDegreeOfSuccessOption(option,splittermond.spellEnhancement[option], messageId);
            if (onlyIf(degreeOfSuccessOption)) {
                degreeOfSuccessOptions.push(degreeOfSuccessOption);
            }
            return {addDegreeOfSuccessOption, addSpellEnhancement, build}
        }

        function build(){
            return degreeOfSuccessOptions;
        }
    }
}


/**
 * @typedef {{id:string, degreesOfSuccess:number, focusCost:number, castDuration:number, damageIncrease:number, text:string, messageId:string}} DegreeOfSuccessOption
 * @param {SpellDegreesOfSuccessOptions} key
 * @param {SplittermondSpellEnhancement} currentConfig
 * @param {string} messageId
 * @return {DegreeOfSuccessOption}
 */
function transformDegreeOfSuccessOption(key, currentConfig, messageId) {
    return {
        id: `${key}-${messageId}`,
        class: key,
        key,
        degreesOfSuccess: currentConfig.degreesOfSuccess,
        focusCost: currentConfig.focusCost,
        castDuration: currentConfig.castDuration,
        damageIncrease: currentConfig.damageIncrease,
        text: `${currentConfig.degreesOfSucess} ${game.i18n.localize(currentConfig.textTemplate)}`,
        messageId: messageId
    };
}

/**
 *
 * @param {SplittermondSpellForChat} spell
 * @param {string} messageId
 * @param {number} degreesOfSuccess
 * @return {DegreeOfSuccessOption|null}
 */
function addSpellEnhancement(spell, degreesOfSuccess, messageId) {
    const degreesOfSuccessCost = parseSpellEnhancementDegreesOfSuccess(spell.system.enhancementCosts);
    const enhancementFocusCost = parseCostString(spell.system.enhancementCosts);
    if (degreesOfSuccess < degreesOfSuccessCost) {
        return null
    } else {
        return {
            id: `spellEnhancement-${messageId}`,
            degreesOfSuccess: degreesOfSuccessCost,
            focusCost: enhancementFocusCost,
            castDuration: 0,
            damageIncrease: 0,
            text: `${spell.system.enhancementCosts}: ${spell.system.enhancementDescription}`,
            messageId: messageId
        };
    }
}