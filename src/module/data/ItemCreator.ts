import {foundryApi} from "../api/foundryApi";
import type SplittermondSpellItem from "../item/spell";
import {SplittermondSpellType} from "./SplittermondSpellData";

export const itemCreator = {
    createSpell(data: {type: "spell", system: SplittermondSpellType}): Promise<SplittermondSpellItem> {
        return foundryApi.createItem(data) as Promise<SplittermondSpellItem>;
    }
}