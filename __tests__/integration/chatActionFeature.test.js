import {getActor, getUnlinkedToken} from "./fixtures.js"
import {handleChatAction, SplittermondChatCard} from "../../module/util/chat/SplittermondChatCard.js";
import {chatFeatureApi} from "../../module/util/chat/chatActionGameApi.js";
import {SplittermondTestRollMessage} from "./resources/SplittermondTestRollMessage.js";
import {AgentReference} from "../../module/util/chat/AgentReference.js";

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

    describe("AgentReference", () =>{
        it("should return an actor from a reference", () => {
            const sampleActor = getActor(this);
            const reference = AgentReference.initialize(sampleActor);

            expect(reference.getAgent()).to.equal(sampleActor);
        });

        it("should return a token from an actor reference", () => {
            const sampleToken = getUnlinkedToken(this);
            const reference = AgentReference.initialize(sampleToken.actor);

            expect(reference.getAgent()).to.equal(sampleToken.actor);
        });

        it("should return a actor from a token input", () => {
            const sampleToken = getUnlinkedToken(this);
            const reference = AgentReference.initialize(sampleToken);

            expect(reference.getAgent()).to.equal(sampleToken.actor);
        })

        it("should be able to read the document type from the document name field", () =>{
           expect(getActor().documentName).to.equal("Actor");
           expect(getUnlinkedToken().documentName).to.equal("Token");
        })
    })

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

        it("should get an actor by id", async () => {
            const sampleActor = getActor()
            const fromApi = chatFeatureApi.getActor(sampleActor.id)

            expect(fromApi).to.equal(sampleActor);
        });

        it("should return undefined for nonsense id", () => {
            const fromAPI = chatFeatureApi.getActor("nonsense");

            expect(fromAPI).to.be.undefined;
        })

        it("should get a token by id and scene", async () => {
            const sampleToken = getUnlinkedToken(this);

            const sceneId = sampleToken.parent.id;
            const fromAPI = chatFeatureApi.getToken(sceneId, sampleToken.id);

            expect(sampleToken).to.equal(fromAPI);
        });

        it("should return undefined for nonsense id", () => {
            const fromAPI = chatFeatureApi.getToken("nonsense", "bogus");

            expect(fromAPI).to.be.undefined;
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