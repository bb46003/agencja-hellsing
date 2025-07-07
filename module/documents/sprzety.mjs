export default class SPRZETY extends foundry.documents.Item {
  /* -------------------------------------------- */
  /*  Item Attributes                             */
  /* -------------------------------------------- */
  constructor(...args) {
    super(...args);
  }

  /**
    @type {sprzet}
    */
  get tagi() {
    return this.system.tagi;
  }

  async dodajTag() {
    const tagi = this.system.tagi ?? [];
    const nowaLista = [...tagi, ""];
    await this.update({ "system.tagi": nowaLista });
  }
  async zmianaTagu(ev, item) {
    const newValue = ev.target.value;
    const name = ev.target.name;
    const index = Number(name);
    const tagi = [...item.system.tagi];
    tagi[index] = newValue;
    await item.update({ "system.tagi": tagi });
  }
  async usunTag(tagIndex, item) {
    const tagi = [...item.system.tagi];
    tagi.splice(tagIndex, 1);
    await item.update({ "system.tagi": tagi });
  }
 async dodajEfekt() {
  const current = this.system.efekt ?? [];

  const nowyEfekt = {
    typkosztu: "-",
    koszt: {
      P: "",
      S: "",
      M: ""
    },
    opis: ""
  };

  await this.update({
    "system.efekt": [...current, nowyEfekt]
  });
}
async zmianaKosztu(ev){
    const newValue = ev.target.value;
    const name = ev.target.name;
    const index = Number(name);
    const efekty = [...this.system.efekt];
    efekty[index].typkosztu = newValue;
    await this.update({ "system.efekty": efekty });
    this.sheet.render(true)

}
}
