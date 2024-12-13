import SplittermondActor from "../actor/actor";
import {SplittermondItemSystemData} from "../data/ItemSystemData";

declare class SplittermondItem extends Item {
    readonly actor: SplittermondActor;
    type:string;
    prepareActorData():void;
    system: SplittermondItemSystemData;
}

export default SplittermondItem;