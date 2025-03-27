import Modifier, {IModifier} from "./modifier";
import SplittermondItem from "../item/item";
import SplittermondActor from "./actor";
import {Expression, of, plus} from "./modifiers/expressions/definitions";
import {evaluate} from "./modifiers/expressions/evaluation";

export default class ModifierManager {
    private _modifier: Map<string, IModifier[]> = new Map();

    constructor() {
    }

    add(path: string, name: string, value: Expression, origin: SplittermondItem | SplittermondActor | null = null, type: string = "", selectable = false) {
        const newModifier = new Modifier(path, name, value, origin, type, selectable);
        this.addModifier(newModifier);
    }

    addModifier(modifier: IModifier) {
        if (!this._modifier.get(modifier.groupId)) {
            this._modifier.set(modifier.groupId, []);
        }
        this._modifier.get(modifier.groupId)!.push(modifier)
    }

    value(groupId: string) {
        const sum = this.static(groupId).map(mod => mod.value)
            .reduce((acc, value) => plus(acc, value), of(0))
        return evaluate(sum)
    }

    selectable(path: string | string[]) {
        if (!Array.isArray(path)) {
            path = [path];
        }

        return path.reduce((acc, p) => {
            acc.push(...(this._modifier.get(p) ?? []).filter(modifier => modifier.selectable));
            return acc;
        }, [] as IModifier[]).reduce((acc, mod) => {
            acc[mod.name] = plus((acc[mod.name] || of(0)), mod.value);
            return acc;
        }, {} as Record<string, Expression>);
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