import agenci_Utility from "../utility.mjs";

export default class hellsingRoll {
     constructor(actor){
        this.actor = actor
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
            const rzut = await new Roll(`${numberOfDice}d6`);
            const dane = {
                type: "skill",
                nazwa: skillName.toUpperCase(),
                aspekty: [],
                sprzet: [],
                ulatwienia: ulatwienia,
                utrudnienia: utrudnienia
            }
            this.postRoll(rzut, dane)
            }
          },
        },
      ],
      system: dialogData,
    }).render(true);
  }
  async rzutObronny(obronnyNazwa, actor){
    const iloscKosci = actor.system.obronne[obronnyNazwa].value;
    const rzut = new Roll(`${iloscKosci}d6`)
    const dane = {
        type: "obronny",
        nazwa: obronnyNazwa.toUpperCase()
    };
    this.postRoll(rzut, dane)
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
  async postRoll(rzut, dane){
    const wynik = await rzut.evaluate()
    const ranny = this.actor.system?.ranny;
    let prógPecha = 1;
    if(ranny !== undefined){
        prógPecha = 2;
    }
    const kostki = wynik.dice[0].results
    let pech = 0;
    let sukcesy = 0;
    const iloscKostek = kostki.length;
    kostki.forEach(kostka => {
        if(kostka.result >= 5){
            sukcesy ++;
        }
        if(kostka.result <= prógPecha){
            pech ++;
        }
    });
    const rutzHTML =  await rzut.render(true);
    const content = await this.modifyRollTemplate(rutzHTML)
    let flavor = `<div class="hellsing-roll data-action="expandRoll">`
    if(sukcesy === 0){
     flavor += "NIe zdobyto żadnego sukcesu";
    }
    if(sukcesy !== 0){
     flavor += `Zdobyta liczba sukswsów to: <strong>${sukcesy}</strong> `
    };
    if(pech > Math.floor(iloscKostek/2)){
        flavor += "Masz <strong>PECHA</strong>!"
    }
    let speaker = ChatMessage.getSpeaker({ actor: game.user.character })
     if(game.user.isGM){
         speaker = ChatMessage.getSpeaker({ actor: this.actor })
     }
     flavor += `</div>`
    const chatData = {
                user: game.user?._id,
                speaker: speaker,
                flavor: flavor,
                content: content,
            };
            await ChatMessage.create(chatData);
  }
  async modifyRollTemplate(html) {
                html = html.replace(
                    /<div class="dice-roll"/,
                    '<div class="dice-roll expanded"'
                );
                  html = html.replace(
                    /data-action="expandRoll"/,
                    ''
                );

                html = html.replace(
                    /<h4 class="dice-total">.*?<\/h4>/s,
                    ''
                );
                html = html.replace(
                    /<div class="dice-formula">.*?<\/div>/s,
                    ''
                );
                html = html.replace(
                /<span class="part-total">.*?<\/span>/gs,
                ''
                );
                html = html.replace(
                    /<span class="part-formula">6d6x<\/span>/,
                    ''
                );
                html = html.replace(
                    /<li class="roll die d6">(.*?)<\/li>/g,
                    (match, p1) => {
                        const num = parseInt(p1.trim(), 10);
                        if (num === 5) {
                            return match.replace(
                                /class="roll die d6"/,
                                'class="roll die d6 max"'
                            );
                        }
                        return match;
                    }
                );
                return html;
            }
}