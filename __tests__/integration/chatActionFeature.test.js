import {getActor, getActorWithItemOfType} from "./fixtures.js"
import {handleChatAction, SplittermondChatCard} from "../../module/util/chat/SplittermondChatCard.js";
import {chatFeatureApi} from "../../module/util/chat/chatActionGameApi.js";
import {SplittermondTestRollMessage} from "./resources/SplittermondTestRollMessage.js";
import {SplittermondSpellRollMessage} from "../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";

export function chatActionFeatureTest(context) {
    const {describe, it, expect} = context;

    describe("SplittermondChatCard", () => {
        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const message = new SplittermondTestRollMessage({title: "a"});
            const chatCard = SplittermondChatCard.create(actor, message);

            await chatCard.sendToChat();
            const messageId = chatCard.messageId;

            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
            ChatMessage.deleteDocuments([messageId]);
        });

        it("should rerender the same chat card on update", async () => {
            const actor = getActor(this);
            const message = new SplittermondTestRollMessage({title: "title"});
            const chatCard = SplittermondChatCard.create(actor, message);

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
            const chatCard = SplittermondChatCard.create(actor, message);
            await chatCard.sendToChat();

            await handleChatAction("alterTitle", chatCard.messageId);
            expect(chatFeatureApi.messages.get(chatCard.messageId).content, "title was updated").to.contain("title2");
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
                actor, SplittermondSpellRollMessage.createRollMessage(spell, checkReport)
            );
        }
    });


    describe("chat feature API tests", () => {
        it("should deliver the current user", () => {
            const currentUser = chatFeatureApi.currentUser;
            expect(isUser(currentUser), "current User adheres to our interface").to.be.true;
        });

        it("should deliver all users", () => {
            const users = chatFeatureApi.users;
            expect(isUser(users.find(() => true)), "users adhere to our interface").to.be.true;
        });

        it("should produce a speaker from actor", () => {
            const actor = getActor(this);
            const speaker = chatFeatureApi.getSpeaker({actor});

            expect(speaker, "speaker is an object").to.be.an("object");
            expect(speaker.scene, "speaker has a scene").to.be.a("string");
            expect(speaker.token, "speaker declares a token").to.not.be.undefined;
            expect(speaker.actor, "speaker declares an actor").to.equal(actor.id);
        });

        it("should return a message id when creating a chat message", async () => {
            const actor = getActor(this);
            const speaker = chatFeatureApi.getSpeaker({actor});
            const sampleMessageContent = {
                user: chatFeatureApi.currentUser.id,
                speaker,
                type: chatFeatureApi.chatMessageTypes.ROLL,
                content: "Random text content",
                flags: {
                    splittermond: {
                        chatCard: {somthing: "else"},
                    },
                }
            };
            const message = await chatFeatureApi.createChatMessage(sampleMessageContent);

            expect(message.id, "messageId is a string").to.be.a("string");
            ChatMessage.deleteDocuments([message.id]);
        });

        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const speaker = chatFeatureApi.getSpeaker({actor});
            const sampleMessageContent = {
                user: chatFeatureApi.currentUser.id,
                speaker,
                type: chatFeatureApi.chatMessageTypes.ROLL,
                content: "Random text content",
                flags: {
                    splittermond: {
                        chatCard: {somthing: "else"},
                    },
                }
            };
            const message = await chatFeatureApi.createChatMessage(sampleMessageContent);

            const retrievedMessage = chatFeatureApi.messages.get(message.id);
            expect(retrievedMessage, "message was found").to.not.be.undefined;
            expect(retrievedMessage.getFlag("splittermond", "chatCard"))
                .to.deep.equal(sampleMessageContent.flags.splittermond.chatCard);
            ChatMessage.deleteDocuments([message.id]);
        });


        it("should deliver a template renderer", async () => {
            const content = "Rhaaaaagaahh"
            const renderedHtml = await chatFeatureApi.renderer(
                "systems/splittermond/__tests__/integration/resources/testTemplate.hbs", {title: content});
            expect(renderedHtml, "renderedHtml is a string").to.be.a("string");
            expect(renderedHtml, "renderedHtml contains the content").to.contain(content);
        });

        it("transfer events via socket", () => {
            chatFeatureApi.socket.on("system.splittermond.quench.test.event", (data) => {
                expect(data.test).to.be.equal("test");
            });
            chatFeatureApi.socket.emit("system.splittermond.quench.test.event", {test: "test"});
        });

        function isUser(object) {
            return typeof object === "object" &&
                object && "isGM" in object && "id" in object && "active" in object;
        }
    });
}