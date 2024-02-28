
export function dataModelTest(context) {
    const {describe, it, expect} = context;
    describe("foundry data model API", () => {
        const TestChild = class extends foundry.abstract.DataModel {
            static defineSchema() {
                return {
                    name: new foundry.data.fields.StringField({required: true, blank: false}),
                }
            }
        };
        const TestParent = class extends foundry.abstract.DataModel {
            static defineSchema() {
                return {
                    child: new foundry.data.fields.EmbeddedDataField(TestChild, {required: true, blank: false}),
                }
            }
        }
        it("injects a parent into embedded data", () => {
            const underTest = new TestParent({child: {name: "test"}});

            expect(underTest.child.parent).to.equal(underTest);
        });

        it("restores embedded data", async () => {
            const underTest = new TestParent({child: {name: "test"}});

            const objectifiedMessage = underTest.toObject();
            const restoredMessage = new TestParent(objectifiedMessage);

            expect(restoredMessage.child).to.be.instanceOf(TestChild);
            expect(restoredMessage.child.name).to.equal("test");
            expect(restoredMessage.child.parent).to.equal(restoredMessage);
        });
    });
}