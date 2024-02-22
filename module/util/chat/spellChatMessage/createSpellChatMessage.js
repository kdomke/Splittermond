import {initializeModule as initializeDegreeOfSuccessOptions} from "./degreeOfSuccessOptions.js";

const degreeOfSuccessOptions = initializeDegreeOfSuccessOptions(game.i18n);

/**
 * @typedef {{
 *     img:string
 *     system: {SpellData}
 *    }} SplittermondSpellForChat
 */
/**
 * @param {SplittermondSpellForChat} spell
 * @param {CheckReport} checkReport
 * @param {boolean} hideDifficulty
 * @param {RollType} rollType
 */
export function createSpellRollChatMessage(spell, checkReport, hideDifficulty, rollType) {
    const context = createSpellRollMessageContext()
        .setDocumentClass(checkReport)
        .setHeader(spell, checkReport.difficulty, hideDifficulty, rollType)
        .setRollResult(spell, checkReport)
        .setDegreeOfSuccessOptions(spell, checkReport.degreeOfSuccess)
        .build();

    return context;
}

/**
 * @typedef {{succeeded: boolean, isFumble: boolean, isCrit: boolean, isGrazingHit: boolean}} DocumentClassContext
 * @typedef {{
 *   documentClass: DocumentClassContext
 * }}
 */
function createSpellRollMessageContext() {
    const messageId = `${Math.random().toString(36).substring(7)}${Date.now()}`;
    const templateContext = {}
    const setters = {
        setDocumentClass,
        setHeader,
        setRollResult,
        setDegreeOfSuccessOptions,
        build,
    }
    return setters

    /** @param {CheckReport}checkReport */
    function setDocumentClass(checkReport) {
        templateContext.documentClass = {
            succeeded: checkReport.succeeded,
            isFumble: checkReport.isFumble,
            isCrit: checkReport.isCrit,
        };
        return setters;
    }

    /** @param {SplittermondSpellForChat} spell
     *  @param {number} difficulty
     *  @param {boolean} hideDifficulty
     *  @param {RollType} rollType
     */
    function setHeader(spell, difficulty, hideDifficulty, rollType) {
        templateContext.header = {
            title: spell.system.name,
            img: spell.img,
            difficulty,
            hideDifficulty,
            rollType: rollType
        };
        return setters;
    }

    /**
     * @param {SplittermondSpellForChat} spell
     * @param {CheckReport} checkReport
     */
    function setRollResult(spell, checkReport) {
        templateContext.rollResult = {
            total: checkReport.roll.total,
            degreesOfSuccess: checkReport.degreeOfSuccess,
            degreeOfSuccessMessage: checkReport.degreeOfSuccessMessage
        }
        return setters;

    }

    /**
     * @param {SplittermondSpellForChat} spell
     * @param {number} degreesOfSuccess
     */
    function setDegreeOfSuccessOptions(spell, degreesOfSuccess) {
        function addOption(option) {return option.degreesOfSuccess <= degreesOfSuccess && spell.system.degreeOfSuccessOptions[option.key];}
        templateContext.degreeOfSuccessOptions = degreeOfSuccessOptions(spell, degreesOfSuccess, messageId)
            .addDegreeOfSuccessOption("castDuration", addOption)
            .addDegreeOfSuccessOption("exhaustedFocus", addOption)
            .addDegreeOfSuccessOption("channelizedFocus", addOption)
            .addDegreeOfSuccessOption("consumedFocus", addOption)
            .addDegreeOfSuccessOption("range", addOption)
            .addDegreeOfSuccessOption("damage", addOption)
            .addDegreeOfSuccessOption("effectArea", addOption)
            .addDegreeOfSuccessOption("effectDuration", addOption)
            .build()
        return setters;
    }

    function build() {
        return templateContext;
    }
}