import TokenActionBar from "./apps/token-action-bar.js";

export const registerSystemSettings = function () {

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("splittermond", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  /**
   * Register resting variants
   */
  game.settings.register("splittermond", "HGMultiplier", {
    name: "SETTINGS.HGMultiplierN",
    hint: "SETTINGS.HGMultiplierL",
    scope: "world",
    config: true,
    type: Number,
    default: 1.0,
    range: {
      min: 0.5,
      max: 2.0,
      step: 0.25
    },
    onChange: mult => {
      console.log("HGMultiplier adjusted!");
      game.splittermond.heroLevel = CONFIG.splittermond.heroLevel.map(function (x) { return x * mult; });
      game.actors.forEach(actor => {
        if (actor.system.type == "character") {
          actor.prepareData();
        }
      });
    }
  });

  game.settings.register("splittermond", "theme", {
    name: "splittermond.settings.theme.name",
    hint: "splittermond.settings.theme.hint",
    scope: "client",
    config: true,
    type: String,
    choices: {           // If choices are defined, the resulting setting will be a select menu
      "default": "splittermond.settings.theme.options.default",
      "dark": "splittermond.settings.theme.options.dark",
      "splittermond-blue": "splittermond.settings.theme.options.splittermond_blue",
    },
    default: "default",
    onChange: theme => {
      document.body.setAttribute("data-theme", theme);
    }
  });

  game.settings.register("splittermond", "showActionBar", {
    name: "splittermond.settings.showActionBar.name",
    hint: "splittermond.settings.showActionBar.hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: useActionBar => {
      setTimeout(() => {
        game.splittermond.tokenActionBar.update();
      }, 500);
      
    }
  });

  game.settings.register("splittermond", "showHotbarDuringActionBar", {
    name: "splittermond.settings.showHotbarDuringActionBar.name",
    hint: "splittermond.settings.showHotbarDuringActionBar.hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: useActionBar => {
      setTimeout(() => {
        game.splittermond.tokenActionBar.update();
      }, 500);
      
    }
  });

  document.body.setAttribute("data-theme", game.settings.get("splittermond","theme"));
  
}