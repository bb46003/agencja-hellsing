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
      setSkillValue: AgenciActorSheet.#setSkillValue,
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
  async activateListeners(html) {
    const selektorCech = html.querySelectorAll(".selector-cech");
    this.zmianaCechy(html);
    selektorCech.forEach((cecha) => {
      cecha.addEventListener("change", (ev) => this.zmianaDodatkowychCech(ev));
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
  async zmianaCechy(html) {
    const inneCechy = html.querySelectorAll(".selector-cech");
    const cechaPool = [1, 2, 2, 3];
    const cechy = this.actor.system.cechy;

    const selectedValues = Object.values(cechy)
      .map((c) => Number(c.value))
      .filter((v) => !isNaN(v) && v > 0);

    // 2. policz ile razy każda wartość została wybrana
    const usedCounts = {};
    for (const val of selectedValues) {
      usedCounts[val] = (usedCounts[val] || 0) + 1;
    }

    // 3. policz ile zostało jeszcze dostępnych z puli
    const availableValues = {};
    for (const val of cechaPool) {
      availableValues[val] = (availableValues[val] || 0) + 1;
    }
    for (const val in usedCounts) {
      availableValues[val] -= usedCounts[val];
    }

    // 4. aktualizuj selectory w HTML
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
          option.style.display = ""; // zawsze można pozostać przy wybranej wartości
        } else {
          const left = availableValues[optVal] || 0;
          if (left <= 0) {
            option.style.display = "none";
          }
        }
      });
    });
  }

  async zmianaDodatkowychCech(event) {
    const nowaWartosc = Number(event.target.value);
    const cecha = event.target.dataset.cecha;
    const actor = this.actor;
    let potrzebnyDialog = false;
    switch (cecha) {
      case "budowa":
        if (actor.system.obronne.sila.value !== 0) {
          potrzebnyDialog = true;
        }
        break;
      case "kontrola":
        if (
          actor.system.obronne.refleks.value !== 0 ||
          actor.system.obronne.wola.value !== 0
        ) {
          potrzebnyDialog = true;
        }
        break;
      case "duch":
      case "umysl":
        if (actor.system.obronne.intuicja.value !== 0) {
          potrzebnyDialog = true;
        }
    }
    if (potrzebnyDialog) {
      const dialog = new foundry.applications.api.DialogV2({
        window: { title: "Zmiana Rzutów Obronnych" },
        content:
          "Zmieniasz Cechę już po początkowym wybraniu jej, klikając Dalej przeliczysz swoje rzuty obronne do bazowej wartosci.",
        buttons: [
          {
            label: "Dalej",
            action: "dalej",
          },
        ],
        submit: (result) => {
          if (result === "dalej") {
            this.przeliczRzutyObonne(nowaWartosc, cecha);
          }
        },
      });
      dialog.render(true);
    } else {
      this.przeliczRzutyObonne(nowaWartosc, cecha);
    }
  }
  async przeliczRzutyObonne(nowaWartosc, cecha) {
    const actor = this.actor;
    switch (cecha) {
      case "budowa":
        await actor.update({ ["system.obronne.sila.value"]: nowaWartosc });
        break;

      case "kontrola":
        await actor.update({ ["system.obronne.refleks.value"]: nowaWartosc });
        {
          const duch = actor.system.cechy.duch.value;
          await actor.update({
            ["system.obronne.wola.value"]: nowaWartosc + duch + 1,
          });
        }
        break;

      case "duch":
        {
          const umysl = actor.system.cechy.umysl.value;
          await actor.update({
            ["system.obronne.intuicja.value"]: nowaWartosc + umysl,
          });
        }
        break;

      case "umysl":
        {
          const duch = actor.system.cechy.duch.value;
          await actor.update({
            ["system.obronne.intuicja.value"]: nowaWartosc + duch,
          });
        }
        break;
    }
  }
}
