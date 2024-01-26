import {initializeDisplayPreparation} from "./itemDisplayPreparation.js";

/**
 * @returns {typeof indexSearchParameters};
 */
export default class SplittermondCompendiumBrowser extends Application {
    constructor(app) {
        super(app);

        /** @type {object} */
        this.allItems = {};
        this.skillsFilter = {};

        this._produceDisplayableItems;
        this.produceDisplayableItems = () => {
            //lazy initialize property, because this class is instantiated at startup and the translations are not loaded at that point
            if (!this._produceDisplayableItems) {
                this._produceDisplayableItems = initializeDisplayPreparation(
                    game.i18n, CONFIG.splittermond.skillGroups.magic, CONFIG.splittermond.skillGroups.all);
            }
            return this._produceDisplayableItems;
        };
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/apps/compendium-browser.hbs",
            classes: ["splittermond", "compendium-browser"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: "main", initial: "spell"}],
            width: 600,
            top: 70,
            left: 120,
            height: window.innerHeight - 100,
            resizable: true,
            dragDrop: [{dragSelector: ".list > ol > li"}],
        });
    }

    async getData() {
        const getDataStart = performance.now();
        const data = super.getData();
        this.allItems = {};
        /**
         * @typedef {{metadata: CompendiumMetadata, index: Promise<ItemIndexEntity[]>}} CompendiumBrowserCompenidumType
         * @type {CompendiumBrowserCompenidumType[]}
         */
        const indizes = game.packs
            .filter(pack => pack.documentName === "Item")
            .map(pack => ({
                    metadata: {id: pack.metadata.id, label: pack.metadata.label},
                    index: pack.getIndex({fields: ["system.availableIn", "system.skill", "system.skillLevel", "system.features", "system.level"]})
                })
            );

        await Promise.all(
            indizes.map(
                /** @param {CompendiumBrowserCompenidumType} compendiumBrowserCompendium*/
                (compendiumBrowserCompendium) => this.produceDisplayableItems()(
                    compendiumBrowserCompendium.metadata,
                    compendiumBrowserCompendium.index,
                    this.allItems
                )
            )
        );


        game.items.forEach((item, idx) => {
            if (!this.allItems[item.type]) {
                this.allItems[item.type] = [];
            }
            this.allItems[item.type].push(item);
        });
        const collecting = performance.now();
        console.debug(`Splittermond|Compendium Browser collecting items took ${collecting - getDataStart} ms`);

        Object.keys(this.allItems).forEach(k => {
            this.allItems[k].sort((a, b) => (a.name < b.name) ? -1 : 1);
        });

        const sorting = performance.now();
        console.debug(`Splittermond|Compendium Browser sorting Items took ${sorting - collecting} ms`);

        data.spellFilter = {
            skills: deepClone(CONFIG.splittermond.spellSkillsOption)
        };

        data.masteryFilter = {
            skills: deepClone(CONFIG.splittermond.masterySkillsOption)
        };

        data.weaponFilter = {
            skills: deepClone(CONFIG.splittermond.fightingSkillOptions)
        };

        const filterCloning = performance.now();
        console.debug(`Splittermond|Compendium Browser cloning Items took ${filterCloning - sorting} ms`);

        delete (data.spellFilter.skills.arcanelore);

        data.spellFilter.skills.none = "splittermond.skillLabel.none";
        data.weaponFilter.skills.none = "splittermond.skillLabel.none";

        data.items = {};
        console.debug(`Splittermond|Compendium Browser  getData took ${performance.now() - getDataStart} ms`);
        for (const key in this.allItems) {
            data.items[key] = [];
            for (const item in this.allItems[key]) {
                data.items[key].push(await this.allItems[key][item]);
            }
        }
        console.debug(`Splittermond|Compendium Browser  getData took ${performance.now() - getDataStart} ms`);
        return data;
    }

    activateListeners(html) {

        super.activateListeners(html);

        html.find('.list li').click(async ev => {
            let itemId = $(ev.currentTarget).closestData('item-id');
            let item = await fromUuid(itemId);
            let sheet = item.sheet;
            sheet = Object.values(ui.windows).find(app => app.id === sheet.id) ?? sheet;
            if (sheet._minimized) return sheet.maximize();
            sheet.render(true);


        });

        html.on("change", '[data-tab="spell"] input, [data-tab="spell"] select', ev => {
            this._onSearchFilterSpell(html)
        });
        this._onSearchFilterSpell(html);

        html.on("change", '[data-tab="mastery"] input, [data-tab="mastery"] select', ev => {
            this._onSearchFilterMastery(html)
        });
        this._onSearchFilterMastery(html);

        html.on("change", '[data-tab="weapon"] input, [data-tab="weapon"] select', ev => {
            this._onSearchFilterWeapon(html)
        });
        this._onSearchFilterWeapon(html);

    }

    /** @override */

    _canDragStart(selector) {
        const itemId = $(selector).closestData('item-id');

        return itemId !== undefined;
    }


    /* -------------------------------------------- */

    /** @override */
    _canDragDrop(selector) {
        return false;
    }

    /* -------------------------------------------- */

    /** @override */
    _onDragStart(event) {

        // Get the Compendium pack
        const li = event.currentTarget;
        event.dataTransfer.setData("text/plain", JSON.stringify({
            type: "Item",
            uuid: li.dataset.itemId
        }));

    }


    /** @override */
    _onSearchFilterSpell(html) {
        const rgx = new RegExp(RegExp.escape(html.find(`[data-tab="spell"] input[name="search"]`)[0].value), "i");
        let filterSkill = html.find(`[data-tab="spell"] select[name="skill"]`)[0].value;
        let filterWorldItems = html.find(`[data-tab="spell"] input[name="show-world-items-spell"]`)[0].checked;
        let filterSkillLevel = [
            html.find(`[data-tab="spell"] input#skill-level-spell-0`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-1`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-2`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-3`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-4`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-5`)[0].checked
        ];

        //let filterSkillLevel = html.find(`[data-tab="spell"] select[name="skill"]`)[0].value;
        if (filterSkill === "none") {
            filterSkill = "";
        }
        let idx = 0;
        for (let li of html.find(`[data-tab="spell"] .list > ol`)[0].children) {
            const name = li.querySelector("label").textContent;
            let availableIn = $(li).closestData("available-in");
            let skill = $(li).closestData("skill");
            let skillLevel = $(li).closestData("skill-level");
            let itemId = $(li).closestData("item-id");
            let test = rgx.test(name) && (availableIn.includes(filterSkill) || skill === filterSkill);

            if (test && filterSkillLevel.includes(true)) {
                test = test && filterSkillLevel.reduce((acc, element, idx) => {
                    if (element) {
                        return acc || (availableIn.includes(filterSkill + " " + idx) || (skill === filterSkill && skillLevel == idx));
                    }
                    return acc;
                }, false);
            }

            if (!filterWorldItems) {
                test = test && itemId.startsWith("Compendium");
            }
            li.style.display = test ? "flex" : "none";

            if (test) {
                idx++;
                if (idx % 2) {
                    $(li).addClass("odd");
                    $(li).removeClass("even");
                } else {
                    $(li).addClass("even");
                    $(li).removeClass("odd");
                }
            }

        }
    }

    _onSearchFilterMastery(html) {
        const rgx = new RegExp(RegExp.escape(html.find(`[data-tab="mastery"] input[name="search"]`)[0].value), "i");
        let filterSkill = html.find(`[data-tab="mastery"] select[name="skill"]`)[0].value;
        let filterWorldItems = html.find(`[data-tab="mastery"] input[name="show-world-items-mastery"]`)[0].checked;
        let filterSkillLevel = [
            html.find(`[data-tab="mastery"] input#skill-level-mastery-1`)[0].checked,
            html.find(`[data-tab="mastery"] input#skill-level-mastery-2`)[0].checked,
            html.find(`[data-tab="mastery"] input#skill-level-mastery-3`)[0].checked,
            html.find(`[data-tab="mastery"] input#skill-level-mastery-4`)[0].checked
        ]

        //let filterSkillLevel = html.find(`[data-tab="spell"] select[name="skill"]`)[0].value;
        if (filterSkill === "none") {
            filterSkill = "";
        }
        let idx = 0;
        for (let li of html.find(`[data-tab="mastery"] .list > ol`)[0].children) {
            const name = li.querySelector("label").textContent;
            let availableIn = $(li).closestData("available-in").split(",").map(s => s.trim());
            let skill = $(li).closestData("skill");
            let skillLevel = $(li).closestData("level");
            let itemId = $(li).closestData("item-id");

            let test = rgx.test(name) && (!filterSkill || availableIn.includes(filterSkill) || skill === filterSkill);

            if (test && filterSkillLevel.includes(true)) {
                test = test && filterSkillLevel.reduce((acc, element, idx) => {
                    if (element) {
                        return acc || skillLevel == idx + 1;
                    }
                    return acc;
                }, false);
            }

            if (!filterWorldItems) {
                test = test && itemId.startsWith("Compendium");
            }
            li.style.display = test ? "flex" : "none";

            if (test) {
                idx++;
                if (idx % 2) {
                    $(li).addClass("odd");
                    $(li).removeClass("even");
                } else {
                    $(li).addClass("even");
                    $(li).removeClass("odd");
                }
            }

        }
    }

    _onSearchFilterWeapon(html) {
        const rgx = new RegExp(RegExp.escape(html.find(`[data-tab="weapon"] input[name="search"]`)[0].value), "i");
        let filterSkill = html.find(`[data-tab="weapon"] select[name="skill"]`)[0].value;
        let filterWorldItems = html.find(`[data-tab="weapon"] input[name="show-world-items-weapon"]`)[0].checked;

        //let filterSkillLevel = html.find(`[data-tab="spell"] select[name="skill"]`)[0].value;
        if (filterSkill === "none") {
            filterSkill = "";
        }
        let idx = 0;
        for (let li of html.find(`[data-tab="weapon"] .list > ol`)[0].children) {
            const name = li.querySelector("label").textContent;
            let skill = $(li).closestData("skill");
            let secondarySkill = $(li).closestData("secondary-skill");
            let features = $(li).closestData("features") + " " + $(li).closestData("secondary-features");
            let damage = $(li).closestData("damage") + $(li).closestData("secondary-damage");
            let itemId = $(li).closestData("item-id");

            let test = (rgx.test(name + " " + features + " " + damage)) && (skill === filterSkill || secondarySkill === filterSkill || filterSkill === "");

            if (!filterWorldItems) {
                test = test && itemId.startsWith("Compendium");
            }
            li.style.display = test ? "flex" : "none";

            if (test) {
                idx++;
                if (idx % 2) {
                    $(li).addClass("odd");
                    $(li).removeClass("even");
                } else {
                    $(li).addClass("even");
                    $(li).removeClass("odd");
                }
            }

        }
    }

    get title() {
        return "Compendium Browser";
    }


}