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
  get efekty(){
    return this.system.efekt;
  }
  async dodajTag() {
    const tagi = this.system.tagi ?? [];
    const nowaLista = [...tagi, ""];
    await this.update({ "system.tagi": nowaLista });
  }
  async zmianaTagu(ev) {
    const newValue = ev.target.value;
    const name = ev.target.dataset.name;
    const index = Number(name);
    const tagi = [...this.system.tagi];
    tagi[index] = newValue;
    await this.update({ "system.tagi": tagi });
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

async zmianaDanych(event,name,index, name2, element){
   const newValue = event.target.value;
  switch(element){
    case "efekt":
      const efekty = [...this.system.efekt];     
      if(name !== "koszt"){
        efekty[index][name] = newValue;
      }else{
        efekty[index][name][name2] = newValue;
      }    
      await this.update({ "system.efekt": efekty });
    break;
    case "tagi":
      await this.zmianaTagu(event)
    break;
    case "akcja":
      await this.update({['system.akcja']:Number(newValue)})
    break;
    case "zasieg":
            await this.update({['system.zasieg']:newValue})
    break;
    case "name":
        await this.update({['name']:newValue})
    break
  }
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
   await this.update({ "system.efekt": efekty });
   this.sheet.render(true)
}
}
