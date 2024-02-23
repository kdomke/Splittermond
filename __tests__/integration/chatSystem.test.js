import {SplittermondSpellRollMessage} from "../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {getActor, getSpell} from "./fixtures.js"
import {SplittermondChatCard} from "../../module/util/chat/SplittermondChatCard.js";

export function chatSystemTest(context) {
    const {describe, it, expect} = context;

    describe("SplittermondChatCard", () => {
        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const spell = getSpell(this);
            const message = SplittermondSpellRollMessage.createRollMessage(spell, actor, {});
            const chatCard = SplittermondChatCard.create(actor, message);

            await chatCard.sendToChat();
            const messageId = chatCard.messageId;

            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
        });
    });
}