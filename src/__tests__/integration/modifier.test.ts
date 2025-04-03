import {QuenchBatchContext} from "@ethaks/fvtt-quench";
import {actorCreator} from "module/data/EntityCreator"
import {foundryApi} from "../../module/api/foundryApi";
import {CharacterDataModel} from "../../module/actor/dataModel/CharacterDataModel";
import SplittermondActor from "../../module/actor/actor";
import {splittermond} from "../../module/config";

export function modifierTest(context: QuenchBatchContext) {
    const {describe, it, expect, beforeEach, afterEach} = context;
    let actors: SplittermondActor[] = [];
    beforeEach(() => actors = []);

    afterEach(async () => await Actor.deleteDocuments(actors.map(a => a.id)));


    async function createActor(name: string) {
        const actor = await actorCreator.createCharacter({type: "character", name, system: {}})
        actors.push(actor)
        return actor;
    }

    describe("Modifiers are taken up by actor", () => {

        it("should account for a stealth modifier", async () => {
            const subject = await createActor("StealthyGnome")
            subject.updateSource({system: {species: {size: 3}}})
            subject.updateSource({
                system: {
                    attributes: {
                        intuition: {initial: 2, advances: 0},
                        agility: {initial: 3, advances: 0}
                    }
                }
            })

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.stealth.value).to.equal(7);
        });

        [
            ["size", 6], ["speed", 8], ["initiative", 9], ["healthpoints", 8], ["focuspoints", 9], ["defense", 17],
            ["mindresist", 17], ["bodyresist", 17]
        ].forEach(([derivedValue, expected]) => {
            it(`should modify derived value '${derivedValue}' by 1`, async () => {
                const subject = await createActor(`CharacterWith${derivedValue}`);
                splittermond.attributes.forEach(attribute => {
                    (subject.system as CharacterDataModel).attributes[attribute].updateSource({
                        initial: 2,
                        advances: 0,
                        species: 0
                    });

                });

                const derivedValueKey = foundryApi.localize(`splittermond.derivedAttribute.${derivedValue}.short`);
                await subject.createEmbeddedDocuments("Item", [{
                    type: "strength",
                    name: "DerivedValueEnhancer",
                    system: {modifier: `${derivedValueKey} +1`}
                }]);

                subject.prepareBaseData();
                await subject.prepareEmbeddedDocuments();
                subject.prepareDerivedData();

                expect(subject.derivedValues[derivedValue].value).to.equal(expected);
            });
        });

        it("should account for modifications from shields", async () => {
            const subject = await createActor("ShieldedCharacter");
            (subject.system as CharacterDataModel).attributes.agility.updateSource({initial: 2, advances: 0});
            (subject.system as CharacterDataModel).attributes.strength.updateSource({initial: 2, advances: 0});
            (subject.system as CharacterDataModel).updateSource({
                    skills: {
                        ...subject.system.skills,
                        acrobatics: {points: 2, value: 6}
                    }
                }
            );
            await subject.createEmbeddedDocuments("Item", [{
                type: "shield",
                name: "Fat Shield",
                system: {
                    skill: "blades",
                    tickMalus: 1,
                    defenseBonus: 1,
                    handicap: 1,
                    equipped: true,
                }
            }]);

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.acrobatics.value).to.equal(5);
            expect(subject.derivedValues.defense.value).to.equal(17);
            expect(subject.attacks.find(a => a.name === "waffenlos")?.weaponSpeed).to.equal(6);
        });
    });

    describe("Wound malus", () => {
        async function setUpActor(){
            const actor = await createActor("WoundedCharacter");
            (actor.system as CharacterDataModel).attributes.agility.updateSource({initial: 2, advances: 0});
            (actor.system as CharacterDataModel).attributes.strength.updateSource({initial: 2, advances: 0});
            (actor.system as CharacterDataModel).updateSource({
                skills: {
                    ...actor.system.skills,
                    acrobatics: {points: 2, value: 6}
                }
            });
            return actor;
        }

        async function addWoundedEffect(actor:SplittermondActor, level:number){
            return await actor.createEmbeddedDocuments("Item", [{
                type: "statuseffect",
                name: "Verwundung",
                system: {
                    modifier: "woundMalus.levelMod value='+1'",
                    level: level,
                }
            }]);
        }

        it("should apply wound malus effect with more than full bar missing", async () => {
            const subject = await setUpActor();
            await addWoundedEffect(subject, 1);
            await subject.consumeCost("health",`8V8`, "");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.acrobatics.value).to.equal(6 - 2);
        });

        it("should apply LP wound malus when more than full bar missing", async () => {
            const subject = await setUpActor();
            await subject.consumeCost("health",`8V8`, "");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.acrobatics.value).to.equal(6 - 1);
        });

        [[0,0],[1,1],[2,2],[3,4],[4,8],[5,8]].forEach(([level,reduction]) => {
            it(`should apply wound malus of ${level} at perfect health`, async () => {
                const subject = await setUpActor();
                await addWoundedEffect(subject, level);

                subject.prepareBaseData();
                await subject.prepareEmbeddedDocuments();
                subject.prepareDerivedData();

                expect(subject.skills.acrobatics.value).to.equal(6 - reduction);
            });

            it(`should apply wound malus of ${level} with 1hp missing`, async () => {
                const subject = await setUpActor();
                await addWoundedEffect(subject, level);
                await subject.consumeCost("health","1V1", "");

                subject.prepareBaseData();
                await subject.prepareEmbeddedDocuments();
                subject.prepareDerivedData();

                expect(subject.skills.acrobatics.value).to.equal(6 - reduction);
            });

            it(`should apply wound malus of ${level} with full bar missing`, async () => {
                const subject = await setUpActor();
                await addWoundedEffect(subject, level);
                await subject.consumeCost("health",`7V7`, "");

                subject.prepareBaseData();
                await subject.prepareEmbeddedDocuments();
                subject.prepareDerivedData();

                expect(subject.skills.acrobatics.value).to.equal(6 - reduction);
            });
        });
    });

    describe("Parsed Modifiers", () => {
        async function defaultActor(name:string, modifier:string) {
            const subject = await createActor(name)
            subject.updateSource({
                system: {
                    attributes: {
                        constitution: {initial: 2, advances: 0},
                        intuition: {initial: 2, advances: 0},
                        mind: {initial: 3, advances: 0}
                    }
                }
            });
            await subject.createEmbeddedDocuments("Item", [{
                type: "strength",
                name: "DerivedValueEnhancer",
                system: {modifier}
            }]);
            return subject;
        }

        it("should add a constant value to a skill", async () => {
            const subject = await defaultActor("Empath", "empathy +1");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.empathy.value).to.equal(6);
        });

        //Feature does not work because rolls need to be evaluated asy
        it.skip("should add a roll to a skill", async () => {
            const subject = await defaultActor("Empath", "empathy 2W6");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.empathy.value).to.be.above(6).below(18);
        });

        it("should add a attribute value to a skill", async () => {
            const subject = await defaultActor("Empath", "empathy ${Intuition}");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.empathy.value).to.equal(7);
        });

        it("should add a skill value to a skill", async () => {
            const subject = await defaultActor("DoubleEmpath", "empathy ${Jagdkunst}");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.empathy.value).to.equal(10);
        });

        it("should add a random numeric attribute to", async () => {
            const subject = await defaultActor("WeirdEmpath", "empathy ${system.health.max}");

            subject.prepareBaseData();
            await subject.prepareEmbeddedDocuments();
            subject.prepareDerivedData();

            expect(subject.skills.empathy.value).to.equal(40);
        });
    });
}


