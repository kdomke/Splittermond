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
        if (!Array.isArray(path)) {
            path = [path];
        }

        return path.reduce((acc, p) => {
            acc.push(...(this._modifier[p] || []).filter(modifier => modifier.selectable));
            return acc;
        }, []).reduce((acc, mod) => {
            acc[mod.name] = (acc[mod.name] || 0) + mod.value;
            return acc;
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