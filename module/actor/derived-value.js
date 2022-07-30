import Modifiable from "./modifiable.js";

export default class DerivedValue extends Modifiable {
    /**
     * 
     * @param {Actor} actor Actor object of DerivedValue
     * @param {string} id ID of Derived value like "size", "speed", "initiative" etc.
     */
    constructor(actor, id) {
        let path = [id]
        if (["initiative", "speed"].includes(id)) path.push("woundmalus");
        super(actor, path);
        this.id = id;
        this.multiplier = 1;
        this.label = {
            short: `splittermond.derivedAttribute.${this.id}.short`,
            long: `splittermond.derivedAttribute.${this.id}.long`
        }

        this._cache = {
            enabled: false,
            baseValue: null,
            value: null
        }
    }

    get baseValue() {
        if (this.actor.type != "character" && this.actor.systemData().derivedAttributes[this.id].value > 0) return this.actor.systemData().derivedAttributes[this.id].value;
        if (this._cache.enabled && this._cache.baseValue !== null) return this._cache.baseValue;
        let baseValue = 0;
        const attributes = this.actor.attributes;
        const derivedValues = this.actor.derivedValues;
        switch (this.id) {
            case "size":
                baseValue = this.actor.type == "npc" ? this.actor.systemData().derivedAttributes[this.id].value : parseInt(this.actor.systemData().species.size);
                break;
            case "speed":
                baseValue = attributes.agility.value + derivedValues.size.value;
                break;
            case "initiative":
                baseValue = 10 - attributes.intuition.value;
                break;
            case "healthpoints":
                baseValue = derivedValues.size.value + attributes.constitution.value;
                break;
            case "focuspoints":
                baseValue = 2 * (attributes.mystic.value + attributes.willpower.value);
                break;
            case "defense":
                baseValue = 12 + attributes.agility.value + attributes.strength.value + 2 * (5 - derivedValues.size.value);
                break;
            case "bodyresist":
                baseValue = 12 + attributes.willpower.value + attributes.constitution.value;
                break;
            case "mindresist":
                baseValue = 12 + attributes.willpower.value + attributes.mind.value;
                break;
            default:
                return 0;
                break;

        }
        if (this._cache.enabled && this._cache.baseValue === null)
            this._cache.baseValue = baseValue;
        return baseValue;
    }

    get value() {
        console.log(`DerivedValue (${this.id}) ${this.actor.name} get`);
        //if (this.actor.type != "character") return this.actor.systemData().attributes[this.id].value;
        if (this._cache.enabled && this._cache.value !== null) return this._cache.value;
        let value = Math.ceil(this.multiplier * (this.baseValue + this.mod));
        if (this._cache.enabled && this._cache.value === null)
            this._cache.value = value;
        console.log(`DerivedValue (${this.id}) ${this.actor.name} processed`);
        return value;
    }

    get mod() {
        if (this.id == "initiative") return -super.mod;
        return super.mod;
    }

    enableCaching() {
        this._cache.enabled = true;
    }

    disableCaching() {
        this._cache.enabled = false;
        this._cache.baseValue = null;
        this._cache.value = null;
    }
}