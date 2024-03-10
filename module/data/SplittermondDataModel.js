/**
 * @template {SplittermondDataModel} T
 * @template {SplittermondDataModel} U
 * @property {U}
 * @property {function(new:T,data: T,...args)} constructor
 * @property {updateSource: (data: Partial<T>) => void}
 * @class
 */
const SplittermondDataModel = class extends foundry.abstract.DataModel {}

/**
 * @template T
 * @typedef DataFieldOption
 * @type {object}
 * @property {boolean?} required
 * @property {boolean?} blank
 * @property {boolean?} nullable
 * @property {T?} initial
 * @property {((x:T)=> boolean)?} validate
 */
/**
 * @template {typeof SplittermondDataModel} T
 * @type {object}
 * @property {function(new:ObjectField, x: DataFieldOption<unknown>)} ObjectField
 * @property {function(new:SchemaField, x:unknown,y:DataFieldOption<unknown>)} SchemaField
 * @property {function(new:BooleanField, x:DataFieldOption<boolean>)} BooleanField
 * @property {function(new:EmbeddedDataField<T>, x:T, y:DataFieldOption<unknown>)}
 * @property {function(new:StringField, x:DataFieldOption<string>)} StringField
 * @property {function(new:NumberField, x:DataFieldOption<number>)} NumberField
 */
const fields = foundry.data.fields;


export {SplittermondDataModel, fields};


