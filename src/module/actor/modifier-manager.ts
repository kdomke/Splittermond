import Modifier, {IModifier} from "./modifier";
import SplittermondItem from "../item/item";
import SplittermondActor from "./actor";

export default class ModifierManager {
    private _modifier: Map<string, IModifier[]> = new Map();

    constructor() {
    }

    add(path: string, name: string, value: number|string, origin: SplittermondItem | SplittermondActor | null = null, type: string = "", selectable = false) {
        const newModifier = new Modifier(path, name, value, origin, type, selectable);
        if (!this._modifier.get(newModifier.groupId)) {
            this._modifier.set(newModifier.groupId, []);
        }
        this._modifier.get(newModifier.groupId)!.push(newModifier)
    }

    value(groupId: string) {
        return this.static(groupId).reduce((acc, modifier) => {
            return acc + modifier.value;
        }, 0);
    }

    selectable(path: string | string[]) {
        if (!Array.isArray(path)) {
            path = [path];
        }

        return path.reduce((acc, p) => {
            acc.push(...(this._modifier.get(p) ?? []).filter(modifier => modifier.selectable));
            return acc;
        }, [] as IModifier[]).reduce((acc, mod) => {
            acc[mod.name] = (acc[mod.name] || 0) + mod.value;
            return acc;
        }, {} as Record<string, number>);
    }

    static(id: string | string[]) {
        if (!Array.isArray(id)) {
            id = [id];
        }

        return id.reduce((acc, p) => {
            acc.push(...(this._modifier.get(p) ?? []).filter(modifier => !modifier.selectable));
            return acc;
        }, [] as IModifier[]);
    }
}