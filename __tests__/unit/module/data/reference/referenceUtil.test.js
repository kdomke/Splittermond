import "../../../foundryMocks.js";
import {describe, it, afterEach} from "mocha";
import {expect} from "chai";
import sinon from "sinon";
import {referencesUtils} from "../../../../../module/data/references/referencesUtils.js";
import {api} from "../../../../../module/api/api.js";

describe('getBestActor', () => {
    afterEach(()=> sinon.restore());
    it("should return an actor for token", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        const agentMock = {documentName:"Token", parent: {}, id:"1"}
        sinon.stub(api,"getToken").returns(agentMock);
        sinon.stub(api,"getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should query the actor if no token is found", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        const agentMock = {documentName:"Actor", parent: null, id:"1"}
        sinon.stub(api,"getToken").returns(null);
        sinon.stub(api,"getActor").returns(agentMock);
        sinon.stub(api,"getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should throw exception if no actor can be derived from the speaker", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        sinon.stub(api,"getToken").returns(null);
        sinon.stub(api,"getActor").returns(null);
        sinon.stub(api,"getSpeaker").returns(sampleToken);

        expect(()=>  referencesUtils.findBestUserActor()).to.throw(Error);
    });

});