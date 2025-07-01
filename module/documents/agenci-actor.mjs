import agenci_Utility from "../utility.mjs";

export default class AgenciActor extends Actor {
  constructor(...args) {
    super(...args);
  }
  get cechy() {
    return this.system.cechy;
  }
  get obronne() {
    return this.system.obronne;
  }
  async rollSkill(skillName, skillValue, actor) {
    const aspekty = await this.prepareAspekty(actor);
    const sprzet = await this.prepareSprzet(actor);
    const dialogData = {
      umiejtnosc: skillName,
      wartoscUmiejetnosci: skillValue,
      aspekty: aspekty || [],
      sprzet: sprzet || [],
    };
    const html = await agenci_Utility.renderTemplate(
      "systems/agencja-hellsing/templates/dialog/umiejetnosc-roll.hbs",
      dialogData,
    );
    const dialog = await new foundry.applications.api.DialogV2({
      window: { title: `rzut na ${skillName}` },
      content: html,
      buttons: [
        {
          action: "rzut",
          label: "Rzut",
          default: true,
          callback: async (event) => {
            console.log(dialog.options.system);
            console.log(event)
          },
        },
      ],
      system: dialogData,
    }).render(true);
  }
  async prepareAspekty(actor) {
    const itemsArray = Object.values(actor.items); // zamiana obiektu na tablicę
    const aspekty = itemsArray.filter((item) => item.type === "aspekt");
    return aspekty;
  }

  async prepareSprzet(actor) {
    const itemsArray = Object.values(actor.items);
    const sprzet = itemsArray.filter((item) => item.type === "sprzet");
    return sprzet; // warto zwrócić wynik, tak jak w prepareAspekty
  }
}
