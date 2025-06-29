import { SYSTEM } from "./module/config/system.mjs";
import * as documents from "./module/documents/_module.mjs";
import * as models from "./module/models/_module.mjs";
import * as applications from "./module/applications/_module.mjs";
globalThis.SYSTEM = SYSTEM;

Hooks.once("init", async function () {
  console.log(`Inicjalizacja systemu Agencja Helsing`);
  const hellsing = (globalThis.hellsing = game.system);
  hellsing.CONST = SYSTEM;

  CONFIG.Actor.documentClass = documents.AgenciActor;
  CONFIG.Actor.dataModels = {
    agenci: models.AgenciDataModel,
  };
  const sheets = foundry.applications.apps.DocumentSheetConfig;
  sheets.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
  sheets.registerSheet(Actor, SYSTEM.id, applications.AgenciActorSheet, {
    types: ["hero"],
    label: "CRUCIBLE.SHEETS.Hero",
    makeDefault: true,
  });
});
