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

Hooks.once("init", function () {
    console.log("Splittermond | Initialising Splittermond System ...");
    CONFIG.Actor.entityClass = SplittermondActor;
    CONFIG.Item.entityClass = SplittermondItem;
    CONFIG.Combat.entityClass = SplittermondCombat;
    CONFIG.ui.combat = SplittermondCombatTracker;
    CONFIG.splittermond = splittermond;


    game.splittermond = {
        skillCheck: Macros.skillCheck,
        attackCheck: Macros.attackCheck,
        itemCheck: Macros.itemCheck,
        requestSkillCheck: Macros.requestSkillCheck
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
        `${templateBasePath}/sheets/actor/parts/focus-health.hbs`,
        `${templateBasePath}/sheets/actor/parts/mastery-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/spells-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/combat-actions.hbs`,
        `${templateBasePath}/sheets/actor/parts/inventory-list.hbs`,
        `${templateBasePath}/sheets/actor/parts/status-tab.hbs`
    ]);


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