import {
    ItemFeatureDataModel,
    ItemFeaturesModel,
    parseFeatures
} from "module/item/dataModel/propertyModels/ItemFeaturesModel";
import {describe, it, beforeEach, afterEach} from "mocha";
import {expect} from "chai";
import {foundryApi} from "../../../../../../module/api/foundryApi";
import sinon from "sinon";

describe("ItemFeaturesModel", () => {
    it("should provide comma separated values", () => {
        const feature1 = new ItemFeatureDataModel({name: "Scharf", value: 5});
        const feature2 = new ItemFeatureDataModel({name: "Ablenkend", value: 1});
        const features = new ItemFeaturesModel({internalFeatureList: [feature1, feature2]});

        expect(features.features).to.deep.equal("Scharf 5, Ablenkend");
    });

    it("should provide a string list ", () => {
        const feature1 = new ItemFeatureDataModel({name: "Scharf", value: 5});
        const feature2 = new ItemFeatureDataModel({name: "Ablenkend", value: 1});
        const features = new ItemFeaturesModel({internalFeatureList: [feature1, feature2]});

        expect(features.featuresAsStringList()).to.deep.equal(["Scharf 5", "Ablenkend"]);
    });
});

describe("ItemFeatureDataModel", () => {
    it("should produce a nice string representation", () => {
        const feature = new ItemFeatureDataModel({name: "Scharf", value: 5});
        expect(feature.toString()).to.equal("Scharf 5");
    });

    it("should omit values if none present", () => {
        const feature = new ItemFeatureDataModel({name: "Ablenkend", value: 1});
        expect(feature.toString()).to.equal("Ablenkend");
    });
});

describe("feature parser", () => {
    let sandbox: sinon.SinonSandbox;
    let warnStub: sinon.SinonStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        warnStub = sandbox.stub(foundryApi, "warnUser");
    });
    afterEach(() => sandbox.restore());

    ["", 0, undefined, null].forEach(feature => {
        it(`should return an empty array for invalid feature: ${feature}`, () => {
            const result = parseFeatures(feature as string);
            expect(result).to.deep.equal([]);
        });
    })
    it("should parse a feature string with a value", () => {
        const featureString = "Exakt 5";
        const result = parseFeatures(featureString);

        expect(result[0].name).to.equal("Exakt");
        expect(result[0].value).to.equal(5);
    });

    it("should parse a feature string without a value", () => {
        const featureString = "Vielseitig";
        const result = parseFeatures(featureString);

        expect(result[0].name).to.equal("Vielseitig");
        expect(result[0].value).to.equal(1);
    });

    it("should ignore nonnumeric values", () => {
        const featureString = "Ablenkend abc";
        const result = parseFeatures(featureString);

        expect(result).to.have.lengthOf(0);
        expect(warnStub.calledOnce).to.equal(true);
    });

    it("should ignore nonfeature names", () => {
        const featureString = "testFeature";
        const result = parseFeatures(featureString);

        expect(result).to.have.lengthOf(0);
        expect(warnStub.calledOnce).to.equal(true);
    });

    it("should parse multiple features", () => {
        const featureString = "Scharf 5, Wuchtig";
        const result = parseFeatures(featureString);

        expect(result[0]).to.deep.equal({name: "Scharf", value: 5});
        expect(result[1]).to.deep.equal({name: "Wuchtig", value: 1});
    });

    it("should normalize known features", () => {
        const featureString = "sChArF 5,    imPRoVISIERt";
        const result = parseFeatures(featureString);

        expect(result[0].name).to.equal("Scharf");
        expect(result[1].name).to.equal("Improvisiert");
    });


});