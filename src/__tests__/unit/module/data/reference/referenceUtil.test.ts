import "../../../foundryMocks.js";
import {describe, it, afterEach} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {referencesUtils} from "module/data/references/referencesUtils";
import {foundryApi} from "module/api/foundryApi";
import SplittermondActor from "module/actor/actor";

describe('getBestActor', () => {
    afterEach(() => sinon.restore());
    it("should return an actor for token", () => {
        const sampleToken = {scene: "scene", token: "token", actor: "actor", alias: "alias"};
        const actor = sinon.createStubInstance(SplittermondActor);
        const agentMock = {
            documentName: "Token",
            parent: {id: "2", documentName: "Scene"},
            id: "1",
            items: new Map(),
            actor: actor
        }
        sinon.stub(foundryApi, "getToken").returns(agentMock);
        sinon.stub(foundryApi, "getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should query the actor if no token is found", () => {
        const sampleToken = {scene: "scene", token: "token", actor: "actor", alias: "alias"};
        const agentMock = {documentName: "Actor", parent: undefined, id: "1", items: new Map()}
        sinon.stub(foundryApi, "getToken").returns(undefined);
        sinon.stub(foundryApi, "getActor").returns(agentMock);
        sinon.stub(foundryApi, "getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should throw exception if no actor can be derived from the speaker", () => {
        const sampleToken = {scene: "scene", token: "token", actor: "actor", alias: "alias"};
        sinon.stub(foundryApi, "getToken").returns(undefined);
        sinon.stub(foundryApi, "getActor").returns(undefined);
        sinon.stub(foundryApi, "getSpeaker").returns(sampleToken);

        expect(() => referencesUtils.findBestUserActor()).to.throw(Error);
    });

});