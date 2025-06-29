const { api, sheets } = foundry.applications;

/**
 * A base ActorSheet built on top of ApplicationV2 and the Handlebars rendering backend.
 */
export default class AgenciActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2,
) {}
