type DataModel<T, PARENT> = {
    parent: PARENT extends never ? never : PARENT | null;
    toObject(): T,
    getFlag(scope: string, key: string): unknown,
    update(data: Partial<T>): void,
    updateSource(data: Partial<T>): void,
}
type DataModelType = new <T, PARENT extends DataModel<PARENT, any> | never>(data: T, ...args: any[]) => DataModel<T, PARENT>;
//@ts-ignore
const FoundryDataModel = foundry.abstract.DataModel as DataModelType;

const SplittermondDataModel = class<T, PARENT extends DataModel<PARENT, any> | never = never> extends FoundryDataModel<T, PARENT> {
} as new<T, PARENT extends DataModel<PARENT, any> | never = never>(data: T, ...args: any[]) => DataModel<T, PARENT> & Readonly<T>;


type DataFieldOption<T, REQ extends boolean, NULL extends boolean> = {
    required?: REQ;
    blank?: boolean;
    nullable?: NULL;
    initial?: T;
    validate?: (x: T) => boolean;
}
type DataField<T = unknown, REQ extends boolean = true, NULL extends boolean = false> =
    ObjectField<REQ, NULL>
    | BooleanField<REQ, NULL>
    | StringField<REQ, NULL>
    | NumberField<REQ, NULL>
    | ArrayField<T, REQ, NULL>
    | EmbeddedDataField<T, REQ, NULL>
    | SchemaField<T, REQ, NULL>;
type ObjectField<REQ, NULL> = { __brand: "ObjectField" };
type BooleanField<REQ, NULL> = { __brand: "BooleanField" };
type StringField<REQ, NULL> = { __brand: "StringField" };
type NumberField<REQ, NULL> = { __brand: "NumberField" };
type ArrayField<A, REQ, NULL> = { __brand: "ArrayField" };
type EmbeddedDataField<E, REQ, NULL> = { __brand: "EmbeddedDataField" };
type SchemaField<S, REQ, NULL> = { __brand: "SchemaField" };

interface DataFields {
    ObjectField: new<REQ extends boolean, NULL extends boolean>(x: DataFieldOption<unknown, REQ, NULL>) => ObjectField<REQ, NULL>;
    BooleanField: new <REQ extends boolean, NULL extends boolean> (x: DataFieldOption<boolean, REQ, NULL>) => BooleanField<REQ, NULL>;
    StringField: new <REQ extends boolean, NULL extends boolean>(x: DataFieldOption<string, REQ, NULL>) => StringField<REQ, NULL>;
    NumberField: new <REQ extends boolean, NULL extends boolean>(x: DataFieldOption<number, REQ, NULL>) => NumberField<REQ, NULL>;
    ArrayField: new <A, REQ extends boolean, NULL extends boolean>(x: A, y: DataFieldOption<unknown, REQ, NULL>) => ArrayField<A, REQ, NULL>;
    EmbeddedDataField: new <E extends DataModel<any, unknown>, REQ extends boolean, NULL extends boolean>(x: new (...args: any) => E, y: DataFieldOption<unknown, REQ, NULL>) => EmbeddedDataField<E, REQ, NULL>;
    SchemaField: new <S extends Record<string, DataField>, REQ extends boolean, NULL extends boolean>(x: S, y: DataFieldOption<unknown, REQ, NULL>) => SchemaField<S, REQ, NULL>;
}

//@ts-ignore
const fields: DataFields = foundry.data.fields;

type DefineSchemaType = () => any;
type DataModelSchemaType<T extends DefineSchemaType> = MemberDefinitionContainerMapper<ReturnType<T>>;
type MemberDefinitionContainerMapper<T> = MakeUndefinedOptional<{ [KEY in keyof T]: DataFieldMapper<T[KEY]> }>
type DataFieldMapper<T> =
    T extends ObjectField<infer REQ, infer NULL> ? ObjectFieldMap<REQ, NULL> :
        T extends BooleanField<infer REQ, infer NULL> ? BooleanFieldMap<REQ, NULL> :
            T extends StringField<infer REQ, infer NULL> ? StringFieldMap<REQ, NULL> :
                T extends NumberField<infer REQ, infer NULL> ? NumberFieldMap<REQ, NULL> :
                    T extends ArrayField<infer A, infer REQ, infer NULL> ? ArrayFieldMap<A, REQ, NULL> :
                        T extends EmbeddedDataField<infer E, infer REQ, infer NULL> ? EmbeddedDataFieldMap<E, REQ, NULL> :
                            T extends SchemaField<infer S, infer REQ, infer NULL> ? SchemaFieldMap<S, REQ, NULL> :
                                never;

type ObjectFieldMap<REQ, NULL> = object | WithReq<REQ> | WithNull<NULL>;
type BooleanFieldMap<REQ, NULL> = boolean | WithReq<REQ> | WithNull<NULL>;
type StringFieldMap<REQ, NULL> = string | WithReq<REQ> | WithNull<NULL>;
type NumberFieldMap<REQ, NULL> = number | WithReq<REQ> | WithNull<NULL>;
type ArrayFieldMap<A, REQ, NULL> = DataFieldMapper<A>[] | WithReq<REQ> | WithNull<NULL>
type EmbeddedDataFieldMap<E, REQ, NULL> = E | WithReq<REQ> | WithNull<NULL>
type SchemaFieldMap<S, REQ, NULL> = MemberDefinitionContainerMapper<S> | WithReq<REQ> | WithNull<NULL>;

type WithReq<REQ> = REQ extends true ? never : undefined;
type WithNull<NULL> = NULL extends true ? null : never;

type HasUndefined<T> = T extends undefined ? true : false
type FilterUndefined<CONDITION, RETURN> = HasUndefined<CONDITION> extends false ? never : RETURN
type DefinedOnly<CONDITON, RETURN> = HasUndefined<CONDITON> extends false ? RETURN : never
type MakeUndefinedOptional<T> =
    { [OPTIONAL in keyof T as FilterUndefined<T[OPTIONAL], OPTIONAL>]+?: Exclude<T[OPTIONAL], undefined> } &
    { [REQUIRED in keyof T as DefinedOnly<T[REQUIRED], REQUIRED>]: T[REQUIRED] };

export {SplittermondDataModel, fields};
export type {DataModelSchemaType}

