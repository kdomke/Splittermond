import {DataModelSchemaType, fields, SplittermondDataModel} from "../../../data/SplittermondDataModel";
import {SplittermondChatMessage} from "../../../data/SplittermondChatCardModel";
import {DamageMessageData} from "./interfaces";
import {addToRegistry} from "../chatMessageRegistry";
import {DamageEvent} from "../../damage/DamageEvent";
import {foundryApi} from "../../../api/foundryApi";
import ApplyDamageDialog from "../../../apps/dialog/apply-damage-dialog";

const constructorRegistryKey = "DamageMessage";

function DamageMessageSchema() {
    return {
        constructorKey: new fields.StringField({required: true, nullable: false, initial: constructorRegistryKey}),
        damageEvent: new fields.EmbeddedDataField(DamageEvent, {required: true, nullable: false}),
    };
}

type DamageMessageType = DataModelSchemaType<typeof DamageMessageSchema>


export class DamageMessage extends SplittermondDataModel<DamageMessageType> implements SplittermondChatMessage {

    static defineSchema = DamageMessageSchema;

    static initialize(damageEvent: DamageEvent): DamageMessage {
        return new DamageMessage({
            damageEvent,
            constructorKey: constructorRegistryKey,
        });
    }


    get template() {
        return "systems/splittermond/templates/chat/damage-roll.hbs";
    }

    getData(): DamageMessageData {
        return {
            features: [],
            formula: this.damageEvent.formula,
            total: this.damageEvent.totalDamage(),
            source: this.damageEvent.causer?.getAgent().name,
            tooltip: this.damageEvent.tooltip,
            actions: [
                this.renderApplyDamageToTargetAction()
            ],
        }
    }

    handleGenericAction(data: { action: string }): Promise<void> {
        if(data.action === "applyDamageToTarget"){
            return ApplyDamageDialog.create(this.damageEvent.totalDamage(),"V","")
        }
        return Promise.resolve();
    }


    private renderApplyDamageToTargetAction(){
        return {
            classes: "splittermond-chat-action",
            data: {
                localAction: "applyDamageToTarget",
            },
            icon: "fa-heart-broken",
            name: foundryApi.localize("splittermond.applyDamage")
        }
    }
}

addToRegistry(constructorRegistryKey, DamageMessage);

