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
 async rollSkill(){
  const roll = await new Roll("2d6");
  roll.toMessage();
 }
}
