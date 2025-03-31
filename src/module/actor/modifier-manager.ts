import Modifier, {IModifier, ModifierAttributes} from "./modifier";
import SplittermondItem from "../item/item";
import SplittermondActor from "./actor";
import {Expression, of, plus} from "./modifiers/expressions/definitions";
import {evaluate} from "./modifiers/expressions/evaluation";

interface AttributeSelector {
    key: string,
    values: string[],
    allowAbsent?: boolean
}

export default class ModifierManager {
    private _modifier: Map<string, IModifier[]> = new Map();

    constructor() {
    }

    add(path:string, attributes:  ModifierAttributes, value: Expression, origin: SplittermondItem | SplittermondActor | null = null, selectable = false) {
        this.addModifier(new Modifier(path, value, attributes, origin, selectable));
    }

    addModifier(modifier: IModifier) {
        if (!this._modifier.get(modifier.groupId)) {
            this._modifier.set(modifier.groupId, []);
        }
        this._modifier.get(modifier.groupId)!.push(modifier)
    }


    /**
     * @deprecated
     */
    public value(groupId:string|string[], attributeSelectors: AttributeSelector[] = []) {
        if (!Array.isArray(groupId)) {
            groupId = [groupId];
        }

        return groupId.map(id => this.singleValue(id, attributeSelectors))
            .reduce((acc, value) => acc + value, 0);
    }

    private singleValue(groupId: string, attributeSelectors: AttributeSelector[] = []) {
        const sum = this.getModifiers(groupId, attributeSelectors,false)
            .map(mod => mod.value)
            .reduce((acc, value) => plus(acc, value), of(0))
        return evaluate(sum)
    }


    selectable(groupId: string | string[], attributeSelectors: AttributeSelector[] = []) {
        if (!Array.isArray(groupId)) {
            groupId = [groupId];
        }

        return groupId.flatMap(id =>this.getModifiers(id, attributeSelectors, true))
            .reduce((acc, mod) => {
                acc[mod.attributes.name] = plus((acc[mod.attributes.name] || of(0)), mod.value);
                return acc;
            }, {} as Record<string, Expression>);
    }

    /**
     * @deprecated use getId or getModifiers
     */
    static(id: string | string[]) {
        if (!Array.isArray(id)) {
            id = [id];
        }

        return id.reduce((acc, p) => {
            acc.push(...(this._modifier.get(p) ?? []).filter(modifier => !modifier.selectable));
            return acc;
        }, [] as IModifier[]);
    }

    getForId(groupId: string) {
        return new AttributeBuilder(groupId, this);
    }

    getModifiers(groupId: string, withAttributes: AttributeSelector[] = [], selectable: boolean | null = null) {
        const modifiersForPath = this._modifier.get(groupId) ?? [];
        return modifiersForPath
            .filter(modifier => selectable === null || modifier.selectable === selectable)
            .filter(mod => passesAttributeFilter(mod, withAttributes));
    }
}

function passesAttributeFilter(modifier: IModifier, attributes: AttributeSelector[]) {
    for (const attribute of attributes) {
        if (attribute.key in modifier.attributes) {
            const value = modifier.attributes[attribute.key];
            const isPermittedAbsence = !!attribute.allowAbsent && [undefined, null].includes(value as any);
            if (attribute.values.includes(value as any) && !isPermittedAbsence) {
                return false;
            }
        } else if (!attribute.allowAbsent) {
            return false;
        }
    }
    return true;
}

class AttributeBuilder {
    private _attributes: AttributeSelector[] = [];
    private _selectable: boolean | null = null;

    constructor(private readonly groupId: string, private manager: ModifierManager) {
    }

    withAttributeValues(key: string, ...values: string[]) {
        this._attributes.push({key, values, allowAbsent: false});
        return this;
    }

    withAttributeValuesOrAbsent(key: string, ...values: string[]) {
        this._attributes.push({key, values, allowAbsent: true});
        return this;
    }

    selectable() {
        this._selectable = true;
    }

    notSelectable() {
        this._selectable = false;
    }

    getModifiers() {
        return this.manager.getModifiers(this.groupId, this._attributes, this._selectable)
    }
}