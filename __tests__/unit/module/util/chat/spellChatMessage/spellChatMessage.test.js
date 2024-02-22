import  {identity} from "../../../../foundryMocks.js"
import {describe} from "mocha";
import {expect} from "chai";
import {createHtml} from '../../../../../handlebarHarness.js'
import SplittermondSpellItem from "../../../../../../module/item/spell.js";
import {splittermond} from "../../../../../../module/config.js";
global.CONFIG = {splittermond: splittermond};
global.game.i18n = {localize: identity};
import {createSpellRollChatMessage} from "../../../../../../module/util/chat/spellChatMessage/createSpellChatMessage.js";

describe('spellChatMessage', () => {
    it('loads', () => {
        const spell = new SplittermondSpellItem({}, {splittermond:{ready:true}});
        spell.system = {
            "description": "Die Geschwindigkeit des Zauberers erhöht sich um 2 Punkte.",
            "source": "",
            "availableIn": "motionmagic 1 , enhancemagic 2 ",
            "skill": "enhancemagic",
            "skillLevel": 2,
            "spellType": "Bewegung stärken",
            "costs": "K4V1",
            "difficulty": "18",
            "damage": "",
            "range": "Zauberer",
            "castDuration": "1 Tick",
            "effectDuration": "kanalisiert",
            "effectArea": "",
            "enhancementDescription": "Die Geschwindigkeit erhöht sich um insgesamt 4 Punkte",
            "enhancementCosts": "1 EG/+K1V1",
            "features": "",
            "degreeOfSuccessOptions": {
                "castDuration": "true",
                "consumedFocus": "true",
                "exhaustedFocus": null,
                "channelizedFocus": "true",
                "effectDuration": null,
                "damage": null,
                "range": null,
                "effectArea": null
            }
        }
        const checkResult ={
            succeeded: true,
            isCrit: false,
            isFumble: false,
            isGrazingHit: false,
            degreeOfSuccess: 2,
            roll: {total:21, dice: [{total: 6}, {total: 6}]},
            difficulty: 15,
            damage: "2W6",
            ticks: "1",
            cost: "3",
        }


        const data = createSpellRollChatMessage(spell, checkResult, false, "standard");
        const html = createHtml("templates/chat/spell-skill-check.hbs", data)
        console.log(html);
    })
});