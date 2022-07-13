export default class Modifier {
    constructor(path, name, value, origin = null, type = "", selectable = false) {
        this.path = path;
        this.value = parseInt(value);
        this.origin = origin;
        this.selectable = selectable;
        this.name = name;
        this.type = type;
    }

    get isMalus() {
        return this.value < 0;
    }

    get isBonus() {
        return this.value > 0;
    }

}