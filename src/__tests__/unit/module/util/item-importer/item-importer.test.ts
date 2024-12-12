import ItemImporter from "../../../../../module/util/item-importer";
import * as Machtexplosion from "./GRW/spells/Machtexplosion.resource";
import * as Maskerade from "./GRW/spells/Maskerade.resource";
import {describe, it} from "mocha";
import sinon, {SinonSandbox, SinonStub} from "sinon";
import {itemCreator} from "../../../../../module/data/ItemCreator";
import {expect} from "chai";
import {foundryApi} from "../../../../../module/api/foundryApi";
import {initLocalizer} from "./poorMansLocalizer";

declare const game: any;
global.ClipboardEvent = class {
    constructor(private text: string) {
    }

    public clipboardData = {
        getData: () => this.text,
    }
} as any;
describe("ItemImporter", () => {
    let sandbox: SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(foundryApi, "localize").callsFake(initLocalizer());
    });
    afterEach(() => {
        sandbox.restore();
    });


    describe("Imports from the core rulebook", () => {

        describe("Spell imports", () => {
            let spellCreationStub: SinonStub;
            beforeEach(() => {
                spellCreationStub = sandbox.stub(itemCreator, "createSpell");
            });

            it("should import spell 'Machtexplosion'", async () => {
                const text = Machtexplosion.input

                sandbox.stub(ItemImporter, "_folderDialog").returns(Promise.resolve("folderId"));
                sandbox.stub(ItemImporter, "_skillDialog").returns(Promise.resolve("fightmagic"));

                await ItemImporter.pasteEventhandler(new ClipboardEvent(text));

                expect(spellCreationStub.calledOnce).to.be.true;
                expect(spellCreationStub.getCalls()[0].args[0]).to.deep.equal(
                    {folder: "folderId", ...Machtexplosion.expected});

            })

            it("should import spell 'Maskerade'", async () => {
                const text = Maskerade.input

                sandbox.stub(ItemImporter, "_folderDialog").returns(Promise.resolve("folderId"));
                sandbox.stub(ItemImporter, "_skillDialog").returns(Promise.resolve("fightmagic"));


                await ItemImporter.pasteEventhandler(new ClipboardEvent(text));

                expect(spellCreationStub.calledOnce).to.be.true;
                expect(spellCreationStub.getCalls()[0].args[0]).to.deep.equal(
                    {folder: "folderId", ...Maskerade.expected});
            })
        });

        it("should import several banemagtic masteries at once")
    });
});