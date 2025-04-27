import {describe} from "mocha";
import sinon from "sinon";
import {createTestRoll, MockRoll, stubRollApi} from "__tests__/unit/RollMock";
import {DamageInitializer} from "module/util/chat/damageChatMessage/initDamage";
import {expect} from "chai";
import {DamageMessage} from "module/util/chat/damageChatMessage/DamageMessage";
import {foundryApi} from "module/api/foundryApi";
import {DamageRoll} from "module/util/damage/DamageRoll";
import {
    ItemFeatureDataModel,
    ItemFeaturesModel,
    parseFeatures
} from "module/item/dataModel/propertyModels/ItemFeaturesModel";
import {CostBase} from "module/util/costs/costTypes";

describe("Damage Event initialization", ()=>{

    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox()
        sandbox.stub(foundryApi, 'chatMessageTypes').value({OTHER: 0});
        sandbox.stub(foundryApi, 'getSpeaker').returns({actor:null, scene:'askf4903', token:null, alias:'Gamemaster'});
        stubRollApi(sandbox);
        //@ts-expect-error we haven't defined the global namespace
        global.Roll = MockRoll;
    });
    afterEach(() => {
        sandbox.restore()
        //@ts-expect-error we haven't defined the global namespace
        global.Roll = undefined;
    });
    const firstImplement = {
        damageFormula: "1d6",
        featureString: "Scharf 1",
        damageSource: "Schwert",
        damageType: "physical" as const
    }
    const secondImplement = {
        damageFormula: "1d10",
        featureString: "Durchdringung 1",
        damageSource: "Brennende Klinge",
        damageType: "fire" as const
    }
    const thirdImplement = {
       damageFormula: "2d10",
        featureString:"Kritisch 1, Scharf 5, Exakt 3, Durchdringung 5, Lange Waffe, Wuchtig",
        damageSource: "Lanze der Gerechtigkeit",
        damageType: "physical" as const
    }
    it("should output the sum of two rolls", async () => {
        sandbox.stub(DamageRoll, "parse").callsFake((str, features) => {
           return new DamageRoll(
               str === firstImplement.damageFormula ? createTestRoll("1d6", [5], 0): createTestRoll("1d10", [3], 0),
               ItemFeaturesModel.from(parseFeatures(features??"").map(f => new ItemFeatureDataModel(f)))
           );
        })
        const damageMessage= await DamageInitializer.rollDamage([firstImplement, secondImplement], "V", null)
            .then((chatMessage) => chatMessage.system)
            .then((message) => message as DamageMessage);

        expect(damageMessage.damageEvent.implements).to.have.length(2);
        expect(damageMessage.damageEvent.totalDamage()).to.equal(8);
    });

    it("should record damage reduction override", async () => {
        sandbox.stub(DamageRoll, "parse").returns(
            new DamageRoll(
                createTestRoll("2d10", [10,1], 0),
                ItemFeaturesModel.from(parseFeatures(thirdImplement.featureString).map(f => new ItemFeatureDataModel(f)))
            )
        );
        const damageMessage= await DamageInitializer.rollDamage([thirdImplement], "V", null)
            .then((chatMessage) => chatMessage.system)
            .then((message) => message as DamageMessage);

        expect(damageMessage.damageEvent.implements[0].ignoredReduction).to.equal(5);
    });
})
describe("Damage Event initialization with rolls", ()=>{

    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox()
        sandbox.stub(foundryApi, 'chatMessageTypes').value({OTHER: 0});
        sandbox.stub(foundryApi, 'getSpeaker').returns({actor:null, scene:'askf4903', token:null, alias:'Gamemaster'});
        stubRollApi(sandbox);
        //@ts-expect-error we haven't defined the global namespace
        global.Roll = MockRoll;
    });
    afterEach(() => {
        sandbox.restore()
        //@ts-expect-error we haven't defined the global namespace
        global.Roll = undefined;
    });
    const firstImplement = {
        damageRoll: new DamageRoll(createTestRoll("1d6", [5], 0), ItemFeaturesModel.from("Scharf 1") ),
        damageSource: "Schwert",
        damageType: "physical" as const
    }
    const secondImplement = {
        damageRoll: new DamageRoll(createTestRoll("1d10", [3], 0), ItemFeaturesModel.from("Durchdringung 1") ),
        damageSource: "Brennende Klinge",
        damageType: "fire" as const
    }
    const thirdImplement = {
        damageRoll: new DamageRoll(
            createTestRoll("2d10", [3], 0),
            ItemFeaturesModel.from("Kritisch 1, Scharf 5, Exakt 3, Durchdringung 5, Lange Waffe, Wuchtig")),
        damageSource: "Lanze der Gerechtigkeit",
        damageType: "physical" as const
    }
    it("should output the sum of two rolls", async () => {
        const damageMessage= await DamageInitializer.rollFromDamageRoll([firstImplement, secondImplement], CostBase.create("V"), null)
            .then((chatMessage) => chatMessage.system)
            .then((message) => message as DamageMessage);

        expect(damageMessage.damageEvent.implements).to.have.length(2);
        expect(damageMessage.damageEvent.totalDamage()).to.equal(8);
    });

    it("should record damage reduction override", async () => {
        const damageMessage= await DamageInitializer.rollFromDamageRoll([thirdImplement], CostBase.create("V"), null)
            .then((chatMessage) => chatMessage.system)
            .then((message) => message as DamageMessage);

        expect(damageMessage.damageEvent.implements[0].ignoredReduction).to.equal(5);
    });
})
