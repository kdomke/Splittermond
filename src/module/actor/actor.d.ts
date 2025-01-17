import SplittermondItem from "../item/item";
import {CostTypes} from "../../../public/template";
import type {SplittermondSkill} from "../config/skillGroups";
import Attack from "./attack";

declare class SplittermondActor extends Actor {
    items: Collection<SplittermondItem>;
    async activeDefenseDialog(type?: "defense"|"vtd"|"kw"|"gw"):Promise<void>;
    readonly splinterpoints: {value:number, max:number};
    spendSplinterpoint(): {pointSpent:boolean, getBonus(skillName:SplittermondSkill):number};
    async rollMagicFumble(eg:number, costs?:string, skill?:SplittermondSkill):Promise<void>;
    async addTicks(value:number, message?:string, askPlayer?:boolean):Promise<void>;
    consumeCost(type:CostTypes, valueStr:string, description:unknown):void;
    attacks: Attack[];
    type: "character"|"npc";
}
export default SplittermondActor;