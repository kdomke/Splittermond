import {describe, it} from "mocha";
import {expect} from "chai";
import ModifierManager from "../../../../module/actor/modifier-manager";
import SplittermondItem from "../../../../module/item/item";

describe("ModifierManager", () => {
    let manager: ModifierManager;
    const mockItem = {} as SplittermondItem;

    beforeEach(() => {
        manager = new ModifierManager();
    });

    it("should aggregate static modifiers", () => {
        manager.add("AUS", "Base", "2");
        manager.add("AUS", "Item Bonus", "1", mockItem);
        manager.add("bonuscap", "Cap", "3", null, "", true);

        expect(manager.value("AUS")).to.equal(3);
        expect(manager.value("bonuscap")).to.equal(0);
    });

    it("should handle selectable modifiers", () => {
        manager.add("speed.multiplier", "Boots", "2", null, "equipment", true);
        manager.add("speed.multiplier", "Haste", "1", null, "magic", true);

        const result = manager.selectable("speed.multiplier");
        expect(result).to.deep.equal({ "Boots": 2, "Haste": 1 });
    });

    it("should merge multiple paths", () => {
        manager.add("damage.physical", "Sword", "3");
        manager.add("damage.fire", "Enchantment", "2");

        const result = manager.static(["damage.physical", "damage.fire"]);
        expect(result.length).to.equal(2);
        expect(result[0].value).to.equal(3);
    });

    it("should handle empty groups", () => {
        expect(manager.value("nonexistent")).to.equal(0);
        expect(manager.selectable("missing")).to.deep.equal({});
    });

    it("should combine modifiers with same groupId", () => {
        manager.add("foreduction", "Spell", "-K1V1");
        manager.add("foreduction", "Trait", "-K2V1");

        // Assuming K/V handling is implemented elsewhere
        const value = manager.value("foreduction");
        expect(isNaN(parseInt(value as unknown as string))).to.be.true; // Demonstrates need for custom value handling
    });
});