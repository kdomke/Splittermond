import {foundryApi} from "../api/foundryApi";
import type SplittermondSpellItem from "../item/spell";
import {SplittermondMasterySystemData, SplittermondSpellSystemData} from "module/data/ItemSystemData";
import SplittermondMasteryItem from "../item/mastery";

export const itemCreator = {
    createSpell(data: {type: "spell", system: SplittermondSpellSystemData}): Promise<SplittermondSpellItem> {
        return foundryApi.createItem(data) as Promise<SplittermondSpellItem>;
    },

    createMastery(data:{type: "mastery", system: SplittermondMasterySystemData}): Promise<SplittermondMasteryItem> {
        return foundryApi.createItem(data) as Promise<SplittermondSpellItem>;
    }
}