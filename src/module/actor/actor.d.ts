import SplittermondItem from "../item/item";
import {CostTypes, SplittermondSkill} from "../../../public/template";

declare class SplittermondActor extends Actor {
    items: Collection<SplittermondItem>;
    async activeDefenseDialog(type?: "defense"|"vtd"|"kw"|"gw"):Promise<void>;
    readonly splinterpoints: {value:number, max:number};
    spendSplinterpoint(): {pointSpent:boolean, getBonus(skillName:string):number};
    async rollMagicFumble(eg:number, costs?:string, skill?:SplittermondSkill):Promise<void>;
    async addTicks(value:number, message?:string, askPlayer?:boolean):Promise<void>;
    consumeCost(type:CostTypes, valueStr:string, description:unknown):void;
}
export default SplittermondActor;