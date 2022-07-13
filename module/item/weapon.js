import SplittermondItem from "./item.js";
import AttackableItem from "./attackable-item.js";


export default class SplittermondWeaponItem extends AttackableItem(SplittermondItem) {

    prepareActorData() {
        super.prepareActorData();
        this.prepareActiveDefense();
    }

    prepareActiveDefense() {
        if (!this.systemData().equipped && this.systemData().damageLevel <= 1) return;
        let itemData = duplicate(this.systemData());


        let id = this.id;
        let itemName = this.name;
        let damageLevel = this.systemData().damageLevel;
        const actor = this.actor;

        while (itemData) {
            if (["melee", "slashing", "chains", "blades", "staffs"].includes(itemData.skill)) {
                let minAttributeMalus;
                (itemData.minAttributes || "").split(",").forEach(aStr => {
                    let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
                    if (temp) {
                        let attr = CONFIG.splittermond.attributes.find(a => {
                            return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                        });
                        if (attr) {
                            let diff = parseInt(actor.attributes[attr].value) - parseInt(temp[2] || 0);
                            if (diff < 0) {
                                minAttributeMalus += diff;
                            }
                        }
                    }
                });

                this.actor.systemData().activeDefense.defense.push({
                    _id: id,
                    name: itemName,
                    img: this.img,
                    item: this,
                    skillId: itemData.skill,
                    skillMod: itemData.skillMod,
                    attribute1: itemData.attribute1,
                    attribute2: itemData.attribute2,
                    features: itemData.features ? itemData.features : "",
                    isDamaged: parseInt(damageLevel) === 1,
                    minAttributeMalus: minAttributeMalus
                });
            }
            if (itemData.secondaryAttack && itemData.secondaryAttack.skill !== "" && itemData.secondaryAttack.skill !== "none") {
                itemData = duplicate(itemData.secondaryAttack);
                itemName = `${itemName} (${game.i18n.localize(`splittermond.skillLabel.${itemData.skill}`)})`;
            } else {
                itemData = null;
            }
        }
    }
}