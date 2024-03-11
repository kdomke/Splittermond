import {fields, SplittermondDataModel} from "../SplittermondDataModel.js";


/**
 * @extends {SplittermondDataModel<OnAncestorReference, SplittermondDataModel>}
 * @template {string|number|boolean|object} T
 * @property {string}parentId
 * @property {string}parentIdKey
 * @property {string}referenceKey
 */
export class OnAncestorReference extends SplittermondDataModel {
    static defineSchema() {
        return {
            parentId: new fields.StringField({required: true, blank: false, nullable: false}),
            parentIdKey: new fields.StringField({required: true, blank: false, nullable: false}),
            referenceKey: new fields.StringField({required: true, blank: false, nullable: false}),
        }
    }

    /**
     * @template {SplittermondDataModel<A>} A
     * @param {A} self
     */
    static for(self) {
        return createReferenceFor(self)
    }


    /**
     * @return {T}
     */
    get() {
        let ancestor = this.parent
        while (ancestor) {
            if (ancestor.id === this.parentId) {
                return ancestor[this.referenceKey]
            }
            ancestor = ancestor.parent
        }
        throw new Error(`No ancestor with id ${this.parentId} found`);
    }

}

/** @param {SplittermondDataModel} type*/
function createReferenceFor(type) {
    /**@type {string} */ let parentId= null;
    /**@type {string} */ let parentIdKey = null;
    /**@type {string} */ let referenceKey = null;
    return {identifiedBy};

    /**
     * @param {string} key
     * @param {string} value
     */
    function identifiedBy(key, value) {
        parentIdKey = key;
        parentId = value;

        return {references: reference}
    }

    /**@param {keyof T} key */
    function reference(key) {
        referenceKey = key;
        return createReference()
    }

    /**
     * @return {OnAncestorReference<Readonly<T[referenceKey]>>}
     */
    function createReference() {
        if (!(parentIdKey in type.defineSchema())) {
            throw new Error("No parent id key defined");
        }
        if (!referenceKey in type.defineSchema()) {
            throw new Error("No reference key defined");
        }
        if(!parentId){
            throw new Error("No parent id defined")
        }
        return new OnAncestorReference({parentId, parentIdKey, referenceKey})
    }
}