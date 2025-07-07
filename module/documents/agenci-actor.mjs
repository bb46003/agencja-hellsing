import hellsingRoll from "../roll/rolls.mjs";

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
    const sillRoll = new hellsingRoll(actor);
    sillRoll.rollSkill(skillName, skillValue, actor);
  }
  async rzutObronny(obronnyNazwa) {
    const rzutObronny = new hellsingRoll(this);
    rzutObronny.rzutObronny(obronnyNazwa, this);
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
        await actor.update({
          ["system.witalnosc_moc_dmg.pz.value"]: nowaWartosc * 10 + 20,
          ["system.witalnosc_moc_dmg.dmg.value"]: nowaWartosc * 10 + 20,
        });
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
