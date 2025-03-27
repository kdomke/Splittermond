import {describe, it} from "mocha";
import {expect} from "chai";
import ModifierManager from "../../../../module/actor/modifier-manager";
import SplittermondItem from "../../../../module/item/item";
import {of} from "../../../../module/actor/modifiers/expressions/definitions";

describe("ModifierManager", () => {
    let manager: ModifierManager;
    const mockItem = {} as SplittermondItem;

    beforeEach(() => {
        manager = new ModifierManager();
    });

    it("should aggregate static modifiers", () => {
        manager.add("AUS", "Base", of(2));
        manager.add("AUS", "Item Bonus", of(1), mockItem);
        manager.add("bonuscap", "Cap", of(3), null, "", true);

        expect(manager.value("AUS")).to.equal(3);
        expect(manager.value("bonuscap")).to.equal(0);
    });

    it("should handle selectable modifiers", () => {
        manager.add("speed.multiplier", "Boots", of(2), null, "equipment", true);
        manager.add("speed.multiplier", "Haste", of(1), null, "magic", true);

        const result = manager.selectable("speed.multiplier");
        expect(result).to.deep.equal({ "Boots": of(2), "Haste": of(1) });
    });

    it("should merge multiple paths", () => {
        manager.add("damage.physical", "Sword", of(3));
        manager.add("damage.fire", "Enchantment", of(2));

        const result = manager.static(["damage.physical", "damage.fire"]);
        expect(result.length).to.equal(2);
        expect(result[0].value).to.deep.equal(of(3));
    });

    it("should handle empty groups", () => {
        expect(manager.value("nonexistent")).to.equal(0);
        expect(manager.selectable("missing")).to.deep.equal({});
    });

    it("should combine modifiers with same groupId", () => {
        manager.add("melee", "Spell", of(1));
        manager.add("melee", "Trait", of(2));

        expect(manager.value("melee")).to.equal(3);
    });
});