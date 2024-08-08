import {AgentReference} from "./AgentReference.js";
import {foundryApi} from "../../api/foundryApi.ts";
import {fields, SplittermondDataModel} from "../SplittermondDataModel.ts";

/**
 * @template {SplittermondItem} T
 * @extends {SplittermondDataModel<ItemReference<T>,never>}
 * @property {AgentReference|null} actorReference
 * @property {string} id
 */
export class ItemReference extends SplittermondDataModel {
    static defineSchema() {
        return {
            id: new foundry.data.fields.StringField({required: true, blank: false, nullable: false}),
            actorReference: new foundry.data.fields.EmbeddedDataField(AgentReference, {
                required: true,
                blank: false,
                nullable: true
            }),
        }
    }

    /**
     * @template {SplittermondItem} T
     * @param {T} item
     * @return {ItemReference<T>}
     */
    static initialize(item) {
        if (item.actor) {
            return new ItemReference({id: item.id, actorReference: AgentReference.initialize(item.actor)})
        } else {
            return new ItemReference({id: item.id, actorReference: null})
        }
    }


    /**@return {T} */
    getItem() {
        const item = this.actorReference ? this.#getFromActor() : this.#getFromCollection();
        if (!item) {
            throw new Error("ItemReference could not resolve the item");
        }
        return item;
    }

    /**@return {T} */
    #getFromActor() {
        const actor = this.actorReference.getAgent();
        return actor.items.get(this.id);
    }

    /**@return {T} */
    #getFromCollection() {
        return foundryApi.getItem(this.id);
    }
}