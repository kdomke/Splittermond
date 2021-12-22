import SplittermondActor from "./module/actor/actor.js";
import SplittermondItem from "./module/item/item.js";
import SplittermondCharacterSheet from "./module/actor/sheets/character-sheet.js";
import SplittermondNPCSheet from "./module/actor/sheets/npc-sheet.js";
import SplittermondItemSheet from "./module/item/sheets/item-sheet.js";
import ApplyDamageDialog from "./module/apps/dialog/apply-damage-dialog.js";
import { splittermond } from "./module/config.js";
import * as Dice from "./module/util/dice.js"
import * as Macros from "./module/util/macros.js"
import SplittermondCombat from "./module/combat/combat.js";
import SplittermondCombatTracker from "./module/apps/sidebar/combat-tracker.js";
import ItemImporter from "./module/util/item-importer.js";
import SplittermondCompendiumBrowser from "./module/apps/compendium-browser.js";
import { registerSystemSettings } from "./module/settings.js";
import TickBarHud from "./module/apps/tick-bar-hud.js";


$.fn.closestData = function (dataName, defaultValue = "") {
    let value = this.closest(`[data-${dataName}]`)?.data(dataName);
    return (value) ? value : defaultValue;
}

function handlePdf(links) {
    if(!ui.PDFoundry){
        ui.notifications.warn(game.i18n.localize("splittermond.pdfoundry.notinstalled"))
        return
    }

    links.split(',').forEach(link => {
        let t = link.trim();
        let i = t.indexOf(':');
        let book = '';
        let page = 0;

        if (i > 0) {
            book = t.substring(0, i).trim();
            page = parseInt(t.substring(i + 1));
        } else {
            book = t.replace(/[0-9]*/g, '').trim()
            page = parseInt(t.replace(/[a-zA-Z]*/g, ''))
        }

        const pdf = ui.PDFoundry.findPDFDataByCode(book)
        if (pdf) {
            ui.PDFoundry.openPDF(pdf, {page})
        } else {
            ui.notifications.warn(game.i18n.localize("splittermond.pdfoundry.notfound"))
        }
});
};

Hooks.once("ready", function () {
    game.splittermond.tickBarHud = new TickBarHud();
});

Hooks.once("init", function () {
    console.log("Splittermond | Initialising Splittermond System ...");
    CONFIG.Actor.documentClass = SplittermondActor;
    CONFIG.Item.documentClass = SplittermondItem;
    CONFIG.Combat.documentClass = SplittermondCombat;
    CONFIG.ui.combat = SplittermondCombatTracker;
    CONFIG.splittermond = splittermond;

    registerSystemSettings();

    game.splittermond = {
        skillCheck: Macros.skillCheck,
        attackCheck: Macros.attackCheck,
        itemCheck: Macros.itemCheck,
        requestSkillCheck: Macros.requestSkillCheck,
        importNpc: Macros.importNpc,
        magicFumble: Macros.magicFumble,
        attackFumble: Macros.attackFumble,
        heroLevel: CONFIG.splittermond.heroLevel.map(function (x) { return x * game.settings.get("splittermond", "HGMultiplier") }),
        compendiumBrowser: new SplittermondCompendiumBrowser()
    }
    Die.MODIFIERS.ri = Dice.riskModifier;

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("splittermond", SplittermondCharacterSheet, {
        types: ["character"],
        makeDefault: true,
        label: "splittermond.character"
    });

    Actors.registerSheet("splittermond", SplittermondNPCSheet, {
        types: ["npc"],
        makeDefault: true,
        label: "splittermond.npc"
    });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("splittermond", SplittermondItemSheet, {
        makeDefault: true
    });

    const templateBasePath = "systems/splittermond/templates"

    loadTemplates([
        // Actor Partials
        `${templateBasePath}/sheets/actor/parts/attribute-input.hbs`,
        `${templateBasePath}/sheets/actor/parts/derived-attributes.hbs`,
        `${templateBasePath}/sheets/actor/parts/focus-health.hbs`,
        `${templateBasePath}/sheets/actor/parts/mastery-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/spells-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/combat-actions.hbs`,
        `${templateBasePath}/sheets/actor/parts/inventory-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/status-tab.hbs`
    ]);

    Handlebars.registerHelper('times', function (n, block) {
        var accum = '';
        for (var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });

    document.addEventListener('paste', (e) => ItemImporter.pasteEventhandler(e), false);


    console.log("Splittermond | DONE!");
});

Hooks.on("hotbarDrop", async (bar, data, slot) => {
    let macroData = {
        name: "",
        type: "script",
        img: "icons/svg/dice-target.svg",
        command: ""
    };

    if (data.type === "skill") {
        macroData.name = game.i18n.localize(`splittermond.skillLabel.${data.skill}`);
        macroData.command = `game.splittermond.skillCheck("${data.skill}")`;
    };

    if (data.type === "attack") {
        let actorId = data.actorId || "";
        let actor = game.actors.get(actorId);
        if (!actor) return;
        const attack = actor.data.data.attacks.find(a => a._id === data.attackId);
        if (!attack) return;

        macroData.name = attack.name;
        macroData.img = attack.img;



        if (game.user.isGM) {
            macroData.name += ` (${actor.data.name})`;
        }

        macroData.command = `game.splittermond.attackCheck("${actorId}","${data.attackId}")`;

    };

    if (data.type === "Item") {
        if (data.id) {
            data.data = game.items.get(data.id).data;
        }
        if (data.data) {
            macroData.name = data.data.name;
            macroData.img = data.data.img;

            let actorId = data.actorId || "";

            if (actorId && game.user.isGM) {
                const actorName = game.actors.get(actorId)?.data.name;
                macroData.name += ` (${actorName})`;
            }

            macroData.command = `game.splittermond.itemCheck("${data.data.type}","${data.data.name}","${actorId}","${data.data._id}")`;

        }
    };


    if (macroData.command != "" && macroData.name != "") {
        let macro = await Macro.create(macroData, { displaySheet: false });

        game.user.assignHotbarMacro(macro, slot);
    }



});

Hooks.on('preCreateActor', (actor) => {
    if (actor.type === 'character') {
        actor.data.token.vision = true;
        actor.data.token.actorLink = true;
        actor.data.token.name = actor.name;
    }
});

Hooks.on('ready', function (content, { secrets = false, entities = true, links = true, rolls = true, rollData = null } = {}) {
    // Patch enrichHTML function for Custom Links
    const oldEnrich = TextEditor.enrichHTML;
    TextEditor.enrichHTML = function (content, { secrets = false, entities = true, links = true, rolls = true, rollData = null } = {}) {
        content = oldEnrich.apply(this, [content, { secrets: secrets, entities: entities, links: links, rolls: rolls, rollData: rollData }]);

        content = content.replace(/@SkillCheck\[([^\]]+)\](?:\{([^}]*)\})?/g, (match, options, label) => {
            if (!label) {
                label = options;
            }
            let parsedString = /(.+)\s*(>|gegen|gg\.)\s*([0-9]*)|(.+)/.exec(options);
            let skill = "";
            let difficulty = 0;
            if (parsedString) {
                let skillLabel = parsedString[0].trim().toLowerCase();
                if (parsedString[3]) {
                    skillLabel = parsedString[1].trim().toLowerCase();
                    difficulty = parseInt(parsedString[3]);
                }
                skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].find((skill) => skill === skillLabel || game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase() === skillLabel);
            }
            if (skill) {
                return `<a class="rollable" data-roll-type="skill" data-skill="${skill}" data-difficulty="${difficulty}"><i class="fas fa-dice"></i> ${label}</a>`
            } else {
                return match;
            }
            
        });

        content = content.replace(/@RequestSkillCheck\[([^\]]+)\](?:\{([^}]*)\})?/g, (match, options, label) => {
            if (!label) {
                label = options;
            }
            let parsedString = /(.+)\s*(>|gegen|gg\.)\s*([0-9]*)|(.+)/.exec(options);
            let skill = "";
            let difficulty = 0;
            if (parsedString) {
                let skillLabel = parsedString[0].trim().toLowerCase();
                if (parsedString[3]) {
                    skillLabel = parsedString[1].trim().toLowerCase();
                    difficulty = parseInt(parsedString[3]);
                }
                skill = [...CONFIG.splittermond.skillGroups.general, ...CONFIG.splittermond.skillGroups.magic].find((skill) => skill === skillLabel || game.i18n.localize(`splittermond.skillLabel.${skill}`).toLowerCase() === skillLabel);
            }
            if (skill) {
                return `<a class="request-skill-check" data-skill="${skill}" data-difficulty="${difficulty}"><i class="fas fa-comment"></i> ${label}</a>`
            } else {
                return match;
            }
            
        });

        content = content.replace(/@Ticks\[([^\]]+)\](?:\{([^}]*)\})?/g, (match, options, label) => {
            
            let parsedString = options.split(",");
            let ticks = parsedString[0];
            let message = "";

            if (!label) {
                label = ticks;
            }
            
            if (parsedString[1]) {
                message = parsedString[1];
            }

            return `<a class="add-tick" data-ticks="${ticks}" data-message="${message}"><i class="fas fa-stopwatch"></i> ${label}</a>`
        });

        content = content.replace(/@PdfLink\[([^\]]+)\](?:\{([^}]*)\})?/g, ( match, options, label) => {
            
            let parsedString = options.split(",");
            let pdfcode = parsedString[0];
            let pdfpage = parsedString[1];
            
            if (!label) {
                label = `${pdfcode} ` + game.i18n.localize(`splittermond.pdfoundry.page`) + ` ${pdfpage}`;
            }

            return `<a class="pdflink" data-pdfcode="${pdfcode}" data-pdfpage="${pdfpage}"><i class="fas fa-file-pdf"></i> ${label}</a>`;


        });

        return content;
    };
})

function commonEventHandler(app, html, data) {
    
    html.find(".rollable").click(event => {
        
        const type = $(event.currentTarget).closestData("roll-type");
        if (type === "skill") {
            event.preventDefault();
            event.stopPropagation()
            const difficulty = $(event.currentTarget).closestData("difficulty");
            const skill = $(event.currentTarget).closestData("skill");
            Macros.skillCheck(skill, {difficulty: difficulty});
        }

    });

    html.find(".request-skill-check").click(event => {
        event.preventDefault();
        event.stopPropagation()
        const type = $(event.currentTarget).closestData("roll-type");

        const difficulty = $(event.currentTarget).closestData("difficulty");
        const skill = $(event.currentTarget).closestData("skill");

        Macros.requestSkillCheck(skill,difficulty);

    });

    html.find(".pdflink").click(event => {
        event.preventDefault();
        event.stopPropagation();

        let pdfcode = $(event.currentTarget).closestData("pdfcode");
        let pdfpage = $(event.currentTarget).closestData("pdfpage");

        let pdfcodelink = pdfcode + pdfpage;

        handlePdf(pdfcodelink);
    });

}

Hooks.on('renderJournalSheet',  function (app, html, data) {
    commonEventHandler(app, html, data);

    html.find(".add-tick").click(event => {
        event.preventDefault();
        event.stopPropagation()
        let value = $(event.currentTarget).closestData("ticks");
        let message = $(event.currentTarget).closestData("message");
        let chatMessageId = $(event.currentTarget).closestData("message-id");
        
        const speaker = ChatMessage.getSpeaker();
        let actor;
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
        if (!actor) {
            ui.notifications.info(game.i18n.localize("splittermond.pleaseSelectAToken"));
            return
        };
        
        actor.addTicks(value, message);
    })

});

Hooks.on('renderChatMessage', function (app, html, data) {
    let actor = game.actors.get(data.message.speaker.actor);

    if (!game.user.isGM) {
        html.find(".gm-only").remove();
    }

    if (!((actor && actor.isOwner) || game.user.isGM || (data.author.id === game.user.id))) {
        html.find(".actions button").not(".active-defense").remove();
    }

    
    html.find(".actions").not(":has(button)").remove();

    commonEventHandler(app, html, data)

    html.find(".rollable").click(event => {
        
        const type = $(event.currentTarget).closestData("roll-type");

        if (type === "damage") {
            const damage = $(event.currentTarget).closestData("damage");
            const features = $(event.currentTarget).closestData("features");
            const source = $(event.currentTarget).closestData("source");
            Dice.damage(damage, features, source);
        }

        if (type === "magicFumble") {
            event.preventDefault();
            event.stopPropagation()
            const eg = $(event.currentTarget).closestData("success");
            const costs = $(event.currentTarget).closestData("costs");

            actor.rollMagicFumble(eg,costs);
        }

        if (type === "attackFumble") {
           event.preventDefault();
           actor.rollAttackFumble();
        }
    });

    html.find(".consume").click(event => {
        
        const type = $(event.currentTarget).closestData('type');
        const value = $(event.currentTarget).closestData('value');
        if (type === "focus") {
            event.preventDefault();
            event.stopPropagation()
            const description = $(event.currentTarget).closestData('description');
            actor.consumeCost(type, value, description);
        }

        if (type === "health") {
            event.preventDefault();
            event.stopPropagation()
            const description = $(event.currentTarget).closestData('description');
            actor.consumeCost(type, value, description);
        }
    })
    

    html.find(".add-tick").click(event => {
        event.preventDefault();
        event.stopPropagation()
        let value = $(event.currentTarget).closestData("ticks");
        let message = $(event.currentTarget).closestData("message");
        let chatMessageId = $(event.currentTarget).closestData("message-id");
        
        const speaker = game.messages.get(chatMessageId).data.speaker;
        let actor;
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
        
        actor.addTicks(value, message);
    });

    html.find(".apply-damage").click(event => {
        event.preventDefault();
        event.stopPropagation()
        let value = $(event.currentTarget).closestData("damage");
        let type = $(event.currentTarget).closestData("type");
        let source = $(event.currentTarget).closestData("source");
        ApplyDamageDialog.create(value,type, source);
    });

    html.find(".active-defense").click(event => {
        event.preventDefault();
        event.stopPropagation()
        let type = $(event.currentTarget).closestData("type");
        
        const speaker = ChatMessage.getSpeaker();
        let actor;
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);
        if (!actor) {
            ui.notifications.info(game.i18n.localize("splittermond.pleaseSelectAToken"));
            return
        };

        actor.activeDefenseDialog(type);
    });

    html.find(".fumble-table-result").click(event => {
        html.find(".fumble-table-result-item").not(".fumble-table-result-item-active").toggle(200);
    });


});

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
    const compendiumBrowserButton = $(`<button><i class="fas fa-university"></i>${game.i18n.localize("splittermond.compendiumBrowser")}</button>`).click(() => { game.splittermond.compendiumBrowser.render(true) });
    html.find(".header-actions").append(compendiumBrowserButton);
})
