
export default class ActiveDefense {
    constructor(id, type, name, skill, features = "", img = null) {
        this.id = id;
        this.type = type;
        this.skill = skill;
        this.actor = this.skill.actor;
        this.features = features;
        this.name = name;
        this.img = img;
    }

    async roll(options = {}) {
        if (!this.actor) return;

        options = duplicate(options)
        options.type = "defense";
        options.difficulty = 15;
        options.title = `${game.i18n.localize(`splittermond.activeDefense`)}: ${game.i18n.localize(this.actor.derivedValues[this.type].label.long)} - ${this.name}`;
        options.checkMessageData = {
            defenseType: this.type,
            baseDefense: this.actor.derivedValues[this.type].value,
            itemData: this
        }

        return this.skill.roll(options);
    }

    tooltip() {
        return this.skill.tooltip();
    }
}