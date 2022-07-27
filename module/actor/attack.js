import Skill from "./skill.js";

export default class Attack {
    constructor(actor, item, secondaryAttack = false) {
        this.actor = actor;
        this.item = item;
        this._secondary = secondaryAttack;
        let attackData = this.item;
        if (this.item.systemData) {
            attackData = this.item.systemData();
        }
        if (this._secondary && attackData.secondaryAttack) {
            attackData = attackData.secondaryAttack;
        }


        let minAttributeMalus = 0;
        (attackData.minAttributes || "").split(",").forEach(aStr => {
            let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
            if (temp) {
                let attr = CONFIG.splittermond.attributes.find(a => {
                    return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                });
                if (attr) {
                    let diff = parseInt(this.actor.attributes[attr].value) - parseInt(temp[2] || 0);
                    if (diff < 0) {
                        minAttributeMalus += diff;
                    }
                }
            }
        });


        this.id = !this._secondary ? this.item.id : `${this.item.id}_secondary`;
        this.img = this.item.img;
        this.name = !this._secondary ? this.item.name : `${this.item.name} (${game.i18n.localize(`splittermond.skillLabel.${attackData.skill}`)})`;
        this.skill = new Skill(this.actor, (attackData.skill || this.name), (attackData.attribute1 || ""), (attackData.attribute2 || ""), attackData.skillValue || null);
        this.skill.addModifierPath(`skill.${this.id}`);

        if (minAttributeMalus) {
            this.actor.modifier.add(`skill.${this.id}`, game.i18n.localize("splittermond.minAttributes"), minAttributeMalus, this);
            this.actor.modifier.add(`weaponspeed.${this.id}`, game.i18n.localize("splittermond.minAttributes"), minAttributeMalus, this);
        }

        if (parseInt(attackData.skillMod)) {
            this.actor.modifier.add(`skill.${this.id}`, game.i18n.localize("splittermond.skillMod"), parseInt(attackData.skillMod), this);
        }

        if ((this.item?.systemData?.().damageLevel || 0) > 2) {
            this.actor.modifier.add(`skill.${this.id}`, game.i18n.localize("splittermond.damageLevel"), -3, this);
        }

        this.range = attackData.range || 0;
        this.features = attackData.features || "";
        this.damage = attackData.damage || "1W6+1";
        this._weaponSpeed = attackData.weaponSpeed || 7;
        this.editable = ["weapon", "shield", "npcattack"].includes(this.item.type);
        this.deletable = ["npcattack"].includes(this.item.type);
    }

    get weaponSpeed() {
        let weaponSpeed = this._weaponSpeed;
        weaponSpeed -= parseInt(this.actor.modifier.value(`weaponspeed.${this.id}`));
        if (["melee", "slashing", "chains", "blades", "staffs"].includes(this.skill.id))
            weaponSpeed += parseInt(this.actor.tickMalus);
        return weaponSpeed;
    }

    roll(options) {
        if (!this.actor) return false;

        options = duplicate(options);
        options.type = "attack";
        options.subtitle = this.item.name;
        options.difficulty = "VTD";
        options.preSelectedModifier = [this.item.name];
        options.checkMessageData = {
            weapon: this
        }

        this.skill.roll(options);
    }


}