import { SYSTEM } from "../config/system.mjs";

export default class ItemSprzetyDataModel extends foundry.abstract
  .TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const fractionPattern = /^\d+\/\d+$/;

    return {
      tagi: new fields.ArrayField(new fields.StringField({ required: true }), {
        required: true,
        initial: [],
      }),

      akcja: new fields.NumberField({  ...requiredInteger, initial:0}),

      zasieg: new fields.StringField({initial:""}),

      efekt: new fields.ArrayField(
        new fields.SchemaField({
          typkosztu: new fields.StringField(),
          koszt: new fields.SchemaField({
            P: new fields.StringField({ 
              initial:"",                   
              validator: (value) =>
                    fractionPattern.test(value)}),
            S: new fields.StringField({               
              initial:"",                   
              validator: (value) =>
                    fractionPattern.test(value)}),
            M: new fields.StringField({               
              initial:"",                   
              validator: (value) =>
                    fractionPattern.test(value)}),
          }),
          opis: new fields.StringField( {initial:""} ),
          nazwa: new fields.StringField( {initial:""} ),
          collapse: new fields.BooleanField({ initial: false })
        }),
      )
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
