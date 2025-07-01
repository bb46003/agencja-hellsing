const { api, sheets } = foundry.applications;

/**
 * A base ActorSheet built on top of ApplicationV2 and the Handlebars rendering backend.
 */
export default class AgenciActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2,
) {
  static DEFAULT_OPTIONS = {
    classes: ["hellsing", "actor", "standard-form", "themed", "theme-dark"],
    tag: "form",
    position: {
      width: 900,
      height: 760,
    },
    actions: {
      skillRoll: AgenciActorSheet.#onskillRoll,
    },
    form: {
      submitOnChange: true,
    },
    actor: {
      type: "agenci",
    },
  };

  /** @override */
  static PARTS = {
    sidebar: {
      id: "sidebar",
      template: "systems/agencja-hellsing/templates/sheets/actor/sidebar.hbs",
    },
    tabs: {
      id: "tabs",
      template: "systems/agencja-hellsing/templates/sheets/actor/tabs.hbs",
    },
    body: {
      id: "body",
      template: "systems/agencja-hellsing/templates/sheets/actor/body.hbs",
    },
    cechy_umiejetnosci: {
      id: "cechy-umiejetnosci",
      template:
        "systems/agencja-hellsing/templates/sheets/actor/cechy-umiejetnosci.hbs",
    },
  };

  /** At least one tab is required to avoid rendering errors */
  static TABS = {
    sheet: [
      {
        id: "main",
        label: "Main",
        icon: "fa-solid fa-user",
      },
    ],
  };

  async _prepareContext(options) {
    const actorData = await this.getData();
    return actorData;
  }

  #getTabs() {
    const element = this?.element;
    let activeTab = "";

    if (element !== undefined && element !== null) {
      const tabsElements = element.querySelector(".tab.active");
      if (tabsElements !== null) {
        activeTab = tabsElements.dataset.tab;
      }
    }

    const tabs = {};
    for (const [groupId, config] of Object.entries(this.constructor.TABS)) {
      const group = {};
      for (const t of config) {
        const isGM = game.user.isGM;
        let active = false;

        if (isGM && t.id === "settings" && activeTab === "") {
          active = true;
        }
        if (!isGM && t.id === "buingStuff" && activeTab === "") {
          active = true;
        }
        if (activeTab !== "" && t.id === activeTab) {
          active = true;
        }

        group[t.id] = {
          ...t,
          active,
          cssClass: active ? "active" : "",
        };
      }
      tabs[groupId] = group;
    }

    return tabs;
  }

  async getData() {
    const actorData = this.actor.toObject(false);
    const tabGroups = this.#getTabs();

    const context = {
      tabs: tabGroups.sheet ?? [],
      actor: this.document,
      system: actorData.system,
      fields: this.document.system?.schema?.fields ?? {},
      isEditable: this.isEditable,
      source: this.document.toObject(),
      tabGroups,
      items: actorData.items,
    };

    return context;
  }

  async render(force = false, options = {}) {
    await super.render(force, options);
    console.log("AgenciActorSheet rendered:", this);
  }
  static async #onskillRoll(event) {
    const target = event.target;
    const sheet = event.currentTarget
   const container = target.closest(".specjalna, .glowna");
      if (!container) return;
      const textInput = container.querySelector('input[type="text"]');
      const skillName = textInput ? textInput.value : null;
      const checkboxes = container.querySelectorAll("input.glowna-checkbox");
      let skillValue = null;
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          skillValue = checkbox.getAttribute("data-val");
        }
      });
      const actor = this.actor;
      console.log("Actor class:", this.actor.constructor.name);

      return this.actor.rollSkill(skillName, skillValue, actor);
    
  }
}
