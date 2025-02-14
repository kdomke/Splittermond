import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../data/SplittermondDataModel";
import {SplittermondChatMessage} from "../../../data/SplittermondChatCardModel";
import {DamageMessageData} from "./interfaces";
import {addToRegistry} from "../chatMessageRegistry";
import {DamageEvent} from "../../damage/DamageEvent";
import {foundryApi} from "../../../api/foundryApi";
import ApplyDamageDialog from "../../../apps/dialog/apply-damage-dialog";
import {DamageFeature, DamageFeatureSchema} from "../../damage/DamageFeature";

const constructorRegistryKey = "DamageMessage";

function DamageMessageSchema() {
    return {
        constructorKey: new fields.StringField({required: true, nullable: false, initial: constructorRegistryKey}),
        featuresToDisplay: new fields.ArrayField(
            new fields.SchemaField(DamageFeatureSchema(), {required: true, nullable: false}),
            {required: true, nullable: false}),
        damageEvent: new fields.EmbeddedDataField(DamageEvent, {required: true, nullable: false}),
    };
}

type DamageMessageType = DataModelSchemaType<typeof DamageMessageSchema>


export class DamageMessage extends SplittermondDataModel<DamageMessageType> implements SplittermondChatMessage {

    static defineSchema = DamageMessageSchema;

    static initialize(damageEvent: DamageEvent, featuresToDisplay: DamageFeature[] = []): DamageMessage {
        return new DamageMessage({
            damageEvent,
            featuresToDisplay,
            constructorKey: constructorRegistryKey,
        });
    }


    get template() {
        return "systems/splittermond/templates/chat/damage-roll.hbs";
    }

    getData(): DamageMessageData {
        return {
            features: this.renderFeaturesToDisplay(),
            formula: this.damageEvent.formula,
            total: this.damageEvent.totalDamage(),
            source: this.damageEvent.causer?.getAgent().name ?? null,
            tooltip: this.damageEvent.tooltip,
            actions: [
                this.renderApplyDamageToTargetAction()
            ],
        }
    }

    private renderFeaturesToDisplay() {
        return this.featuresToDisplay
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);
    }

    private renderApplyDamageToTargetAction() {
        return {
            classes: "splittermond-chat-action",
            data: {
                localAction: "applyDamageToTarget",
            },
            icon: "fa-heart-broken",
            name: foundryApi.localize("splittermond.applyDamage")
        }
    }

    handleGenericAction(data: { action: string }): Promise<void> {
        if (data.action === "applyDamageToTarget") {
            return ApplyDamageDialog.create(this.damageEvent.totalDamage(), "V", "")
        }
        return Promise.resolve();
    }


}

addToRegistry(constructorRegistryKey, DamageMessage);

