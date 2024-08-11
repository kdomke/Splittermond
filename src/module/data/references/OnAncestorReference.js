import {fields, SplittermondDataModel} from "../SplittermondDataModel.ts";


/**
 * @extends {SplittermondDataModel<OnAncestorReference, SplittermondDataModel>}
 * @template {string|number|boolean|object} T
 * @property {string}ancestorId
 * @property {string}ancestorIdKey
 * @property {string}referenceKey
 */
export class OnAncestorReference extends SplittermondDataModel {
    static defineSchema() {
        return {
            ancestorId: new fields.StringField({required: true, blank: false, nullable: false}),
            ancestorIdKey: new fields.StringField({required: true, blank: false, nullable: false}),
            referenceKey: new fields.StringField({required: true, blank: false, nullable: false}),
        }
    }

    /**
     * @template DM
     * @template {SplittermondDataModel<DM, any>} A
     * @param {function(new:A, ...args: any[]):A}  self
     * & {defineSchema():object}}
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
            if (ancestor[this.ancestorIdKey] === this.ancestorId) {
                return ancestor[this.referenceKey]
            }
            ancestor = ancestor.parent
        }
        throw new Error(`No ancestor with id ${this.ancestorId} found`);
    }

}

/**
 * @template {SplittermondDataModel<U,any>} U
 * @param {typeof U} type*/
function createReferenceFor(type) {
    /**@type {string} */ let ancestorId= null;
    /**@type {string} */ let ancestorIdKey = null;
    /**@type {string} */ let referenceKey = null;
    return {identifiedBy};

    /**
     * @param {keyof T} key
     * @param {string} value
     */
    function identifiedBy(key, value) {
        ancestorIdKey = key;
        ancestorId = value;

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
        if (!(ancestorIdKey in type.defineSchema())) {
            throw new Error("No parent id key defined");
        }
        if (!referenceKey in type.defineSchema()) {
            throw new Error("No reference key defined");
        }
        if(!ancestorId){
            throw new Error("No parent id defined")
        }
        return new OnAncestorReference({ancestorId, ancestorIdKey, referenceKey})
    }
}