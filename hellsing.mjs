import { SYSTEM } from "./module/config/system.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/models/_module.mjs";
import * as applications from "./module/applications/_module.mjs";
import { registerHandlebarsHelpers } from "./module/helpers.mjs";
globalThis.SYSTEM = SYSTEM;

Hooks.once("init", async function () {
  console.log(`Inicjalizacja systemu Agencja Helsing`);
  const hellsing = (globalThis.hellsing = game.system);
  hellsing.CONST = SYSTEM;

  CONFIG.Actor.documentClass = documents.AgenciActor;

  CONFIG.Actor.dataModels = {
    agenci: models.AgenciDataModel,
  };
  const defaultActorSheet =
    game.release.generation < 13 ? ActorSheet : foundry.appv1.sheets.ActorSheet;
  const sheets =
    game.release.generation < 13
      ? DocumentSheetConfig
      : foundry.applications.apps.DocumentSheetConfig;
  sheets.unregisterSheet(Actor, "core", defaultActorSheet);
  sheets.registerSheet(Actor, SYSTEM.id, applications.AgenciActorSheet, {
    types: ["agenci"],
    label: "Agent",
    makeDefault: true,
  });
  registerHandlebarsHelpers();
    preloadHandlebarsTemplates();
});
async function preloadHandlebarsTemplates() {
  if (game.release.generation < 13) {
    return loadTemplates([
 "systems/agencja-hellsing/templates/sheets/actor/sidebar.hbs", 
        "systems/agencja-hellsing/templates/sheets/actor/tabs.hbs", 
        "systems/agencja-hellsing/templates/sheets/actor/tabs/cechy-umiejetnosci.hbs",
        "systems/agencja-hellsing/templates/sheets/actor/tabs/aspekty_talenty.hbs",
    ]);
  } else {
    foundry.applications.handlebars.loadTemplates([
 "systems/agencja-hellsing/templates/sheets/actor/sidebar.hbs", 
        "systems/agencja-hellsing/templates/sheets/actor/tabs.hbs", 
        "systems/agencja-hellsing/templates/sheets/actor/tabs/cechy-umiejetnosci.hbs",
        "systems/agencja-hellsing/templates/sheets/actor/tabs/aspekty_talenty.hbs",
    ]);
  }
}
    
       