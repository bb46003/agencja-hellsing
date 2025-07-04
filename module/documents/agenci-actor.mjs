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
      window: { title: `Rzut na ${skillName}` },
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
            const ulatwienia = Number(
              dialogHTML.querySelector(".ulatwienia").value,
            );
            const utrudnienia = Number(
              dialogHTML.querySelector(".utrudnienia").value,
            );
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
  async rzutObronny(obronnyNazwa){
    const iloscKosci = this.system.obronne[obronnyNazwa].value;
    const rzut = new Roll(`${iloscKosci}d6`)
    const nazwa = obronnyNazwa.toUpperCase();
    rzut.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: `Rzut obronny na ${nazwa}`
    })
  }
  async setSkillValue(cecha, skillKey, skillValue) {
    const skilLabel = this.system.cechy[cecha][skillKey].label;
    const skill = `system.cechy.${cecha}.${skillKey}.value`;
    if (skilLabel === "") {
      await this.update({ [skill]: 0 });
      //warning
    } else {
      await this.update({ [skill]: skillValue });
    }
  }
  async prepareAspekty(actor) {
    const itemsArray = Object.values(actor.items);
    const aspekty = itemsArray.filter((item) => item.type === "aspekt");
    return aspekty;
  }

  async prepareSprzet(actor) {
    const itemsArray = Object.values(actor.items);
    const sprzet = itemsArray.filter((item) => item.type === "sprzet");
    return sprzet;
  }

  async zmianaDodatkowychCech(event) {
    const nowaWartosc = Number(event.target.value);
    const cecha = event.target.dataset.cecha;
    const actor = this;
    let potrzebnyDialog = false;
    if (nowaWartosc !== 0) {
      switch (cecha) {
        case "budowa":
          if (
            actor.system.obronne.sila.value !== 0 &&
            actor.system.cechy.budowa.value !== 0
          ) {
            potrzebnyDialog = true;
          }
          break;
        case "kontrola":
          if (
            (actor.system.obronne.refleks.value !== 0 ||
              actor.system.obronne.wola.value !== 0) &&
            actor.system.cechy.kontrola.value !== 0
          ) {
            potrzebnyDialog = true;
          }
          break;
        case "duch":
          if (
            actor.system.obronne.intuicja.value !== 0 &&
            actor.system.cechy.duch.value !== 0
          ) {
            potrzebnyDialog = true;
          }
        case "umysl":
          if (
            actor.system.obronne.intuicja.value !== 0 &&
            actor.system.cechy.umysl.value !== 0
          ) {
            potrzebnyDialog = true;
          }
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
    const actor = this;
    switch (cecha) {
      case "budowa":
        await actor.update({ ["system.obronne.sila.value"]: nowaWartosc });
        await actor.update({ ["system.witalnosc_moc_dmg.pz.value"]: nowaWartosc*10+20 });
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
