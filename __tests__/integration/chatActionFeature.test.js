import {SplittermondSpellRollMessage} from "../../module/util/chat/spellChatMessage/SplittermondSpellRollMessage.js";
import {getActor, getSpell} from "./fixtures.js"
import {SplittermondChatCard} from "../../module/util/chat/SplittermondChatCard.js";
import {chatFeatureApi} from "../../module/util/chat/chatActionGameApi.js";

export function chatActionFeatureTest(context) {
    const {describe, it, expect} = context;

    describe("SplittermondChatCard", () => {
        it("should post a message in the chat", async () => {
            const actor = getActor(this);
            const spell = getSpell(this);
            const message = SplittermondSpellRollMessage.createRollMessage(spell, actor, {degreeOfSuccess:3});
            const chatCard = SplittermondChatCard.create(actor, message);

            await chatCard.sendToChat();
            const messageId = chatCard.messageId;

            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
            ChatMessage.deleteDocuments([messageId]);
        });

        it("should rerender the same chat card on update", async () =>{
            const actor = getActor(this);
            const spell = getSpell(this);
            //TODO: using a real message here is problematic, because we have no control over the content which we assert
            const message = SplittermondSpellRollMessage.createRollMessage(spell, actor, {degreeOfSuccess:3});
            const chatCard = SplittermondChatCard.create(actor, message);

            await chatCard.sendToChat();
            const messagesBeforeUpdate = getCollectionLength(game.messages);
            const messageId = chatCard.messageId;
            message.updateSource({totalDegreesOfSuccess: 8});
            await chatCard.updateMessage();


            expect(game.messages.get(messageId), `Did not find message with id ${messageId}`).to.not.be.undefined;
            expect(game.messages.get(messageId).content, `Did not find message with id ${messageId}`).to.contain("8");
            expect(getCollectionLength(game.messages), "Message count before and after update").to.equal(messagesBeforeUpdate);

            ChatMessage.deleteDocuments([messageId]);
        });

        function getCollectionLength(collection){
            return collection.map(i=>1).reduce((a,b)=>a+b,0)
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
                "systems/splittermond/__tests__/integration/testTemplate.hbs", {title: content});
            expect(renderedHtml, "renderedHtml is a string").to.be.a("string");
            expect(renderedHtml, "renderedHtml contains the content").to.contain(content);
        })

        it("transfer events via socket",() =>{
            chatFeatureApi.socket.on("system.splittermond.quench.test.event", (data) => {
                expect(data.test).to.be.equal("test");
            });
            chatFeatureApi.socket.emit("system.splittermond.quench.test.event", {test: "test"});
        })


        function isUser(object) {
            return typeof object === "object" &&
                object && "isGM" in object && "id" in object && "active" in object;
        }
    })
}