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
    opis: "",
    nazwa:"",
    collapse: true,
  };

  await this.update({
    "system.efekt": [...current, nowyEfekt]
  });
    this.sheet.render(true)
}
async usunEfekt(efektID){
  const current = this.system.efekt ?? [];
  const updated = current.filter((_, index) => index !== efektID);
  await this.update({ "system.efekt": updated });

}
async zmianaKosztu(ev){
    const newValue = ev.target.value;
    const name = ev.target.dataset.index;
    const index = Number(name);
    const efekty = [...this.system.efekt];
    efekty[index].typkosztu = newValue;
    await this.update({ "system.efekty": efekty });
    this.sheet.render(true)

}
async ukryjDetale(efektID){
  const efekty = [...this.system.efekt];
 const index = Number(efektID);
  if(this.system.efekt[index].collapse){
    efekty[index].collapse = false;
  }else{
    efekty[index].collapse = true;
  }
   await this.update({ "system.efekty": efekty });
   this.sheet.render(true)
}
}
