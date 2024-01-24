import {identity} from "../../../foundryMocks.js"; //also declares core foundry objects globally
import {expect} from 'chai';
import {createHtml} from "../../../../handlebarHarness.js";
import {produceJQuery} from "../../../../jQueryHarness.js";
import SplittermondSpellSheet from "../../../../../module/item/sheets/spell-sheet.js";
import SplittermondSpellItem from "../../../../../module/item/spell.js";
import {newSpellAvailabilityParser} from "../../../../../module/item/availabilityParser.js";


describe("Spell Properties display", () => {
    const testParser = newSpellAvailabilityParser({localize: (str) => str}, ["illusionmagic", "deathmagic"]);
    global.ItemSheet.prototype.getData = function () {
        return {data: this.item};
    };
    global.ItemSheet.prototype.activateListeners = () => {};
    global.duplicate = (obj) => obj;

    it("displays the availableIn property of the spell item", () => {
        const availableInDisplayConfig = {
            field: "system.availableIn",
            placeholderText: "splittermond.availableInPlaceholder",
            label: "splittermond.availableIn",
            template: "input"
        };
        const spellItem = new SplittermondSpellItem({}, {splittermond: {ready: true}}, testParser);
        spellItem.system = {availableIn: "deathmagic 1"};
        spellItem.type = "spell";

        const renderedInput = renderRelevantInput(availableInDisplayConfig, spellItem);
        expect(renderedInput.val()).to.equal(spellItem.system.availableIn);
    });

    it("displays a placeholder if no availableIn property is set", () => {

        const availableInDisplayConfig = {
            field: "system.availableIn",
            placeholderText: "splittermond.availableInPlaceholder",
            label: "splittermond.availableIn",
            template: "input"
        };
        const spellItem = new SplittermondSpellItem({}, {splittermond: {ready: true}}, testParser);
        spellItem.system = {availableIn: ""};
        spellItem.type = "spell";

        const renderedInput = renderRelevantInput(availableInDisplayConfig, spellItem);

        expect(renderedInput.prop("placeholder")).to.equal(availableInDisplayConfig.placeholderText);
        expect(renderedInput.val()).to.equal(spellItem.system.availableIn);
    });

    it("renders the availableIn label as placeholder if no placeholderText is set", () => {
        const availableInDisplayConfig = {
            field: "system.availableIn",
            label: "splittermond.availableIn",
            template: "input"
        };
        const spellItem = new SplittermondSpellItem({}, {splittermond: {ready: true}}, testParser);
        spellItem.system = {availableIn: ""};
        spellItem.type = "spell";

        const renderedInput = renderRelevantInput(availableInDisplayConfig, spellItem);

        expect(renderedInput.prop("placeholder")).to.equal(availableInDisplayConfig.label);
        expect(renderedInput.val()).to.equal(spellItem.system.availableIn);
    });

    function renderRelevantInput(displayProperty, spellItem) {
        const CONFIG = {splittermond: {itemSheetProperties: {}, displayOptions: {itemSheet: {}}}};
        CONFIG.splittermond.displayOptions.itemSheet["default"] = {width: 1, height: 1};
        CONFIG.splittermond.itemSheetProperties.spell = [{
            groupName: "splittermond.generalProperties",
            properties: [displayProperty]
        }];
        const objectUnderTest = new SplittermondSpellSheet(
            spellItem,{},{getProperty:simplePropertyResolver},{localize: identity}, CONFIG.splittermond,{enrichHTML: identity});
        const domUnderTest = produceJQuery(createHtml("./templates/sheets/item/item-sheet.hbs", objectUnderTest.getData()));

        return domUnderTest(`.properties-editor input[name='${displayProperty.field}']`);
    }

    function simplePropertyResolver(a,property){
        let member = a;
        property.split(".").forEach(prop => member = member[prop]);
        return member;
    }
});