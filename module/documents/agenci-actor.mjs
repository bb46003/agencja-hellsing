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
            const baseNumberOfDice = Number(
              dialog.options.system.wartoscUmiejetnosci,
            );
            const dialogHTML = event.currentTarget.lastChild;
            const ulatwienia = Number(dialogHTML.querySelector(".ulatwienia").value);
            const utrudnienia = Number(dialogHTML.querySelector(".utrudnienia").value);
            const numberOfDice = baseNumberOfDice - utrudnienia + ulatwienia;
            if (numberOfDice <= 0) {
              //warning
            } else {
              const roll = new Roll(`${numberOfDice}d6`);

              await roll.evaluate();

              roll.toMessage({
                speaker: ChatMessage.getSpeaker(),
                flavor: `Rolling ${numberOfDice}d6`,
              });
            }
          },
        },
      ],
      system: dialogData,
    }).render(true);
  }
  async setSkillValue(cecha, skillKey, skillValue){
    const skilLabel = this.system.cechy[cecha][skillKey].label;
    const skill = `system.cechy.${cecha}.${skillKey}.value`
    if(skilLabel === ""){
      await this.update({[skill]:0})
      //warning
    }else{
        await this.update({[skill]:skillValue})
    }

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
