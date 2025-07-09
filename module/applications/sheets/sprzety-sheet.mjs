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
    const name = event.target.dataset.name;
    const element = event.target.dataset.element;
    let name2 = ""
    if(name === "koszt"){
      name2 = event.target.dataset.type
    }
    const index = Number(event.target.dataset.index);
    await this.item.zmianaDanych(event, name, index, name2, element)
  }
  async _prepareContext(options) {
    const itemData = await this.getData();
    return itemData;
  }



  async getData() {
    const itemData = this.document.toObject(false);
    const context = {
      item: this.document,
      system: itemData.system,
      fields: this.document.system?.schema?.fields ?? {},
      isEditable: this.isEditable,
      source: this.document.toObject(),
    };

    return context;
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
  
}
