const { api, sheets } = foundry.applications;

export default class ItemsSprzety extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2,
) {
  static DEFAULT_OPTIONS = {
    classes: ["hellsing", "item", "standard-form"],
    tag: "form",
    position: {
      width: 560,
      height: 695
    },
    form: {
       handler: ItemsSprzety.myFormHandler,
      submitOnChange: true,
    },
    actions: {
      dodajtag: ItemsSprzety.#dodajTag,
      usuntag: ItemsSprzety.#usunTag,
      dodajefekt: ItemsSprzety.#dodajEfekt,
      ukryj: ItemsSprzety.#ukryjDetale,
      usunefekt: ItemsSprzety.#usunefekt
    },
    item: {
      type: "sprzet",
    },
  };
  static PARTS = {
    topsection: {
      id: "top-section",
      template:
        "systems/agencja-hellsing/templates/sheets/items/top-section.hbs",
    },
    main: {
      id: "main",
      template: "systems/agencja-hellsing/templates/sheets/items/sprzety.hbs",
    },
  };
  static TABS = {
    sheet: [],
  };
  static async myFormHandler(event, form, formData) {
    console.log(event, form, formData)
  }
  async _prepareContext(options) {
    const itemData = await this.getData();
    return itemData;
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
    const itemData = this.document.toObject(false);
    const tabGroups = this.#getTabs();
    const context = {
      tabs: tabGroups.sheet,
      item: this.document,
      system: itemData.system,
      fields: this.document.system?.schema?.fields ?? {},
      isEditable: this.isEditable,
      source: this.document.toObject(),
      tabGroups,
    };

    return context;
  }
  async _updateObject(event, formData) {
  await this.document.update(formData);
}
  static async #dodajTag() {
    await this.item.dodajTag();
  }
  static async #usunTag(event) {
    const tagIndex = event.target.dataset.index;
    await this.item.usunTag(tagIndex, this.item);
  }
  static async #dodajEfekt(){
     await this.item.dodajEfekt();
  }
 static async #ukryjDetale(event) {
  const efektID = event.target.dataset.index
   await this.item.ukryjDetale(efektID)
}

static async #usunefekt(event){
  const efektID = Number(event.target.dataset.index);
  await this.item.usunEfekt(efektID)
}

async render(force = false, options = {}) {
    await super.render(force, options);
    const el = this.element;
    this.activateListeners(el);
   

  }

  async activateListeners(html) {
    const tagInputs = html.querySelectorAll(".tag-input");
    tagInputs.forEach((input) => {
      input.addEventListener("change", (ev) =>
        this.item.zmianaTagu(ev, this.item),
      );
    });
    const typKosztu = html.querySelectorAll(".typ-kosztu");
  typKosztu.forEach((selection)=>{
      selection.addEventListener("change",(ev)=>
       this.item.zmianaKosztu(ev)
      )
    })
  }
}
