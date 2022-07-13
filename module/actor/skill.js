import Modifiable from "./modifiable.js";


export default class Skill extends Modifiable {
    constructor(actor, skill, attribute1 = "", attribute2 = "") {
        attribute1 = attribute1 ? attribute1 : CONFIG.splittermond.skillAttributes[skill][0];
        attribute2 = attribute2 ? attribute2 : CONFIG.splittermond.skillAttributes[skill][1];
        super(actor, skill);
        this.skillId = skill;
        this.label = `splittermond.skillLabel.${this.skillId}`;
        this.attribute1 = this.actor.attributes[attribute1];
        this.attribute2 = this.actor.attributes[attribute2];
    }

    get points() {
        return parseInt(this.actor.systemData().skills[this.skillId].points);
    }

    get value() {
        return this.attribute1.value + this.attribute2.value + this.points + this.mod;
    }

}