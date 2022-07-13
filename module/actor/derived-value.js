import Modifiable from "./modifiable.js";

export default class DerivedValue extends Modifiable {
    constructor(actor, id) {
        super(actor, id);
        this.id = id;
        this.multiplier = 1;
        this.label = {
            short: `splittermond.derivedAttribute.${this.id}.short`,
            long: `splittermond.derivedAttribute.${this.id}.long`
        }
    }

    get value() {
        if (this.actor.type != "character") return this.actor.systemData().attributes[this.id].value;
        let baseValue = 0;
        const attributes = this.actor.attributes;
        const derivedValues = this.actor.derivedValues;
        switch (this.id) {
            case "size":
                baseValue = parseInt(this.actor.systemData().species.size);
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

        return Math.ceil(this.multiplier * (baseValue + this.mod));
    }

    get mod() {
        if (this.id == "initiative") return -super.mod;
        return super.mod;
    }
}