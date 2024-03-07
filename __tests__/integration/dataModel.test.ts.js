import {getActor, getUnlinkedToken} from "./fixtures.js";
import {AgentReference} from "../../module/data/references/AgentReference.js";
import {referencesApi} from "../../module/data/references/referencesApi.js";

export function dataModelTest(context) {
    const {describe, it, expect} = context;
    describe("foundry data model API", () => {
        const TestChild = class extends foundry.abstract.DataModel {
            static defineSchema() {
                return {
                    name: new foundry.data.fields.StringField({required: true, blank: false}),
                }
            }
        };
        const TestParent = class extends foundry.abstract.DataModel {
            static defineSchema() {
                return {
                    child: new foundry.data.fields.EmbeddedDataField(TestChild, {required: true, blank: false}),
                }
            }
        }
        it("injects a parent into embedded data", () => {
            const underTest = new TestParent({child: {name: "test"}});

            expect(underTest.child.parent).to.equal(underTest);
        });

        it("restores embedded data", async () => {
            const underTest = new TestParent({child: {name: "test"}});

            const objectifiedMessage = underTest.toObject();
            const restoredMessage = new TestParent(objectifiedMessage);

            expect(restoredMessage.child).to.be.instanceOf(TestChild);
            expect(restoredMessage.child.name).to.equal("test");
            expect(restoredMessage.child.parent).to.equal(restoredMessage);
        });
    });

    describe("references API", () => {
        it("should get an actor by id", async () => {
            const sampleActor = getActor()
            const fromApi = referencesApi.getActor(sampleActor.id)

            expect(fromApi).to.equal(sampleActor);
        });

        it("should return undefined for nonsense id", () => {
            const fromAPI = referencesApi.getActor("nonsense");

            expect(fromAPI).to.be.undefined;
        })

        it("should get a token by id and scene", async () => {
            const sampleToken = getUnlinkedToken(this);

            const sceneId = sampleToken.parent.id;
            const fromAPI = referencesApi.getToken(sceneId, sampleToken.id);

            expect(sampleToken).to.equal(fromAPI);
        });

        it("should return undefined for nonsense id", () => {
            const fromAPI = referencesApi.getToken("nonsense", "bogus");

            expect(fromAPI).to.be.undefined;
        });
    });

    describe("AgentReference", () => {
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

        it("should be able to read the document type from the document name field", () => {
            expect(getActor().documentName).to.equal("Actor");
            expect(getUnlinkedToken().documentName).to.equal("Token");
        })
    });
}