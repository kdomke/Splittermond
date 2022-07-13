import Modifier from "./modifier.js";

export default class ModifierManager {
    constructor() {
        this._modifier = {};
    }

    add(path, ...args) {
        if (!this._modifier[path]) {
            this._modifier[path] = [];
        }

        this._modifier[path].push(new Modifier(path, ...args))
    }

    value(path) {
        return this.static(path).reduce((acc, modifier) => {
            return acc + parseInt(modifier.value);
        }, 0);;
    }

    selectable(path) {
        if (!this._modifier[path]) return [];

        return this._modifier[path].filter(modifier => modifier.selectable).reduce((acc, modifier) => {
            acc[modifier.label] = (acc[modifier.label] || 0) + modifier.value;
        }, {});
    }

    static(path) {
        if (!Array.isArray(path)) {
            path = [path];
        }

        return path.reduce((acc, p) => {
            acc.push(...(this._modifier[p] || []).filter(modifier => !modifier.selectable));
            return acc;
        }, []);
    }
}