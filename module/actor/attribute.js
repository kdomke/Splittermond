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

        this._cache = {
            enabled: false,
            value: null,
            start: null,
            max: null
        }
    }

    get value() {
        console.log(`Attribute (${this.id}) ${this.actor.name} get value`);
        if (this.actor.type != "character") return this.actor.systemData().attributes[this.id].value || 0;
        if (this._cache.enabled && this._cache.value !== null) return this._cache.value;
        let val = this.start + parseInt(this.actor.systemData().attributes[this.id].advances || 0);
        if (this._cache.enabled && this._cache.value === null) this._cache.value = val;
        console.log(`Attribute (${this.id}) ${this.actor.name} processed value`);
        return val;
    }

    get start() {
        console.log(`Attribute (${this.id}) ${this.actor.name} get start`);
        if (this._cache.enabled && this._cache.start !== null) return this._cache.start;
        const data = this.actor.systemData();
        let val = parseInt(data.attributes[this.id].initial || 0)
            + parseInt(data.attributes[this.id].species || 0);
        if (this._cache.enabled && this._cache.start === null) this._cache.start = val;
        console.log(`Attribute (${this.id}) ${this.actor.name} processed start`);
        return val;
    }

    get max() {
        console.log(`Attribute (${this.id}) ${this.actor.name} get max`);
        if (this._cache.enabled && this._cache.max !== null) return this._cache.max;
        let val = this.start + (this.actor.systemData()?.experience?.heroLevel || 0);
        if (this._cache.enabled && this._cache.max === null) this._cache.max = val;
        console.log(`Attribute (${this.id}) ${this.actor.name} processed max`);
        return val;
    }

    enableCaching() {
        this._cache.enabled = true;
    }

    disableCaching() {
        this._cache.enabled = false;
        this._cache.start = null;
        this._cache.value = null;
        this._cache.max = null;
    }
}