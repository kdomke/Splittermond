import "../../../foundryMocks.js";
import {describe, it, afterEach} from "mocha";
import {expect} from "chai";
import {chatFeatureApi} from "../../../../../module/util/chat/chatActionGameApi.js";
import sinon from "sinon";
import {referencesUtils} from "../../../../../module/data/references/referencesUtils.js";
import {foundryApi} from "../../../../../module/api/foundryApi.js";

describe('getBestActor', () => {
    afterEach(()=> sinon.restore());
    it("should return an actor for token", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        const agentMock = {documentName:"Token", parent: {}, id:"1"}
        sinon.stub(foundryApi,"getToken").returns(agentMock);
        sinon.stub(chatFeatureApi,"getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should query the actor if no token is found", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        const agentMock = {documentName:"Actor", parent: null, id:"1"}
        sinon.stub(foundryApi,"getToken").returns(null);
        sinon.stub(foundryApi,"getActor").returns(agentMock);
        sinon.stub(chatFeatureApi,"getSpeaker").returns(sampleToken);

        const result = referencesUtils.findBestUserActor();

        expect(result.id).to.equal(agentMock.id);
    });

    it("should throw exception if no actor can be derived from the speaker", () => {
        const sampleToken = {scene: "scene", token:"token", actor:"actor", alias:"alias"};
        sinon.stub(foundryApi,"getToken").returns(null);
        sinon.stub(foundryApi,"getActor").returns(null);
        sinon.stub(chatFeatureApi,"getSpeaker").returns(sampleToken);

        expect(()=>  referencesUtils.findBestUserActor()).to.throw(Error);
    });

});