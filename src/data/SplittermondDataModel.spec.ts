// noinspection JSUnusedLocalSymbols

import {DataModelSchemaType, SplittermondDataModel} from "./SplittermondDataModel";
import {fields} from "./SplittermondDataModel";


type Not<T> = T extends true ? false : true;
type IsNever<T> = [T] extends [never] ? true : false;
type IsUndefined<T> = T extends undefined ? true : false;

namespace TestTestTypes {
    const verifyIsNever: IsNever<never> = true;
    const verifyIsNotNever: IsNever<string> = false;
    const verifyIsUndefined: IsUndefined<undefined> = true;
    const verifyIsNotUndefined: IsUndefined<string> = false;
    const verifyIsAlsoNotUndefined: IsUndefined<string | undefined> = false;
}

namespace ObjectFieldTest {
    namespace StrictlyRequired {
        function testObjectField() {
            return {key: new fields.ObjectField({required: true, nullable: false})}
        }

        type TestObjectSchema = DataModelSchemaType<typeof testObjectField>

        type IsNotNullable = TestObjectSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestObjectSchema["key"]>>;

        const verifyDataIsObject: TestObjectSchema = {key: {something: 3}}
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testObjectField() {
            return {key: new fields.ObjectField({required: true, nullable: true})}
        }

        type TestObjectSchema = DataModelSchemaType<typeof testObjectField>

        type IsNullable = TestObjectSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestObjectSchema["key"]>>;

        const verifyDataIsObject: TestObjectSchema = {key: {}};
        const verifyDataIsNull: TestObjectSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testObjectField() {
            return {key: new fields.ObjectField({required: false, nullable: false})}
        }

        type TestObjectSchema = DataModelSchemaType<typeof testObjectField>

        type IsNotNullable = TestObjectSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestObjectSchema["key"]>>;

        const verifyDataIsObject: TestObjectSchema = {key: {exciting: []}};
        const verifyDataIsNotRequired: TestObjectSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace BooleanFieldTest {
    namespace StrictlyRequired {
        function testBooleanField() {
            return {key: new fields.BooleanField({required: true, nullable: false})}
        }

        type TestBooleanSchema = DataModelSchemaType<typeof testBooleanField>

        type IsNotNullable = TestBooleanSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestBooleanSchema["key"]>>;

        const verifyDataIsBoolean: TestBooleanSchema = {key: true}
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testBooleanField() {
            return {key: new fields.BooleanField({required: true, nullable: true})}
        }

        type TestBooleanSchema = DataModelSchemaType<typeof testBooleanField>

        type IsNullable = TestBooleanSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestBooleanSchema["key"]>>;

        const verifyDataIsBoolean: TestBooleanSchema = {key: false};
        const verifyDataIsNull: TestBooleanSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testBooleanField() {
            return {key: new fields.BooleanField({required: false, nullable: false})}
        }

        type TestBooleanSchema = DataModelSchemaType<typeof testBooleanField>

        type IsNotNullable = TestBooleanSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestBooleanSchema["key"]>>;

        const verifyDataIsBoolean: TestBooleanSchema = {key: true};
        const verifyDataIsNotRequired: TestBooleanSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace StringFieldTest {
    namespace StrictlyRequired {
        function testStringField() {
            return {key: new fields.StringField({required: true, nullable: false})}
        }

        type TestStringSchema = DataModelSchemaType<typeof testStringField>

        type IsNotNullable = TestStringSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestStringSchema["key"]>>;

        const verifyDataIsString: TestStringSchema = {key: "testString"}
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testStringField() {
            return {key: new fields.StringField({required: true, nullable: true})}
        }

        type TestStringSchema = DataModelSchemaType<typeof testStringField>

        type IsNullable = TestStringSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestStringSchema["key"]>>;

        const verifyDataIsString: TestStringSchema = {key: "testString"};
        const verifyDataIsNull: TestStringSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testStringField() {
            return {key: new fields.StringField({required: false, nullable: false})}
        }

        type TestStringSchema = DataModelSchemaType<typeof testStringField>

        type IsNotNullable = TestStringSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestStringSchema["key"]>>;

        const verifyDataIsString: TestStringSchema = {key: "testString"};
        const verifyDataIsNotRequired: TestStringSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace NumberFieldTest {
    namespace StrictlyRequired {
        function testNumberField() {
            return {key: new fields.NumberField({required: true, nullable: false})}
        }

        type TestNumberSchema = DataModelSchemaType<typeof testNumberField>

        type IsNotNullable = TestNumberSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestNumberSchema["key"]>>;

        const verifyDataIsNumber: TestNumberSchema = {key: 333}
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testNumberField() {
            return {key: new fields.NumberField({required: true, nullable: true})}
        }

        type TestNumberSchema = DataModelSchemaType<typeof testNumberField>

        type IsNullable = TestNumberSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestNumberSchema["key"]>>;

        const verifyDataIsNumber: TestNumberSchema = {key: -1};
        const verifyDataIsNull: TestNumberSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testNumberField() {
            return {key: new fields.NumberField({required: false, nullable: false})}
        }

        type TestNumberSchema = DataModelSchemaType<typeof testNumberField>

        type IsNotNullable = TestNumberSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestNumberSchema["key"]>>;

        const verifyDataIsNumber: TestNumberSchema = {key: 1.3};
        const verifyDataIsNotRequired: TestNumberSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace ArrayFieldTest {
    namespace StrictlyRequired {
        function testArrayField() {
            return {key: new fields.ArrayField(new fields.StringField({}), {required: true, nullable: false})}
        }

        type TestArraySchema = DataModelSchemaType<typeof testArrayField>

        type IsNotNullable = TestArraySchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestArraySchema["key"]>>;

        const verifyDataIsArray: TestArraySchema = {key: ["Three", "Moons"]}
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testArrayField() {
            return {key: new fields.ArrayField(new fields.StringField({}), {required: true, nullable: true})}
        }

        type TestArraySchema = DataModelSchemaType<typeof testArrayField>

        type IsNullable = TestArraySchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestArraySchema["key"]>>;

        const verifyDataIsArray: TestArraySchema = {key: ["In", "the"]};
        const verifyDataIsNull: TestArraySchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testArrayField() {
            return {key: new fields.ArrayField(new fields.StringField({}), {required: false, nullable: false})}
        }

        type TestArraySchema = DataModelSchemaType<typeof testArrayField>

        type IsNotNullable = TestArraySchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestArraySchema["key"]>>;

        const verifyDataIsArray: TestArraySchema = {key: ["sky"]};
        const verifyDataIsNotRequired: TestArraySchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace EmbeddedDataFieldTest {
    function TestDataDefinition() {
        return {test: new fields.StringField({required: false, nullable: false})};
    }

    class TestDataModel extends SplittermondDataModel<DataModelSchemaType<typeof TestDataDefinition>> {
        defineSchema() {
            return TestDataDefinition();
        }
    }

    namespace StrictlyRequired {
        function testEmbeddedDataField() {
            return {key: new fields.EmbeddedDataField(TestDataModel, {required: true, nullable: false})}
        }

        type TestEmbeddedDataSchema = DataModelSchemaType<typeof testEmbeddedDataField>

        type IsNotNullable = TestEmbeddedDataSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestEmbeddedDataSchema["key"]>>;

        const verifyDataIsEmbeddedData: TestEmbeddedDataSchema = {key: new TestDataModel({test: "string"})};
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testEmbeddedDataField() {
            return {key: new fields.EmbeddedDataField(TestDataModel, {required: true, nullable: true})}
        }

        type TestEmbeddedDataSchema = DataModelSchemaType<typeof testEmbeddedDataField>

        type IsNullable = TestEmbeddedDataSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestEmbeddedDataSchema["key"]>>;

        const verifyDataIsEmbeddedData: TestEmbeddedDataSchema = {key: new TestDataModel({test: "string"})};
        const verifyDataIsNull: TestEmbeddedDataSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testEmbeddedDataField() {
            return {key: new fields.EmbeddedDataField(TestDataModel, {required: false, nullable: false})}
        }

        type TestEmbeddedDataSchema = DataModelSchemaType<typeof testEmbeddedDataField>

        type IsNotNullable = TestEmbeddedDataSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestEmbeddedDataSchema["key"]>>;

        const verifyDataIsEmbeddedData: TestEmbeddedDataSchema = {key: new TestDataModel({test: "string"})};
        const verifyDataIsNotRequired: TestEmbeddedDataSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace SchemaFieldTest {
    const schema = {
        strict: new fields.NumberField({required: true, nullable: false}),
        nullable: new fields.BooleanField({required: true, nullable: true}),
        optional: new fields.StringField({required: false, nullable: false}),
    };
    namespace StrictlyRequired {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: true, nullable: false})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNotNullable = TestSchemaSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]>>;

        const verifyDataIsSchema: TestSchemaSchema = {key: {strict: 3, nullable: null, optional: undefined}};
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: true, nullable: true})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNullable = TestSchemaSchema["key"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]>>;

        const verifyDataIsSchema: TestSchemaSchema = {key: {strict: 3, nullable: true, optional: "yes"}};
        const verifyDataIsNull: TestSchemaSchema = {key: null};
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: false, nullable: false})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNotNullable = TestSchemaSchema["key"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]>>;

        const verifyDataIsSchema: TestSchemaSchema = {key: {strict: 3, nullable: true, optional: "yes"}};
        const verifyDataIsNotRequired: TestSchemaSchema = {key: undefined};
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace SchemaRecursionTest {
    const schema = {
        strict: new fields.NumberField({required: true, nullable: false}),
        nullable: new fields.BooleanField({required: true, nullable: true}),
        optional: new fields.StringField({required: false, nullable: false}),
    };
    namespace StrictlyRequired {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: true, nullable: false})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNotNullable = TestSchemaSchema["key"]["strict"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]["strict"]>>;

        const verifyDataIsNumber: TestSchemaSchema["key"]["strict"] = 3
        const verifyIsNotNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace Nullable {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: true, nullable: false})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNullable = TestSchemaSchema["key"]["nullable"] & null extends never ? false : true;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]["nullable"]>>;

        const verifyDataIsBoolean: TestSchemaSchema["key"]["nullable"] = true;
        const verifyDataIsNull: TestSchemaSchema["key"]["nullable"] = null;
        const verifyIsNullable: IsNullable = true;
        const verifyRequired: IsRequired = true;
    }

    namespace NotRequired {
        function testSchemaField() {
            return {key: new fields.SchemaField(schema, {required: true, nullable: false})}
        }

        type TestSchemaSchema = DataModelSchemaType<typeof testSchemaField>

        type IsNotNullable = TestSchemaSchema["key"]["optional"] & null extends never ? true : false;
        type IsRequired = Not<IsUndefined<TestSchemaSchema["key"]["optional"]>>;

        const verifyDataIsString: TestSchemaSchema["key"]["optional"] = "yes";
        const verifyDataIsNotRequired: TestSchemaSchema["key"]["optional"] = undefined;
        const verifyIsNullable: IsNotNullable = true;
        const verifyRequired: IsRequired = false;
    }
}

namespace ComplexScenarioTest {
    namespace SchemaInArray {
        function testField() {
            const innerSchema = {
                num: new fields.NumberField({required: true, nullable: true}),
                bool: new fields.BooleanField({required: false, nullable: false}),
            } as const;
            return {
                key: new fields.ArrayField(
                    new fields.SchemaField(innerSchema, {required: false, nullable: true}),
                    {required: true, nullable: false})
            };
        }

        type TestSchema = DataModelSchemaType<typeof testField>;

        const verifyInnerSchema: TestSchema["key"][number] = {num: 3, bool: false}
        const verifyNull: TestSchema["key"] = [null];
        const verifyInnerOptional: TestSchema["key"][number] = {num: 3, bool: undefined}
    }

    namespace EmbeddedInSchema {
        function TestDataDefinition() {
            return {test: new fields.StringField({required: false, nullable: false})};
        }

        class TestDataModel extends SplittermondDataModel<DataModelSchemaType<typeof TestDataDefinition>> {
            defineSchema() {
                return TestDataDefinition();
            }
        }

        function testField() {
            return {
                key: new fields.SchemaField(
                    {data: new fields.EmbeddedDataField(TestDataModel, {required: false, nullable: true})},
                    {required: true, nullable: false})
            };
        }

        type TestSchema = DataModelSchemaType<typeof testField>;

        const verifyEmbedded: TestSchema["key"]["data"] = new TestDataModel({test:"works"});
    }
}

