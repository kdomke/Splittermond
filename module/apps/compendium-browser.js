export default class SplittermondCompendiumBrowser extends Application {
    constructor(app) {
        super(app);

        this.allItems = {};

        this.itemType = "spell";

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/splittermond/templates/apps/compendium-browser.hbs",
            classes: ["splittermond", "compendium-browser"],
            tabs: [{ navSelector: ".tabs", contentSelector: "main", initial: "spell" }],
            width: 600,
            top: 70,
            left: 120,
            height: window.innerHeight - 100,
            resizable: true,
            dragDrop: [{ dragSelector: ".list > ol > li" }],
        });
    }

    async getData() {
        const data = super.getData();

        this.allItems = {};
        const packs = game.packs.filter(p => p.entity == "Item")
        let indexes = await Promise.all(packs.map(p => p.getContent()));
        indexes.forEach((index, idx) => {
            index.forEach((item, idx) => {
                let itemData = duplicate(item.data);
                if (!this.allItems[itemData.type]) {
                    this.allItems[itemData.type] = [];
                }
                itemData.compendiumPackage = item.compendium.metadata.package;
                itemData.compendiumId = item.compendium.metadata.package + "." + item.compendium.metadata.name;
                itemData.compendiumLabel = item.compendium.metadata.label;
                this.allItems[itemData.type].push(itemData);
            })
        });

        game.items.forEach((item, idx) => {
            let itemData = duplicate(item.data);
            if (!this.allItems[itemData.type]) {
                this.allItems[itemData.type] = [];
            }
            itemData.compendiumId = "world";
            this.allItems[itemData.type].push(itemData);
        });

        Object.keys(this.allItems).forEach(k => {
            this.allItems[k].sort((a, b) => (a.name < b.name) ? -1 : 1)
        });

        if (this.allItems.spell) {
            this.allItems.spell.forEach(i => {
                let availableIn = i.data.availableIn;
                CONFIG.splittermond.skillGroups.magic.forEach(i => {
                    availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase(), i);
                });
                i.data.availableIn = availableIn;
                i.data.availableInArray = availableIn.split(",").map(i => {
                    let data = i.trim().split(" ");
                    return game.i18n.localize(`splittermond.skillLabel.${data[0].trim()}`) + " " + data[1];
                });
            });
        }

        if (this.allItems.mastery) {
            this.allItems.mastery.forEach(i => {
                let availableIn = i.data.availableIn;
                [...CONFIG.splittermond.skillGroups.magic, ...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.fighting].forEach(i => {
                    availableIn = availableIn.replace(game.i18n.localize(`splittermond.skillLabel.${i}`).toLowerCase(), i);
                });
                i.data.availableIn = availableIn;
                i.data.availableInArray = availableIn.split(",").map(i => {
                    let data = i.trim().split(" ");
                    return game.i18n.localize(`splittermond.skillLabel.${data[0].trim()}`);
                });
            });
        }

        if (this.allItems.weapon) {
            this.allItems.weapon.forEach(i => {
                i.data.skillLabel = game.i18n.localize(`splittermond.skillLabel.${i.data.skill}`);
            });
        }

        data.spellFilter = {
            skills: CONFIG.splittermond.spellSkillsOption
        }

        data.masteryFilter = {
            skills: CONFIG.splittermond.masterySkillsOption
        }

        data.weaponFilter = {
            skills: CONFIG.splittermond.fightingSkillOptions
        }

        delete (data.spellFilter.skills.arcanelore);

        data.spellFilter.skills.none = "splittermond.skillLabel.none";
        data.weaponFilter.skills.none = "splittermond.skillLabel.none";

        data.items = this.allItems;
        return data;
    }

    activateListeners(html) {

        super.activateListeners(html);

        html.find('.list li').click(ev => {
            let itemId = $(ev.currentTarget).closestData('item-id');
            let compendium = $(ev.currentTarget).closestData('compendium');
            if (compendium === "world") {
                let sheet = game.items.get(itemId).sheet;
                sheet = Object.values(ui.windows).find(app => app.id === sheet.id) ?? sheet;
                if (sheet._minimized) return sheet.maximize();
                sheet.render(true);

            } else {
                game.packs.get(compendium).getEntity(itemId).then(e => {
                    let sheet = e.sheet;
                    sheet = Object.values(ui.windows).find(app => app.id === sheet.id) ?? sheet;
                    if (sheet._minimized) return sheet.maximize();
                    sheet.render(true);
                });
            }


        });

        html.on("change", '[data-tab="spell"] input, [data-tab="spell"] select', ev => { this._onSearchFilterSpell(html) });
        this._onSearchFilterSpell(html);

        html.on("change", '[data-tab="mastery"] input, [data-tab="mastery"] select', ev => { this._onSearchFilterMastery(html) });
        this._onSearchFilterMastery(html);

        html.on("change", '[data-tab="weapon"] input, [data-tab="weapon"] select', ev => { this._onSearchFilterWeapon(html) });
        this._onSearchFilterWeapon(html);

    }

    /** @override */
    _canDragStart(selector) {
        const packName = $(selector).closestData('compendium');
        if (packName === "world")
            return true;
        const pack = game.packs.get(packName);

        if (pack.entity === "Item") return true;
        return false;
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
        const packName = $(li).closestData('compendium');
        const pack = game.packs.get(packName);
        if (!pack) {
            event.dataTransfer.setData("text/plain", JSON.stringify({
                type: pack.entity,
                id: li.dataset.itemId
            }));
        } else {
            event.dataTransfer.setData("text/plain", JSON.stringify({
                type: pack.entity,
                pack: pack.collection,
                id: li.dataset.itemId
            }));
        };

    }



    /** @override */
    _onSearchFilterSpell(html) {
        const rgx = new RegExp(RegExp.escape(html.find(`[data-tab="spell"] input[name="search"]`)[0].value), "i");
        let filterSkill = html.find(`[data-tab="spell"] select[name="skill"]`)[0].value;
        let filterWorldItems = html.find(`[data-tab="spell"] input[name="show-world-items"]`)[0].checked;
        let filterSkillLevel = [
            html.find(`[data-tab="spell"] input#skill-level-spell-0`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-1`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-2`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-3`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-4`)[0].checked,
            html.find(`[data-tab="spell"] input#skill-level-spell-5`)[0].checked
        ]

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
            let compendium = $(li).closestData("compendium");

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
                test = test && compendium != "world";
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
        let filterWorldItems = html.find(`[data-tab="mastery"] input[name="show-world-items"]`)[0].checked;
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
            let availableIn = $(li).closestData("available-in");
            let skill = $(li).closestData("skill");
            let skillLevel = $(li).closestData("level");
            let compendium = $(li).closestData("compendium");

            let test = rgx.test(name) && (availableIn.includes(filterSkill) || skill === filterSkill);

            if (test && filterSkillLevel.includes(true)) {
                test = test && filterSkillLevel.reduce((acc, element, idx) => {
                    if (element) {
                        return acc || skillLevel == idx + 1;
                    }
                    return acc;
                }, false);
            }

            if (!filterWorldItems) {
                test = test && compendium != "world";
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
        let filterWorldItems = html.find(`[data-tab="weapon"] input[name="show-world-items"]`)[0].checked;

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
            let compendium = $(li).closestData("compendium");

            let test = (rgx.test(name + " " + features + " " + damage)) && (skill === filterSkill || secondarySkill === filterSkill || filterSkill === "");

            if (!filterWorldItems) {
                test = test && compendium != "world";
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