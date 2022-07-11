const AttackableItem = (superclass) => class extends superclass {
  prepareActorData() {
    super.prepareActorData();
    this.prepareAttacks();
  }

  prepareAttacks() {
    if (!this.systemData().equipped) return 0;
    let itemData = duplicate(this.systemData());
    let id = this.id;
    let itemName = this.name;
    let damageLevel = this.systemData().damageLevel;

    while (itemData) {
        let minAttributeMalus;
        (itemData.minAttributes || "").split(",").forEach(aStr => {
            let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
            if (temp) {
                let attr = CONFIG.splittermond.attributes.find(a => {
                    return temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.short`).toLowerCase() || temp[1].toLowerCase() === game.i18n.localize(`splittermond.attribute.${a}.long`).toLowerCase()
                });
                if (attr) {
                    let diff = parseInt(this.actor.systemData().attributes[attr].value) - parseInt(temp[2] || 0);
                    if (diff < 0) {
                        minAttributeMalus += diff;
                    }
                }
            }
        });

        this.actor.systemData().attacks.push({
            _id: id,
            name: itemName,
            img: this.img,
            item: this,
            skillId: itemData.skill,
            skillMod: itemData.skillMod,
            attribute1: itemData.attribute1 ? itemData.attribute1 : "agility",
            attribute2: itemData.attribute2 ? itemData.attribute2 : "strength",
            weaponSpeed: parseInt(itemData.weaponSpeed) ? parseInt(itemData.weaponSpeed) : 7,
            range: itemData.range ? itemData.range : 0,
            features: itemData.features ? itemData.features : "",
            damage: itemData.damage ? itemData.damage : "1W6+1",
            isDamaged: parseInt(damageLevel) === 1,
            minAttributeMalus: minAttributeMalus
        });

        if (itemData.secondaryAttack && itemData.secondaryAttack.skill !== "" && itemData.secondaryAttack.skill !== "none") {
            itemData = duplicate(itemData.secondaryAttack);
            itemName = `${itemName} (${game.i18n.localize(`splittermond.skillLabel.${itemData.skill}`)})`;
        } else {
            itemData = null;
        }
    }
}
};

export default AttackableItem