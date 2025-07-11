import agenci_Utility from "../utility.mjs";

export default class hellsingRoll {
  constructor(actor) {
    this.actor = actor;
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
      position:{
        width:400
      },
      content: html,
      buttons: [
        {
          action: "rzut",
          label: "Rzut",
          default: true,
          callback: async (event) => {this.preRoll(dialog, event)},
        },
      ],
      system: dialogData,
    }).render(true);
  }
  async rzutObronny(obronnyNazwa, actor) {
    const iloscKosci = actor.system.obronne[obronnyNazwa].value;
    const rzut = new Roll(`${iloscKosci}d6`);
    const dane = {
      type: "obronny",
      nazwa: obronnyNazwa.toUpperCase(),
    };
    this.postRoll(rzut, dane);
  }

  async prepareAspekty(actor) {
    const itemsArray = actor.items;
    const aspekty = itemsArray.filter((item) => item.type === "aspekt");
    return aspekty;
  }

  async prepareSprzet(actor) {
    const itemsArray = actor.items;
    const sprzet = itemsArray.filter((item) => item.type === "sprzet");
    return sprzet;
  }
  async preRoll(dialog, event){
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
            const skillName = dialog.options.system.umiejtnosc;
            const checkedSprzetTags = dialogHTML.querySelectorAll('input.sprzet-tag:checked');
            const checkedAspektTags = dialogHTML.querySelectorAll('input.aspekt-tag:checked');
            const bonusZTagow = checkedSprzetTags.length + checkedAspektTags.length;
            const numberOfDice = baseNumberOfDice - utrudnienia + ulatwienia + bonusZTagow;
            if (numberOfDice <= 0) {
              //warning
            } else {
              const rzut = await new Roll(`${numberOfDice}d6`);
              const dane = {
                type: "skill",
                nazwa: skillName.toUpperCase(),
                aspekty: checkedAspektTags,
                sprzet: checkedSprzetTags,
                ulatwienia: ulatwienia,
                utrudnienia: utrudnienia,
              };
              this.postRoll(rzut, dane);
            }
  }
async groupTagsByDataNameArray(inputs) {
  const grouped = {};

  inputs.forEach(input => {
    const dataName = input.dataset.name;
    const tag = input.id;

    if (!grouped[dataName]) {
      grouped[dataName] = [];
    }

    grouped[dataName].push(tag);
  });

  return Object.entries(grouped).map(([name, tagi]) => ({ name, tagi }));
}
  async postRoll(rzut, dane) {
    const wynik = await rzut.evaluate();
    const ranny = Object.values(this.actor.system?.rany).some(
      (rana) => rana?.value !== "",
    );
    let prógPecha = 1;
    if (ranny) {
      prógPecha = 2;
    }
    const kostki = wynik.dice[0].results;
    let pech = 0;
    let sukcesy = 0;
    const iloscKostek = kostki.length;
    kostki.forEach((kostka) => {
      if (kostka.result >= 5) {
        sukcesy++;
      }
      if (kostka.result <= prógPecha) {
        pech++;
      }
    });
    const urzyteSprzety = await this.groupTagsByDataNameArray(dane.sprzet);
    const urzyteAspekty = await this.groupTagsByDataNameArray(dane.aspekty);
    console.log(urzyteAspekty, urzyteSprzety)
    const html = await agenci_Utility.renderTemplate(
      "systems/agencja-hellsing/templates/chat/roll.hbs",
      { formula: wynik.formula, kostki: kostki, ranny: ranny, urzyteSprzety: urzyteSprzety, urzyteAspekty:urzyteAspekty },
    );
    let type = "";
    if (dane.type === "skill") {
      type = "umiejętności";
    } else {
      type = "rzutu obronnego";
    }
    let flavor = `<h3 class="chat-heder">Test ${type} ${dane.nazwa}</h3><div class="hellsing-roll data-action="expandRoll">`;
    if (sukcesy === 0) {
      flavor += "NIe zdobyto żadnego sukcesu";
    }
    if (sukcesy !== 0) {
      flavor += `Zdobyta liczba sukswsów to: <strong>${sukcesy}</strong> `;
    }
    if (pech > Math.floor(iloscKostek / 2)) {
      flavor += "Masz <strong>PECHA</strong>!";
    }
    let speaker = ChatMessage.getSpeaker({ actor: game.user.character });
    if (game.user.isGM) {
      speaker = ChatMessage.getSpeaker({ actor: this.actor });
    }
    flavor += `</div>`;
    const titleHTML = `<h3>Test ${dane.nazwa}</h3>`;
    const chatData = {
      title: titleHTML,
      user: game.user?._id,
      speaker: speaker,
      flavor: flavor,
      content: html,
      roll: wynik,
    };

    await ChatMessage.create(chatData);
  }
}
