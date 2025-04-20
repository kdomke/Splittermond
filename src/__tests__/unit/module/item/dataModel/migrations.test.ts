import {expect} from "chai";
import {
    migrateFrom0_12_11,
    migrateFrom0_12_13,
    migrateFrom0_12_20
} from "../../../../../module/item/dataModel/migrations";
import sinon from "sinon";
import {foundryApi} from "../../../../../module/api/foundryApi";


describe("Modifier migration from 0.12.11",()=>{
    it("should remove susceptibility modifiers and replace them with resistance modifiers",()=> {
        const source = {modifier: "susceptibility.blunt 1"}

        const result = migrateFrom0_12_11(source);

        expect(result).to.deep.equal({modifier: "resistance.blunt -1"});
    });

    it("should remove multiple susceptibility modifiers and replace them with resistance modifiers",()=> {
        const source = {modifier: "susceptibility.blunt 2, damage/Schwere Armbrust 3,  susceptibility.light -4"}

        const result = migrateFrom0_12_11(source);

        expect(result).to.deep.equal({modifier: "damage/Schwere Armbrust 3, resistance.blunt -2, resistance.light 4"});
    });
});

describe("Modifier migration from 0.12.13",()=>{

    it("should replace emphasis with emphasis attribute",()=> {
        const source = {modifier: "fightingSkill.melee/Hellebarde 1"}

        const result = migrateFrom0_12_13(source);

        expect(result).to.deep.equal({modifier: "fightingSkill.melee emphasis=\"Hellebarde\" 1"});
    });

    it("should replace emphasis with spaces emphasis attribute",()=> {
        const source = {modifier: "damage/Natürliche Waffe 1"}

        const result = migrateFrom0_12_13(source);

        expect(result).to.deep.equal({modifier: "damage emphasis=\"Natürliche Waffe\" 1"});
    });

    it("should keep unaffected modifiers",()=>{
        const source = {modifier: "FO -1,fightingSkill.melee/Hellebarde -1  ,   damage/Natürliche Waffe  +1,   VTD +2"}

        const result = migrateFrom0_12_13(source);

        expect(result).to.deep.equal({modifier: "FO -1, VTD +2, fightingSkill.melee emphasis=\"Hellebarde\" -1, damage emphasis=\"Natürliche Waffe\" +1"});
    });
});
describe("Modifier migration from 0.12.20",()=>{
    let sandbox: sinon.SinonSandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.stub(foundryApi, "localize").callsFake(a =>a);
    });
    afterEach(() => sandbox.restore());

    ["damage", "weaponspeed"].forEach(path => {
        it(`should replace emphasis with item attribute for ${path}`, () => {
            const source = {modifier: `${path}/Hellebarde 1`}

            const result = migrateFrom0_12_20(source);

            expect(result).to.deep.equal({modifier: `${path} item="Hellebarde" 1`});
        });

        it(`should replace dot descriptor with item attribute for ${path}`, () => {
            const source = {modifier: `${path}.Hellebarde 1`}

            const result = migrateFrom0_12_20(source);

            expect(result).to.deep.equal({modifier: `${path} item="Hellebarde" 1`});
        });


        it(`should replace emphasis with spaces emphasis attribute for ${path}`, () => {
            const source = {modifier: `${path} emphasis='Natürliche Waffe' 1`}

            const result = migrateFrom0_12_20(source);

            expect(result).to.deep.equal({modifier: `${path} item="Natürliche Waffe" 1`});
        });

        it(`should keep unaffected modifiers for ${path}`, () => {
            const source = {modifier: `FO -1,fightingSkill.melee emphasis=Hellebarde -1  ,   ${path} emphasis='Natürliche Waffe'  +1,   VTD +2`}

            const result = migrateFrom0_12_20(source);

            expect(result).to.deep.equal({modifier: `FO -1, fightingSkill.melee emphasis=Hellebarde -1, VTD +2, ${path} item="Natürliche Waffe" 1`});
        });
    });
});
