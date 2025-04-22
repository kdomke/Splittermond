import Skill from "./skill.js";
import {of} from "./modifiers/expressions/scalar";
import {foundryApi} from "../api/foundryApi.js";
import SplittermondActor from "./actor";
import {splittermond} from "../config";
import {initMapper} from "../util/LanguageMapper";
import {MasteryDataModel} from "../item/dataModel/MasteryDataModel";

type Options<T extends object> = { [K in keyof T]+?: T[K]| null | undefined };
interface AttackItem {
    id: string;
    img: string;
    name: string;
    type: string;
    system: Options<AttackItemData> & { secondaryAttack?: Options<AttackItemData> };
}

interface AttackItemData {
    skill: string;
    attribute1: string;
    attribute2: string;
    skillValue: number;
    minAttributes: string;
    skillMod: number;
    damageLevel: number;
    range: number;
    features: string;
    damage: string;
    weaponSpeed: number;
    damageType: string;
    costType: string;
}

function withDefaults(data: Options<AttackItemData>): AttackItemData {
    return {
        //@formatter:off
        get skill() {return data.skill ?? ""},
        get attribute1() {return data.attribute1 ?? ""},
        get attribute2(){ return data.attribute2 ?? ""},
        get skillValue() { return data.skillValue ?? 0},
        get minAttributes() {return data.minAttributes ?? ""},
        get skillMod() {return data.skillMod ?? 0},
        get damageLevel() {return data.damageLevel ?? 0},
        get range() {return data.range ?? 0},
        get features() {return data.features ?? ""},
        get damage() {return data.damage ?? "1W6+1"},
        get weaponSpeed() {return data.weaponSpeed ?? 7},
        get damageType() {return data.damageType ?? "physical"},
        get costType() {return data.costType ?? "V"},
        //@formatter:on
    };
}


const attributeMapper = initMapper(splittermond.attributes)
    .withTranslator(a => `splittermond.attribute.${a}.long`)
    .andOtherMappers(a => `splittermond.attribute.${a}.short`)
    .build();

declare function duplicate<T extends object>(obj: T): T;

export default class Attack {
    private readonly item: AttackItem;
    private readonly isSecondaryAttack: boolean;
    private readonly attackData: AttackItemData;

    private readonly id: string;
    public readonly img: string;
    public readonly name: string;
    public readonly skill: Skill;
    private readonly editable: boolean;
    private readonly deletable: boolean;

    /**
     *
     * @param  actor Actor-Object of attack
     * @param  item Corresponding item for attack
     * @param  secondaryAttack Generate secondary attack of item
     */
    constructor(private readonly actor: SplittermondActor, item: AttackItem, secondaryAttack = false) {
        this.isSecondaryAttack = secondaryAttack;
        this.attackData = withDefaults(secondaryAttack && item.system.secondaryAttack ?
            item.system.secondaryAttack : item.system);

        this.editable = ["weapon", "shield", "npcattack"].includes(item.type);
        this.deletable = ["npcattack"].includes(item.type);
        this.id = !this.isSecondaryAttack ? item.id : `${item.id}_secondary`;
        this.img = item.img;
        this.name = !this.isSecondaryAttack ? item.name : `${item.name} (${foundryApi.localize(`splittermond.skillLabel.${this.attackData.skill}`)})`;
        this.skill = new Skill(this.actor, (this.attackData.skill || this.name), this.attackData.attribute1, this.attackData.attribute2, this.attackData.skillValue);
        this.skill.addModifierPath(`skill.${this.id}`);
        this.item = item


        let minAttributeMalus = 0;
        this.attackData.minAttributes.split(",").forEach(aStr => {
            const attribute = aStr.match(/^\S+(?=\s)/)?.[0]
            const minAttributeValue = parseInt(aStr.match(/([0-9]+)$/)?.[0] ?? "0");
            if (attribute) {
                let attr = attributeMapper().toCode(attribute);
                if (attr) {
                    let diff = parseInt(this.actor.attributes[attr].value) - minAttributeValue;
                    if (diff < 0) {
                        minAttributeMalus += diff;
                    }
                }
            }
        });

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

        //add skill modifier if present AND greater than 0!
        if (this.attackData.skillMod) {
            this.actor.modifier.add(
                `skill.${this.id}`,
                {
                    name: foundryApi.localize("splittermond.skillMod"),
                    type: "innate",
                },
                of(this.attackData.skillMod),
                this
            );
        }

        if (this.attackData.damageLevel > 2) {
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
    }

    get range(){
        return this.attackData.range;
    }

    get features(){
        return this.attackData.features;
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
        let damage = this.attackData.damage;
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
        return this.attackData.damageType
    }

    get costType() {
        return this.attackData.costType;
    }

    get weaponSpeed() {
        let weaponSpeed = this.attackData.weaponSpeed;
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
            title: null,
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