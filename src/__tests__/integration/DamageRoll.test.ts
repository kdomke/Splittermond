import {DamageRoll} from "../../module/util/damage/DamageRoll";
import {QuenchBatchContext} from "@ethaks/fvtt-quench";
import {initDamage} from "../../module/util/chat/damageChatMessage/initDamage";
import {foundryApi} from "../../module/api/foundryApi";
import {DamageMessage} from "../../module/util/chat/damageChatMessage/DamageMessage";

declare class Die{
    results: any;
}

export function DamageRollTest(context:QuenchBatchContext) {
    const {describe, it, expect} = context;

    describe("Damage Roll evaluation", () => {
        it("Exact should modify roll in a way that the highest dice is kept", async () => {
            const roll = await DamageRoll.parse("2d6", "Exakt 1").evaluate();

            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect((roll.terms[0] as Die).results).to.have.length(3);

            const sortedResults = (roll.terms[0] as Die).results
                .filter((r:unknown) => (r && r instanceof Object && "result" in r))
                .sort((a:{result:number}, b:{result:number}) => a.result - b.result);
            expect(sortedResults[0].active).to.be.false;
        });

        it("Scharf should modify roll in a way that the lowest dice are increased", async () => {
            const roll = await DamageRoll.parse("1d6", "Scharf 6").evaluate();

            expect(roll.total).to.equal(6);
            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect((roll.terms[0] as Die).results).to.have.length(1);
            expect((roll.terms[0] as Die).results[0].result).not.to.equal(roll.total);
        });

        it("Kritisch should modify roll in a way that the highest dice are increased", async () => {
            const roll = await DamageRoll.parse("999d6", "Kritisch 1").evaluate();

            expect(roll.terms[0]).to.be.instanceOf(Die);
            expect(roll.total).not.to.equal(
                roll.terms
                    .filter((t) => t instanceof Die)
                    .flatMap(t => t.results)
                    .reduce((former,latter)=> former += latter.result,0)
            )
        });
    });

    describe("Damage Message initialization", () => {
        it("should account for multiple damage types", async () => {
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
            const chatMessage = await initDamage([firstImplement,secondImplement],"V", foundryApi.getSpeaker({}))
            const damageMessage = chatMessage.message as DamageMessage;

            expect(damageMessage).to.be.instanceOf(DamageMessage);
            expect(damageMessage.getData().total).to.equal(damageMessage.damageEvent.totalDamage());
            expect(damageMessage.getData().actions).to.contain.keys(["applyDamageToOthers"]);
            expect(damageMessage.getData().formula).to.equal("1d6 + 1d10");
            expect

            expect(damageMessage.damageEvent.implements).to.have.length(2);
            expect(damageMessage.damageEvent.implements[0].damageType).to.equal("physical");
            expect(damageMessage.damageEvent.implements[1].damageType).to.equal("fire");

        });

    });
}