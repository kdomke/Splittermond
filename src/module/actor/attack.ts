import Skill from "./skill.js";
import {of} from "./modifiers/expressions/scalar";
import {foundryApi} from "../api/foundryApi.js";
import SplittermondActor from "./actor";
import {splittermond} from "../config";
import {initMapper} from "../util/LanguageMapper";
import {MasteryDataModel} from "../item/dataModel/MasteryDataModel";

interface AttackItem {
    id: string;
    img: string;
    name: string;
    type: string;
    system: AttackItemData & { secondaryAttack?: AttackItemData };
}

//most nulls here are due to secondary attacks
interface AttackItemData {
    skill?: string|null;
    attribute1?: string|null;
    attribute2?: string|null;
    skillValue?: number | null;
    minAttributes?: string|null;
    skillMod?: number|null;
    damageLevel?: number|null;
    range?: number|null;
    features?: string|null;
    damage?: string|null;
    weaponSpeed?: number|null;
    damageType?: string|null;
    costType?: string|null;
}

const attributeMapper = initMapper(splittermond.attributes)
    .withTranslator(a => `splittermond.attribute.${a}.long`)
    .andOtherMappers(a => `splittermond.attribute.${a}.short`)
    .build();

declare const game: any;
declare function duplicate<T extends object>(obj: T): T;

export default class Attack {
    private readonly isSecondaryAttack: boolean;
    private readonly item: AttackItem

    private readonly id: string;
    public readonly img: string;
    public readonly name: string;
    public readonly skill: Skill;
    public readonly range: number;
    public readonly features: string;
    private readonly _damage: string;
    private readonly _weaponSpeed: number;
    private readonly editable: boolean;
    private readonly deletable: boolean;

    /**
     *
     * @param  actor Actor-Object of attack
     * @param  item Corresponding item for attack
     * @param  secondaryAttack Generate secondary attack of item
     */
    constructor(private readonly actor: SplittermondActor, item: AttackItem, secondaryAttack = false) {
        this.item = item;
        this.isSecondaryAttack = secondaryAttack;
        const attackData = secondaryAttack && item.system.secondaryAttack ?
            item.system.secondaryAttack : item.system;


        let minAttributeMalus = 0;
        (attackData.minAttributes || "").split(",").forEach(aStr => {
            let temp = aStr.match(/([^ ]+)\s+([0-9]+)/);
            if (temp) {
                let attr = attributeMapper().toCode(temp[1]);
                if (attr) {
                    let diff = parseInt(this.actor.attributes[attr].value) - parseInt(temp[2] || "0");
                    if (diff < 0) {
                        minAttributeMalus += diff;
                    }
                }
            }
        });


        this.id = !this.isSecondaryAttack ? this.item.id : `${this.item.id}_secondary`;
        this.img = this.item.img;
        this.name = !this.isSecondaryAttack ? this.item.name : `${this.item.name} (${game.i18n.localize(`splittermond.skillLabel.${attackData.skill}`)})`;
        this.skill = new Skill(this.actor, (attackData.skill || this.name), (attackData.attribute1 || ""), (attackData.attribute2 || ""), attackData.skillValue ?? null);
        this.skill.addModifierPath(`skill.${this.id}`);

        if (minAttributeMalus) {
            this.actor.modifier.add(
                `skill.${this.id}`,
                {
                    name: foundryApi.localize("splittermond.minAttributes"),
                    type: "innate",
                },
                of(minAttributeMalus),
                this
            );
            this.actor.modifier.add("weaponspeed",
                {
                    item: this.id,
                    name: foundryApi.localize("splittermond.minAttributes"),
                    type: "innate",
                },
                of(minAttributeMalus),
                this
            );
        }

        if (attackData.skillMod) {
            this.actor.modifier.add(
                `skill.${this.id}`,
                {
                    name: foundryApi.localize("splittermond.skillMod"),
                    type: "innate",
                },
                of(attackData.skillMod),
                this
            );
        }

        if ((this.item?.system?.damageLevel || 0) > 2) {
            this.actor.modifier.add(
                `skill.${this.id}`,
                {
                    name: foundryApi.localize("splittermond.damageLevel"),
                    type: "innate"
                },
                of(-3),
                this
            );
        }

        this.range = attackData.range || 0;
        this.features = attackData.features || "";
        this._damage = attackData.damage || "1W6+1";
        this._weaponSpeed = attackData.weaponSpeed || 7;
        this.editable = ["weapon", "shield", "npcattack"].includes(this.item.type);
        this.deletable = ["npcattack"].includes(this.item.type);
    }

    toObject() {
        return {
            id: this.id,
            img: this.img,
            name: this.name,
            skill: this.skill.toObject(),
            range: this.range,
            features: this.features,
            damage: this.damage,
            damageType: this.damageType,
            costType: this.costType,
            weaponSpeed: this.weaponSpeed,
            editable: this.editable,
            deletable: this.deletable,
            isPrepared: this.isPrepared,
            featureList: this.featureList
        }
    }


    get damage() {
        let damage = this._damage;
        let mod = this.actor.modifier.getForId("damage").notSelectable()
            .withAttributeValuesOrAbsent("item", this.item.name).getModifiers().value;
        if (this.actor.items.find(i => i.type == "mastery" && (i.system as MasteryDataModel).skill == this.skill.id && i.name.toLowerCase() == "improvisation") && this.features.toLowerCase().includes("improvisiert")) {
            mod += 2;
        }
        if (mod != 0)
            damage += (mod < 0 ? "" : "+") + mod;
        return damage;
    }

    get damageType() {
        return this.item.system.damageType
    }

    get costType() {
        return this.item.system.costType;
    }

    get weaponSpeed() {
        let weaponSpeed = this._weaponSpeed;
        weaponSpeed -= this.actor.modifier.getForId("weaponspeed")
            .withAttributeValuesOrAbsent("item", this.item.id, this.item.name).getModifiers().value;
        if (this.actor.items.find(i => i.type == "mastery" && i.name.toLowerCase() == "improvisation") && this.features.toLowerCase().includes("improvisiert")) {
            weaponSpeed -= 2;
        }
        if (["melee", "slashing", "chains", "blades", "staffs"].includes(this.skill.id))
            weaponSpeed += parseInt(this.actor.tickMalus);
        return weaponSpeed;
    }

    get isPrepared() {
        return ["longrange", "throwing"].includes(this.skill.id) ? this.actor.getFlag("splittermond", "preparedAttack") == this.id : true;
    }

    get featureList() {
        return this.features?.split(",")?.map(str => str.trim());
    }

    async roll(options: Record<string, any> = {}) {
        if (!this.actor) return false;

        const attackRollOptions = {
            ...duplicate(options),
            type: "attack",
            title:null,
            subtitle: this.item.name,
            difficulty: "VTD",
            preSelectedModifier: [this.item.name],
            modifier: 0,
            checkMessageData: {
                weapon: this.toObject()
            }
        };
        return this.skill.roll(attackRollOptions);
    }


}