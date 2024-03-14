import {getActor, getActorWithItemOfType} from "./fixtures.js"
import {handleChatAction, SplittermondChatCard} from "../../module/util/chat/SplittermondChatCard.js";
import {api} from "../../module/api/api.js";
import {SplittermondTestRollMessage} from "./resources/SplittermondTestRollMessage.js";
import {SplittermondSpellRollMessage} from "../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";

export function chatActionFeatureTest(context) {
    const {describe, it, expect} = context;

    describe("SplittermondChatCard", () => {
        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const message = new SplittermondTestRollMessage({title: "a"});
            const chatCard = SplittermondChatCard.create(actor, message, {type:5, mode:'CHAT.RollPublic'});

            await chatCard.sendToChat();
            const messageId = chatCard.messageId;

            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
            ChatMessage.deleteDocuments([messageId]);
        });

        it("should rerender the same chat card on update", async () => {
            const actor = getActor(this);
            const message = new SplittermondTestRollMessage({title: "title"});
            const chatCard = SplittermondChatCard.create(actor, message,{type:5, mode:'CHAT.RollPublic'});

            await chatCard.sendToChat();
            const messagesBeforeUpdate = getCollectionLength(game.messages);
            const messageId = chatCard.messageId;
            message.updateSource({title: "Manchete"});
            await chatCard.updateMessage();


            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
            expect(game.messages.get(messageId).content, `Did not find message with id ${messageId}`).to.contain("Manchete");
            expect(getCollectionLength(game.messages), "Message count before and after update").to.equal(messagesBeforeUpdate);

            ChatMessage.deleteDocuments([messageId]);
        });

        it("should be able to reproduce a message from handled chat action", async () => {
            const actor = getActor(this);
            const message = new SplittermondTestRollMessage({title: "title"});
            const chatCard = SplittermondChatCard.create(actor, message,{type:5, mode:'CHAT.RollPublic'});
            await chatCard.sendToChat();

            await handleChatAction("alterTitle", chatCard.messageId);
            expect(api.messages.get(chatCard.messageId).content, "title was updated").to.contain("title2");
            ChatMessage.deleteDocuments([chatCard.messageId]);
        });

        function getCollectionLength(collection) {
            return collection.map(() => 1).reduce((a, b) => a + b, 0)
        }
    });

    describe("SpellRollMessage", () => {
        it("actor should consume enhanced spell", async () => {
            const actor = getActorWithItemOfType(this, "spell");
            await actor.update({system:{focus:{channeled:{entries:[]}, exhausted:{value:0}, consumed: {value:0}}}});
            const spell = actor.items.find(item => item.type === "spell");
            const chatMessage = createSampleChatMessage(actor, spell);

            await chatMessage.sendToChat()
            const messageId = chatMessage.messageId;
            await handleChatAction("spellEnhancementUpdate", messageId);
            await handleChatAction("consumeCosts", messageId);

            expect(actor.system.focus.exhausted.value +
                actor.system.focus.consumed.value +
                actor.system.focus.channeled.value).to.be.greaterThan(0);


            await actor.update({system:{focus:{channeled:{entries:[]}, exhausted:{value:0}, consumed: {value:0}}}});
            ChatMessage.deleteDocuments([messageId]);
        })

        /**
         * @param {SplittermondActor} actor
         * @param {SplittermondSpellItem} spell
         * @return {SplittermondChatCard}
         */
        function createSampleChatMessage(actor, spell) {
            /**@type {CheckReport}*/const checkReport = {
                roll: {
                    total: 35,
                    dice: [{total: 18}],
                    tooltip: "",
                },
                skill: {
                    id: spell.skill.id,
                    points: 6,
                    attributes: {
                        [spell.skill.attribute1.id]: spell.skill.attribute1.value,
                        [spell.skill.attribute2.id]: spell.skill.attribute2.value,
                    },
                },
                modifierElements: ["3"],
                rollType: "standard",
                succeeded: true,
                degreeOfSuccess: 5,
                difficulty: 20,
                isFumble: false,
                isCrit: true,
                degreeOfSuccessMessage: "mega success",
            };
            return SplittermondChatCard.create(
                actor, SplittermondSpellRollMessage.createRollMessage(spell, checkReport),
                {type: 5, mode: 'CHAT.RollPublic'}
            );
        }
    });


    describe("chat feature API tests", () => {
        it("should deliver the current user", () => {
            const currentUser = api.currentUser;
            expect(isUser(currentUser), "current User adheres to our interface").to.be.true;
        });

        it("should deliver all users", () => {
            const users = api.users;
            expect(isUser(users.find(() => true)), "users adhere to our interface").to.be.true;
        });

        it("should produce a speaker from actor", () => {
            const actor = getActor(this);
            const speaker = api.getSpeaker({actor});

            expect(speaker, "speaker is an object").to.be.an("object");
            expect(speaker.scene, "speaker has a scene").to.be.a("string");
            expect(speaker.token, "speaker declares a token").to.not.be.undefined;
            expect(speaker.actor, "speaker declares an actor").to.equal(actor.id);
        });

        it("should return a message id when creating a chat message", async () => {
            const actor = getActor(this);
            const speaker = api.getSpeaker({actor});
            const sampleMessageContent = {
                user: api.currentUser.id,
                speaker,
                type: api.chatMessageTypes.ROLL,
                content: "Random text content",
                flags: {
                    splittermond: {
                        chatCard: {somthing: "else"},
                    },
                }
            };
            const message = await api.createChatMessage(sampleMessageContent);

            expect(message.id, "messageId is a string").to.be.a("string");
            ChatMessage.deleteDocuments([message.id]);
        });

        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const speaker = api.getSpeaker({actor});
            const sampleMessageContent = {
                user: api.currentUser.id,
                speaker,
                type: api.chatMessageTypes.ROLL,
                content: "Random text content",
                flags: {
                    splittermond: {
                        chatCard: {somthing: "else"},
                    },
                }
            };
            const message = await api.createChatMessage(sampleMessageContent);

            const retrievedMessage = api.messages.get(message.id);
            expect(retrievedMessage, "message was found").to.not.be.undefined;
            expect(retrievedMessage.getFlag("splittermond", "chatCard"))
                .to.deep.equal(sampleMessageContent.flags.splittermond.chatCard);
            ChatMessage.deleteDocuments([message.id]);
        });


        it("should deliver a template renderer", async () => {
            const content = "Rhaaaaagaahh"
            const renderedHtml = await api.renderer(
                "systems/splittermond/__tests__/integration/resources/testTemplate.hbs", {title: content});
            expect(renderedHtml, "renderedHtml is a string").to.be.a("string");
            expect(renderedHtml, "renderedHtml contains the content").to.contain(content);
        });

        it("transfer events via socket", () => {
            api.socket.on("system.splittermond.quench.test.event", (data) => {
                expect(data.test).to.be.equal("test");
            });
            api.socket.emit("system.splittermond.quench.test.event", {test: "test"});
        });

        it("delivers the the correct chat message types", ()=> {
            const types = api.chatMessageTypes;
            expect(types, "chatMessageTypes is an object").to.be.an("object");
            expect(Object.keys(types).length).to.equal(6);
            expect(types.EMOTE, "chatMessageTypes has an emote").to.be.a("number");
            expect(types.IC, "chatMessageTypes has an in character").to.be.a("number");
            expect(types.OOC, "chatMessageTypes has an out of character").to.be.a("number");
            expect(types.OTHER, "chatMessageTypes has an other").to.be.a("number");
            expect(types.ROLL, "chatMessageTypes has a roll").to.be.a("number");
            expect(types.WHISPER, "chatMessageTypes has a whisper").to.be.a("number");
        });

        function isUser(object) {
            return typeof object === "object" &&
                object && "isGM" in object && "id" in object && "active" in object;
        }
    });
}