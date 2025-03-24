import {expect} from "chai";
import {migrateFrom0_12_10} from "../../../../../module/item/dataModel/migrations";


describe ("Modifier migration from 0.12.10",()=>{
    it("should remove susceptibility modifiers and replace them with resistance modifiers",()=> {
        const source = {modifier: "susceptibility.blunt 1"}

        const result = migrateFrom0_12_10(source);

        expect(result).to.deep.equal({modifier: "resistance.blunt -1"});
    });

    it("should remove multiple susceptibility modifiers and replace them with resistance modifiers",()=> {
        const source = {modifier: "susceptibility.blunt 2, damage/Schwere Armbrust 3,  susceptibility.light -4"}

        const result = migrateFrom0_12_10(source);

        expect(result).to.deep.equal({modifier: "damage/Schwere Armbrust 3, resistance.blunt -2, resistance.light 4"});
    });


})