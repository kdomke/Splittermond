import {describe, it} from "mocha";
import {expect} from "chai";
import ModifierManager from "../../../../module/actor/modifier-manager";
import SplittermondItem from "../../../../module/item/item";
import {of} from "module/actor/modifiers/expressions";

describe("ModifierManager", () => {
    let manager: ModifierManager;
    const mockItem = {} as SplittermondItem;

    beforeEach(() => {
        manager = new ModifierManager();
    });

    it("should aggregate static modifiers", () => {
        manager.add("AUS", {name: "Base", type: "innate"}, of(2));
        manager.add("AUS", {name: "Item Bonus", type: "equipment"}, of(1), mockItem);
        manager.add("bonuscap", {name: "Cap", type: "innate"}, of(3), null, true);

        expect(manager.value("AUS")).to.equal(3);
        expect(manager.value("bonuscap")).to.equal(3);
    });

    it("should handle selectable modifiers", () => {
        manager.add("speed.multiplier", {name: "Boots", type: "equipment"}, of(2), null, true);
        manager.add("speed.multiplier", {name: "Haste", type: "magic"}, of(1), null, true);

        const result = manager.selectable("speed.multiplier");
        expect(result).to.deep.equal({"Boots": of(2), "Haste": of(1)});
    });

    it("should merge multiple paths", () => {
        manager.add("damage.physical", {name: "Sword", type: "equipment"}, of(3));
        manager.add("damage.fire", {name: "Enchantment", type: "magic"}, of(2));

        const result = manager.static(["damage.physical", "damage.fire"]);
        expect(result.length).to.equal(2);
        expect(result[0].value).to.deep.equal(of(3));
    });

    it("should handle empty groups", () => {
        expect(manager.getForId("nonexistent").value()).to.equal(0);
        expect(manager.selectable("missing")).to.deep.equal({});
    });

    it("should combine modifiers with same groupId", () => {
        manager.add("melee", {name: "Spell", type: "magic"}, of(1));
        manager.add("melee", {name: "Trait", type: "innate"}, of(2));

        expect(manager.getForId("melee").value()).to.equal(3);
    });

    describe("Selector Build API", () => {
        it("should filter for modifier attributes", () => {
            manager.add("damage", {name: "Sword", type: "equipment"}, of(3));
            manager.add("damage", {name: "Enchantment", type: "magic"}, of(2));

            const result = manager.getForId("damage").withAttributeValues("type", "magic").getModifiers();
            expect(result[0].value).to.deep.equal(of(2));
        });

        it("should cover multiple values in selector", () => {
            manager.add("damage", {name: "Sword", type: "equipment"}, of(3));
            manager.add("damage", {name: "Enchantment", type: "magic"}, of(2));

            const result = manager.getForId("damage").withAttributeValues("type", "magic", "equipment").value();
            expect(result).to.equal(5);
        });

        it("should filter for absent attributes", () => {
            manager.add("damage", {name: "Sword", type: "equipment", damageType: "physical"}, of(3));
            manager.add("damage", {name: "Enchantment", type: "magic"}, of(2));

            const result = manager.getForId("damage").withAttributeValues("damageType", "physical").value();
            expect(result).to.equal(3);
        });

        it("should not filter for absent attributes if set to permissive", () => {
            manager.add("damage", {name: "Sword", type: "equipment", damageType: "physical"}, of(3));
            manager.add("damage", {name: "Enchantment", type: "magic"}, of(2));

            const result = manager.getForId("damage").withAttributeValuesOrAbsent("damageType", "physical").value();
            expect(result).to.equal(5);
        });

        it("should filter attributes for selectable modifiers", () => {
            manager.add("melee", {name: "Talent", type: "innate"}, of(4), null, false);
            manager.add("melee", {name: "Hellebarde", type: "innate"}, of(1), null, true);

            const result = manager.getForId("melee").selectable().getModifiers();
            expect(result[0].value).to.deep.equal(of(1));
            expect(result[0].attributes.name).to.equal("Hellebarde");
        });

        it("should filter attributes for non-selectable modifiers", () => {
            manager.add("melee", {name: "Talent", type: "innate"}, of(4), null, false);
            manager.add("melee", {name: "Hellebarde", type: "innate"}, of(1), null, true);

            const result = manager.getForId("melee").notSelectable().getModifiers();
            expect(result[0].value).to.deep.equal(of(4));
            expect(result[0].attributes.name).to.equal("Talent");
        });

        it("should find several group ids at once", () => {
            manager.add("AUS", {name: "Base", type: "innate"}, of(2), null, false);
            manager.add("bonuscap", {name: "Cap", type: "innate"}, of(3), null, false);

            const result = manager.getForIds("AUS", "bonuscap").getModifiers();

            expect(result.length).to.equal(2);
            expect(result[0].value).to.deep.equal(of(2));
            expect(result[0].attributes.name).to.deep.equal("Base");
            expect(result[1].value).to.deep.equal(of(3));
            expect(result[1].attributes.name).to.deep.equal("Cap");
        });

        it("should deliver the value of several group ids at once", () => {
            manager.add("AUS", {name: "Base", type: "innate"}, of(2), null, false);
            manager.add("bonuscap", {name: "Cap", type: "innate"}, of(3), null, false);

            const result = manager.getForIds("AUS", "bonuscap").value();

            expect(result).to.deep.equal(5);
        });

        it("should filter mass group search for non-selectable items", () => {

            manager.add("AUS", {name: "Base", type: "innate"}, of(2), null, false);
            manager.add("bonuscap", {name: "Cap", type: "innate"}, of(3), null, false);
            manager.add("AUS", {name: "MaybeBase", type: "innate"}, of(2), null, true);
            manager.add("bonuscap", {name: "MaybeCap", type: "innate"}, of(3), null, true);

            const result = manager.getForIds("AUS", "bonuscap").notSelectable().getModifiers();

            expect(result.length).to.equal(2);
            expect(result[0].attributes.name).to.deep.equal("Base");
            expect(result[1].attributes.name).to.deep.equal("Cap");
        });
    });

    it("should filter mass group search for non-selectable items", () => {

        manager.add("AUS", {name: "Base", type: "innate"}, of(2), null, false);
        manager.add("bonuscap", {name: "Cap", type: "innate"}, of(3), null, false);
        manager.add("AUS", {name: "MaybeBase", type: "innate"}, of(2), null, true);
        manager.add("bonuscap", {name: "MaybeCap", type: "innate"}, of(3), null, true);

        const result = manager.getForIds("AUS", "bonuscap").selectable().getModifiers();

        expect(result.length).to.equal(2);
        expect(result[0].attributes.name).to.deep.equal("MaybeBase");
        expect(result[1].attributes.name).to.deep.equal("MaybeCap");
    });
});