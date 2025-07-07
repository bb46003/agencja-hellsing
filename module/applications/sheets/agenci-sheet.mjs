const { api, sheets } = foundry.applications;

/**
 * A base ActorSheet built on top of ApplicationV2 and the Handlebars rendering backend.
 */
export default class AgenciActorSheet extends api.HandlebarsApplicationMixin(
  sheets.ActorSheetV2,
) {
  static DEFAULT_OPTIONS = {
    classes: ["hellsing", "agenci", "standard-form", "themed", "theme-dark"],
    tag: "form",
    position: {
      width: 820,
      height: "auto",
    },
    actions: {
      skillRoll: AgenciActorSheet.#onskillRoll,
      setSkillValue: AgenciActorSheet.#setSkillValue,
      deffRoll: AgenciActorSheet.#onRzutObronny,
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
    cechy_glowne: {
      id: "cechy_glowne",
      template:
        "systems/agencja-hellsing/templates/sheets/actor/tabs/cechy-umiejetnosci.hbs",
    },
    aspekty_talenty: {
      id: "aspekty_talenty",
      template:
        "systems/agencja-hellsing/templates/sheets/actor/tabs/aspekty_talenty.hbs",
    },
  };

  /** At least one tab is required to avoid rendering errors */
  static TABS = {
    sheet: [
      { id: "cechy_glowne", group: "sheet" },
      { id: "aspekty_talenty", group: "sheet" },
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

        if (isGM && t.id === "cechy_glowne" && activeTab === "") {
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
      tabs: tabGroups.sheet,
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
  async activateListeners(html) {
    const selektorCech = html.querySelectorAll(".selector-cech");
    this.zmianaCechy(html);
    selektorCech.forEach((cecha) => {
      cecha.addEventListener("change", (ev) =>
        this.actor.zmianaDodatkowychCech(ev),
      );
    });
  }

  async render(force = false, options = {}) {
    await super.render(force, options);
    const el = this.element;
    this.activateListeners(el);
  }
  static async #onskillRoll(event) {
    const target = event.target;
    const container = target.closest(".glowna, .specjalna");
    if (!container) return;
    const textInput = container.querySelector('input[type="text"]');
    const skillName = textInput?.value ?? null;
    const checkboxes = container.querySelectorAll(
      "input.glowna-checkbox, input.specjalna-checkbox",
    );
    let skillValue = null;
    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        skillValue = checkbox.dataset.val;
      }
    });
    const actor = this.actor;
    return actor.rollSkill(skillName, skillValue, actor);
  }
  static async #setSkillValue(event) {
    const target = event.target;
    let skillValue = Number(target.dataset.val);
    if (!target.checked) {
      skillValue = Number(target.dataset.val) - 1;
    }
    const skillKey = target.dataset.skilltype;
    const cecha = target.dataset.key;
    const actor = this.actor;
    actor.setSkillValue(cecha, skillKey, skillValue);
  }
  static async #onRzutObronny(event) {
    const obronnyNazwa = event.target.dataset.obronny;
    return this.actor.rzutObronny(obronnyNazwa);
  }
  async zmianaCechy(html) {
    const inneCechy = html.querySelectorAll(".selector-cech");
    const cechaPool = [1, 2, 2, 3];
    const cechy = this.actor.system.cechy;
    const selectedValues = Object.values(cechy)
      .map((c) => Number(c.value))
      .filter((v) => !isNaN(v) && v > 0);
    const usedCounts = {};
    for (const val of selectedValues) {
      usedCounts[val] = (usedCounts[val] || 0) + 1;
    }
    const availableValues = {};
    for (const val of cechaPool) {
      availableValues[val] = (availableValues[val] || 0) + 1;
    }
    for (const val in usedCounts) {
      availableValues[val] -= usedCounts[val];
    }
    inneCechy.forEach((select) => {
      const cechaKey = select.dataset.cecha;
      const currentValue = Number(
        this.actor.system.cechy[cechaKey]?.value || 0,
      );
      select.querySelectorAll("option").forEach((option) => {
        const optVal = Number(option.value);
        if (optVal === 0) {
          option.style.display = "";
        } else if (optVal === currentValue) {
          option.style.display = "";
        } else {
          const left = availableValues[optVal] || 0;
          if (left <= 0) {
            option.style.display = "none";
          }
        }
      });
    });
  }
}
