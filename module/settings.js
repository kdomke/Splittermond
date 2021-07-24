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
        if (actor.data.type == "character") {
          actor.prepareData();
        }
      });
    }
  });

  game.settings.register("splittermond", "darkMode", {
    name: "splittermond.settings.darkMode",
    hint: "splittermond.settings.darkModeHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: darkMode => {
      document.body.setAttribute("data-theme", darkMode ? "dark": "");
    }
  });

  document.body.setAttribute("data-theme", game.settings.get("splittermond","darkMode") ? "dark": "");
}