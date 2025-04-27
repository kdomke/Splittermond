import {DamageEvent, DamageImplement} from "../../damage/DamageEvent";
import {AgentReference} from "../../../data/references/AgentReference";
import {DamageRoll, type EvaluatedDamageRoll} from "../../damage/DamageRoll";
import {DamageType} from "../../../config/damageTypes";
import {parseFeatureString} from "../../damage/featureParser";
import {DamageMessage} from "./DamageMessage";
import {Roll, sumRolls} from "../../../api/Roll";
import {DamageFeature} from "../../damage/DamageFeature";
import SplittermondActor from "../../../actor/actor";
import {CostBase, CostType} from "../../costs/costTypes";
import {SplittermondChatCard} from "../SplittermondChatCard";

export const DamageInitializer = {
    rollDamage,
    rollFromDamageRoll
}

interface ProtoDamageImplement {
    readonly damageRoll: DamageRoll;
    readonly damageType: DamageType;
    readonly damageSource: string | null
}
type EvaluatedImplement  =  Omit<ProtoDamageImplement,"damageRoll"> & {evaluatedRoll: EvaluatedDamageRoll};
class WrappedImplement {

    static from(protoImplement: ProtoDamageImplement) {
        return new WrappedImplement(protoImplement.damageRoll, protoImplement.damageType, protoImplement.damageSource);
    }

    constructor(
        public readonly damageRoll: DamageRoll,
        public readonly damageType: DamageType,
        public readonly source: string | null) {
    }

    async evaluate() {
        const evaluatedRoll = await this.damageRoll.evaluate();
        return {
            evaluatedRoll: evaluatedRoll,
            damageType: this.damageType,
            damageSource: this.source
        }
    }
}

class EvaluatedImplements{
    constructor(public readonly damageImplements: EvaluatedImplement[]) {
    }

    get evaluatedRoll() {
        const rolls = this.damageImplements.map(i => i.evaluatedRoll).map(d => d.roll);
        return sumRolls(rolls);
    }

    get features():DamageFeature[] {
        const featureSet = this.damageImplements.map(i=> i.evaluatedRoll)
            .flatMap(d => d.getActiveFeatures())
            .sort((a, b) => b.value - a.value) //largest value first
            .reduce((acc, val) => acc.add(val), new Set<DamageFeature>());
        return Array.from(featureSet);
    }
}

async function evaluateImplements(damageImplements: ProtoDamageImplement[]){
    const evaluatedImplements = await Promise.all(
        damageImplements.map(d => WrappedImplement.from(d)).map(d => d.evaluate()));
    return new EvaluatedImplements(evaluatedImplements);

}

async function rollFromDamageRoll(damages: ProtoDamageImplement[], costBase: CostBase, speaker: SplittermondActor | null) {

    const evaluatedImplements = await evaluateImplements(damages);
    const damageImplements = await mapToDamageImplements(evaluatedImplements);
    const totalRoll = evaluatedImplements.evaluatedRoll;
    const damageEvent = new DamageEvent({
        causer: speaker ? AgentReference.initialize(speaker) : null,
        _costBase: costBase,
        formula: totalRoll.formula,
        tooltip: await totalRoll.getTooltip(),
        implements: damageImplements,
        isGrazingHit: false,
    });

    return SplittermondChatCard.create(
        speaker,
        DamageMessage.initialize(damageEvent, evaluatedImplements.features),
        {
            type: "damageMessage",
            whisper: [],
            blind: false,
            rolls: [totalRoll]
        }
    );
}
async function mapToDamageImplements(proto: EvaluatedImplements) {
    return Promise.all(proto.damageImplements.map(i => mapToImplement(i)));
}

async function mapToImplement(proto: EvaluatedImplement) {
    const explanation = await proto.evaluatedRoll.roll.getTooltip();
    return new DamageImplement({
        damage: proto.evaluatedRoll.roll.total,
        formula: proto.evaluatedRoll.roll.formula,
        implementName: proto.damageSource ?? "",
        damageExplanation: explanation,
        _baseReductionOverride: proto.evaluatedRoll.features.valueOf("Durchdringung"),
        damageType: proto.damageType
    });
}

interface ProtoDamageImplement0 {
    damageFormula: string;
    featureString: string;
    damageSource: string;
    damageType: DamageType | null;
}


async function rollDamage(damages: ProtoDamageImplement0[], costType: CostType | CostBase, speaker: SplittermondActor | null) {

    const damageResults = await rollDamages(damages);
    const actorReference = speaker ? AgentReference.initialize(speaker) : null;
    const damageEvent = new DamageEvent({
        causer: actorReference,
        _costBase: costType instanceof CostBase ? costType : CostBase.create(costType),
        formula: damageResults.totalRoll.formula,
        tooltip: await damageResults.totalRoll.getTooltip(),
        implements: damageResults.damageImplements,
        isGrazingHit: false,
    });

    return SplittermondChatCard.create(
        speaker,
        DamageMessage.initialize(damageEvent, damageResults.features),
        {
            type: "damageMessage",
            whisper: [],
            blind: false,
            rolls: [damageResults.totalRoll]
        }
    );
}

async function rollDamages(damages: ProtoDamageImplement0[]) {
    const allRolls: Roll[] = [];
    const allFeature: DamageFeature[] = [];
    const damageImplements = await Promise.all(damages.map(async damage => {
        const damageRoll = DamageRoll.parse(damage.damageFormula, damage.featureString);
        const rollResult = await damageRoll.evaluate();
        allFeature.push(...rollResult.getActiveFeatures());
        allRolls.push(rollResult.roll);
        return new DamageImplement({
            damage: rollResult.roll.total,
            formula: damage.damageFormula,
            implementName: damage.damageSource,
            damageExplanation: await rollResult.roll.getTooltip(),
            _baseReductionOverride: parseFeatureString(damage.featureString)["durchdringung"]?.value ?? 0,
            damageType: damage.damageType ?? "physical"
        });
    }));
    return {totalRoll: sumRolls(allRolls), features: allFeature, damageImplements};
}
