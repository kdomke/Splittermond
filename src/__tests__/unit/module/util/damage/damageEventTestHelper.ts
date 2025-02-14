import {DamageType} from "../../../../../module/config/damageTypes";
import {DamageEvent, DamageImplement} from "../../../../../module/util/damage/DamageEvent";
import {SinonSandbox} from "sinon";
import {AgentReference} from "../../../../../module/data/references/AgentReference";
import {Cost} from "../../../../../module/util/costs/Cost";
import SplittermondActor from "../../../../../module/actor/actor";

export function createDamageImplement(damage: number, baseReductionOverride: number, damageType: DamageType = "physical") {
    return new DamageImplement({
        damage,
        formula: "1d6",
        implementName: "Schwert",
        damageExplanation: "",
        damageType,
        _baseReductionOverride: baseReductionOverride,
    });
}

export function createDamageEvent(sandbox: SinonSandbox, damageImplements: DamageImplement[]) {
    const actor = sandbox.createStubInstance(SplittermondActor);
    actor.name = "TestActor";
    const agent = sandbox.createStubInstance(AgentReference);
    agent.getAgent.returns(actor);

    return new DamageEvent({
        causer: agent,
        costVector: new Cost(1, 0, false).asModifier(),
        formula: damageImplements.map(imp => imp.formula).join(" + "),
        tooltip: "",
        isGrazingHit: false,
        implements: damageImplements,
    });
}