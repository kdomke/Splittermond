import SplittermondActor from "./module/actor/actor.js";
import SplittermondItem from "./module/item/item.js";
import SplittermondCharacterSheet from "./module/actor/sheets/character-sheet.js";
import SplittermondNPCSheet from "./module/actor/sheets/npc-sheet.js";
import SplittermondItemSheet from "./module/item/sheets/item-sheet.js";
import { splittermond } from "./module/config.js";
import * as Dice from "./module/util/dice.js"
import * as Macros from "./module/util/macros.js"
import SplittermondCombat from "./module/combat/combat.js";
import SplittermondCombatTracker from "./module/apps/sidebar/combat-tracker.js";
import ItemImporter from "./module/util/item-importer.js";
import { registerSystemSettings } from "./module/settings.js";


$.fn.closestData = function (dataName, defaultValue = "") {
    let value = this.closest(`[data-${dataName}]`)?.data(dataName);
    return (value) ? value : defaultValue;
}

Hooks.once("init", function () {
    console.log("Splittermond | Initialising Splittermond System ...");
    CONFIG.Actor.entityClass = SplittermondActor;
    CONFIG.Item.entityClass = SplittermondItem;
    CONFIG.Combat.entityClass = SplittermondCombat;
    CONFIG.ui.combat = SplittermondCombatTracker;
    CONFIG.splittermond = splittermond;

    registerSystemSettings();

    game.splittermond = {
        skillCheck: Macros.skillCheck,
        attackCheck: Macros.attackCheck,
        itemCheck: Macros.itemCheck,
        requestSkillCheck: Macros.requestSkillCheck,
        importNpc: Macros.importNpc,
        magicFumble: Macros.magicFumble
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
        actor.token = {
            vision: true,
            actorLink: true,
            name: actor.name
        };
    }
});

Hooks.on('ready', function (content, { secrets = false, entities = true, links = true, rolls = true, rollData = null } = {}) {
    // Patch enrichHTML function for Custom Links
    const oldEnrich = TextEditor.enrichHTML;
    TextEditor.enrichHTML = function (content, { secrets = false, entities = true, links = true, rolls = true, rollData = null } = {}) {
        content = oldEnrich.apply(this, [content, { secrets: secrets, entities: entities, links: links, rolls: rolls, rollData: rollData }]);

        content = content.replace(/@Damage\[([0-9VK]+)\](?:\{([^}]*)\})?/, (match, damage, label) => {
            return `<a class="rollable" data-roll-type="damage" data-damage="${damage}" data-features=""><i class="fas fa-heart-broken"></i> ${label}</a>`
        })

        return content;
    };
})

Hooks.on('renderChatMessage', function (app, html, data) {
    html.find(".rollable").click(event => {
        const type = $(event.currentTarget).closestData("roll-type");

        if (type === "damage") {
            const damage = $(event.currentTarget).closestData("damage");
            const features = $(event.currentTarget).closestData("features");
            Dice.damage(damage, features);
        }

        if (type === "magicFumble") {
            const eg = $(event.currentTarget).closestData("success");
            const costs = $(event.currentTarget).closestData("costs");
            Macros.magicFumble(eg, costs);
        }

        if (type === "attackFumble") {
            const table = game.tables.find(t => t.name === "Patzertabelle Kampf");
            if (table) {
                table.draw();
            } else {
                ui.notifications.error("Bitte importiere zuerst die Würfeltabelle 'Patzertabelle Kampf'!");
            }

        }

    });

    html.find(".add-tick").click(event => {
        let value = $(event.currentTarget).closestData("ticks");
        let message = $(event.currentTarget).closestData("message");
        let chatMessageId = $(event.currentTarget).closestData("message-id");

        const speaker = game.messages.get(chatMessageId).data.speaker;
        let actor;
        if (speaker.token) actor = game.actors.tokens[speaker.token];
        if (!actor) actor = game.actors.get(speaker.actor);

        actor.addTicks(value, message);
    });

});