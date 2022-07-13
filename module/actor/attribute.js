export default class Attribute {
    constructor(actor, attributeId) {
        this.actor = actor;
        this.id = attributeId;
        this.label = {
            short: `splittermond.attribute.${this.id}.short`,
            long: `splittermond.attribute.${this.id}.long`
        };
        this._value = null;
        this._start = null;
        this._max = null;
    }

    get value() {
        if (this.actor.type != "character") return this.actor.systemData().attributes[this.id].value || 0;
        if (this.actor.caching && this._value !== null) return this._value;
        let val = this.start + parseInt(this.actor.systemData().attributes[this.id].advances || 0);
        if (this.actor.caching && this._value === null) this._value = val;
        return val;
    }

    get start() {
        if (this.actor.caching && this._start !== null) return this._start;
        const data = this.actor.systemData();
        let val = parseInt(data.attributes[this.id].initial || 0)
            + parseInt(data.attributes[this.id].species || 0);
        if (this.actor.caching && this._start === null) this._start = val;
        return val;
    }

    get max() {
        if (this.actor.caching && this._max !== null) return this._max;
        let val = this.start + this.actor.systemData().experience.heroLevel;
        if (this.actor.caching && this._start === null) this._max = val;
        return val;
    }
}