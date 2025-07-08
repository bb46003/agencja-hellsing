import { SYSTEM } from "../config/system.mjs";

export default class ItemSprzetyDataModel extends foundry.abstract
  .TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const fractionPattern = /^\d+\/\d+$/;

    return {
      tagi: new fields.ArrayField(new fields.StringField({ required: true }), {
        required: true,
        initial: [],
      }),

      akcja: new fields.NumberField(),

      zasięg: new fields.StringField(),

      efekt: new fields.ArrayField(
        new fields.SchemaField({
          typkosztu: new fields.StringField(),
          koszt: new fields.SchemaField({
            P: new fields.StringField({ pattern: fractionPattern }),
            S: new fields.StringField({ pattern: fractionPattern }),
            M: new fields.StringField({ pattern: fractionPattern }),
          }),
          opis: new fields.StringField(),
          nazwa: new fields.StringField(),
          collapse: new fields.BooleanField({ initial: false })
        }),
      ),
    };
  }

  /** @override */
  prepareBaseData() {
    super.prepareBaseData();
  }
  /** @inheritDoc */
  static migrateData(source) {
    super.migrateData(source);
  }
}
