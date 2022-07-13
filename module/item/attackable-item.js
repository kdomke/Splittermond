import Skill from "../actor/skill.js";

const AttackableItem = (superclass) => class extends superclass {
    prepareActorData() {
        super.prepareActorData();
        this.prepareAttacks();
    }

    prepareAttacks() {
        if (!this.systemData().equipped) return;
        let itemData = duplicate(this.systemData());
        let id = this.id;
        let itemName = this.name;
        let damageLevel = this.systemData().damageLevel;
        const actor = this.actor;

        while (itemData) {
            let minAttributeMalus = 0;
            (itemData.minAttributes || "").split(",").forEach(aStr => {
                let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
                if (temp) {
                    let attr = CONFIG.splittermond.attributes.find(a => {
                        return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                    });
                    if (attr) {
                        let diff = parseInt(actor.systemData().attributes[attr].value) - parseInt(temp[2] || 0);
                        if (diff < 0) {
                            minAttributeMalus += diff;
                        }
                    }
                }
            });

            let skill = new Skill(actor, itemData.skill, itemData.attribute1 ? itemData.attribute1 : "agility", itemData.attribute2 ? itemData.attribute2 : "strength");
            skill.addModifierPath(`skill.${id}`);

            this.actor.attacks.push({
                _id: id,
                name: itemName,
                img: this.img,
                item: this,
                skill: skill,
                weaponSpeed: parseInt(itemData.weaponSpeed) ? parseInt(itemData.weaponSpeed) - parseInt(minAttributeMalus) : 7,
                range: itemData.range ? itemData.range : 0,
                features: itemData.features ? itemData.features : "",
                damage: itemData.damage ? itemData.damage : "1W6+1",
            });

            if (minAttributeMalus) {
                this.actor.modifier.add(`skill.${id}`, game.i18n.localize("splittermond.minAttributes"), minAttributeMalus, this);
            }

            if (parseInt(itemData.skillMod)) {
                this.actor.modifier.add(`skill.${id}`, game.i18n.localize("splittermond.skillMod"), parseInt(itemData.skillMod), this);
            }

            if (damageLevel > 2) {
                this.actor.modifier.add(`skill.${id}`, game.i18n.localize("splittermond.damageLevel"), -3, this);
            }

            if (itemData.secondaryAttack && itemData.secondaryAttack.skill !== "" && itemData.secondaryAttack.skill !== "none") {
                itemData = duplicate(itemData.secondaryAttack);
                itemName = `${itemName} (${game.i18n.localize(`splittermond.skillLabel.${itemData.skill}`)})`;
                id = `${id}_secondary`;
            } else {
                itemData = null;
            }
        }
    }
};

export default AttackableItem