import "../../../foundryMocks.js";
import {describe, it} from "mocha";
import {expect} from "chai";
import {AgentReference} from "module/data/references/AgentReference";
import {foundryApi} from "module/api/foundryApi";
import sinon from "sinon";
import SplittermondActor from "../../../../../module/actor/actor";


describe("AgentReference", () => {
    it("should initialize a token as token", () => {
        const mockActor = sinon.createStubInstance(SplittermondActor);
        const probe = AgentReference.initialize({documentName: "Token", id: "1", parent: {documentName: "Scene", id: "2"}, actor:mockActor});

        expect(probe.id).to.equal("1");
        expect(probe.sceneId).to.equal("2");
        expect(probe.type).to.equal("token");

    });

    it("should initialize an actor as actor", () => {
        const mockActor = sinon.createStubInstance(SplittermondActor);
        Object.defineProperty(mockActor, "documentName", {value:"Actor"})
        Object.defineProperty(mockActor, "id", {value:"1"})
        const probe = AgentReference.initialize(mockActor);

        expect(probe.id).to.equal("1");
        expect(probe.sceneId).to.be.null;
        expect(probe.type).to.equal("actor");
    });

    it("should initialize an dependent actor as token", () => {
        const mockActor = sinon.createStubInstance(SplittermondActor);
        Object.defineProperty(mockActor, "documentName", {value:"Actor"})
        Object.defineProperty(mockActor, "id", {value:"3"})
        Object.defineProperty(mockActor, "parent", {value:{documentName: "Token", id: "2", parent: {documentName: "Scene", id: "1"}}});
        const probe = AgentReference.initialize(mockActor);

        expect(probe.id).to.equal("2");
        expect(probe.sceneId).to.equal("1");
        expect(probe.type).to.equal("token");
    });

    it("should handle no tokens to reference", () => {
        sinon.stub(foundryApi, "getToken").returns(undefined);

        const underTest = new AgentReference({id: "1234", sceneId: "3456", type: "token"});

        expect(() => underTest.getAgent()).to.throw(Error);
    });

    it("should handle no actors to reference", () => {
        sinon.stub(foundryApi, "getActor").returns(undefined);

        const underTest = new AgentReference({id: "1234", sceneId: null, type: "actor"});

        expect(() => underTest.getAgent()).to.throw(Error);
    });
})