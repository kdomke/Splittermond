import a from "../../../foundryMocks.js"; //set some global variables pertaining to foundry;
import {expect} from 'chai';
import {produceJQuery} from "../../../../jQueryHarness.js";
import {createHtml} from "../../../../handlebarHarness.js";
import SplittermondCompendiumBrowser from "../../../../../module/apps/compendiumBrowser/compendium-browser.js";

describe('compendium-browser filters spells', async () => {
    const probe = {
        spellFilter: {
            skills: {
                lightmagic: "splittermond.skilllabel.lightmagic",
                shadowmagic: "splittermond.skilllabel.shadowmagic",
                none: "splittermond.skilllabel.none"
            }
        },
        masteryFilter: {skill: {none: "splittermond.skilllabel.none"}},
        weaponFilter: {skill: {none: "splittermond.skilllabel.none"}},
        items: {
            mastery: [],
            weapon: [],
            spell: [
                {
                    availableInList: ["splittermond.skilllabel.lightmagic 1", "splittermond.skilllabel.shadowmagic 3"],
                    spellTypeList: [],
                    sort: 5300000,
                    _id: "1",
                    type: "spell",
                    uuid: "Compendium.world.zauber.Item.1",
                    name: "Licht",
                    system: {
                        availableIn: "lightmagic 1, shadowmagic 3",
                        skill: "lightmagic",
                        skillLevel: 0
                    },
                    compendium: {
                        metadata: {
                            id: "world.zauber",
                            label: "Zauber",
                        }
                    },
                },
                {
                    availableInList: ["splittermond.skilllabel.shadowmagic 3"],
                    spellTypeList: [],
                    name: "Dunkelheit",
                    _id: "2",
                    type: "spell",
                    uuid: "Compendium.world.zauber.Item.2",
                    compendium: {
                        metadata: {
                            id: "world.zauber",
                            label: "Zauber",
                        }
                    },
                    system: {
                        availableIn: "",
                        skill: "shadowmagic",
                        skillLevel: 3
                    }
                },
            ]
        }
    };

    it("should filter all spells if checkbox filter that no spell matches is activated", () => {
            const objectUnderTest = new SplittermondCompendiumBrowser();
            const domUnderTest = produceJQuery(createHtml("./templates/apps/compendium-browser.hbs", probe));
            domUnderTest("*").find(`[data-tab="spell"] input#skill-level-spell-0`).prop("checked", true);
            objectUnderTest.activateListeners(domUnderTest("*"));
            domUnderTest("*").find(`[data-tab="spell"] li.list-item draggable`).each((index,element) => {
                expect(domUnderTest(element).attr("style"), `List item at index ${index} with inner html: ${domUnderTest(element).html()}`)
                    .to.equal("display: none;");
            });
        }
    );
});