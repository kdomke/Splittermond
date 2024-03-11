import "../../../foundryMocks.js";
import {SplittermondDataModel} from "../../../../../module/data/SplittermondDataModel.js";
import {OnAncestorReference} from "../../../../../module/data/references/OnAncestorReference.js";
import {describe,it} from "mocha";
import {expect} from "chai";
import sinon from "sinon";

describe("OnParentReference", () => {
    it("should return the value on the parent", () => {
        const model = createModel();
        model.id = "1";
        model.target= "I want to read this";
        const reference = OnAncestorReference.for(model.constructor)
            .identifiedBy("id", "1")
            .references("target");
        reference.parent = model;
        expect(reference.get()).to.equal("I want to read this");
    });

    it("should return the value on the parent", () => {
        const model = createModel();
        model.id = "1";
        model.target= "I want to read this";
        const reference = OnAncestorReference.for(model.constructor)
            .identifiedBy("id","1")
            .references("target");
        model.firstChild.child.reference = reference;
        reference.parent = model.firstChild.child;


        const result = model.firstChild.child.reference.get();

        expect(result).to.equal("I want to read this");
    });

    it("should throw an error if the parent does not exist", () => {
        const model = createModel();
        model.id = "1";
        model.target= "I want to read this";
        const reference = OnAncestorReference.for(model.constructor)
            .identifiedBy("id", model.id)
            .references("target");
        model.firstChild.child.reference = reference
        model.firstChild.child.parent = null;

        expect(()=>model.firstChild.child.reference.get()).to.throw("No ancestor with id 1 found");
    });

    it("should throw an error if id is not defined during setup", () => {
        const model = createModel();
        model.target= "I want to read this";
        expect(() => OnAncestorReference.for(model).identifiedBy("id")
            .references("target")).to.throw(Error);
    });

    it("should throw an error if reference is not defined during setup", () => {
        const model = createModel();
        model.id= "target";
        expect(() => OnAncestorReference.for(model).identifiedBy("id")
            .references("target")).to.throw(Error);
    });

});

function createModel() {
    const grandchild = new SplittermondDataModel({value:"grandchild"})
    grandchild.constructor.defineSchema = sinon.stub().returns({value: ""});
    const firstChild = new SplittermondDataModel({value:"firstChild", child: grandchild })
    firstChild.constructor.defineSchema = sinon.stub().returns({value: "", child:""});
    const parent = new SplittermondDataModel({firstChild})
    parent.constructor.defineSchema = sinon.stub().returns({value: "", child:"", id:"", target:""});
    grandchild.updateSource({parent: firstChild});
    firstChild.updateSource({parent: parent});
    return parent;
};