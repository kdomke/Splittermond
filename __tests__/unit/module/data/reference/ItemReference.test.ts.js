import "../../../foundryMocks.js";
import {describe, it, afterEach} from "mocha";
import {expect} from "chai";
import {AgentReference} from "../../../../../module/data/references/AgentReference.js";
import {referencesApi} from "../../../../../module/data/references/referencesApi.js";
import sinon from "sinon";
import {ItemReference} from "../../../../../module/data/references/ItemReference.js";


describe("AgentReference", () => {
    afterEach(() => sinon.restore());

    it("should produce a Reference for items on Actors", () => {
        const probe = ItemReference.initialize({id: "1", actor: {documentName: "Actor", id: "1"}});

        expect(probe.id).to.equal("1");
        expect(probe.actorReference).to.not.be.null;

    });

    it("should produce a reference for top-level items", () => {
        const probe = ItemReference.initialize({id: "1"});

        expect(probe.id).to.equal("1");
        expect(probe.actorReference).to.be.null;
    });

    it("should handle no spells to reference", () => {
        sinon.stub(referencesApi, "getItem").returns(undefined);

        const underTest = new ItemReference({id: "1234", actorReference:null});

        expect(() => underTest.getItem()).to.throw(Error);
    });

    it("should handle no actors to reference", () => {
        sinon.stub(referencesApi, "getActor").returns(undefined);

        const underTest = new ItemReference({
            id: "1234",
            actorReference: new AgentReference({id: "1234", scene: null, type: "actor"})
        });

        expect(() => underTest.getItem()).to.throw(Error);
    });

    it ("should handle no items on Actor", () => {
        sinon.stub(referencesApi, "getActor").returns({id:"1", items: new Map()});

        const underTest = new ItemReference({
            id: "1234",
            actorReference: new AgentReference({id: "1234", scene: null, type: "actor"})
        });

        expect(() => underTest.getItem()).to.throw(Error);
    });
})