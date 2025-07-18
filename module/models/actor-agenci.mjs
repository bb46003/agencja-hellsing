import { SYSTEM } from "../config/system.mjs";

export default class AgenciDataModel extends foundry.abstract.TypeDataModel {
  /* -------------------------------------------- */
  /*  Data Schema                                 */
  /* -------------------------------------------- */

  /**
   * Define shared schema elements used by every Actor sub-type in Crucible.
   * This method is extended by subclasses to add type-specific fields.
   * @override
   */
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    const schema = {};

    // Build cechy schema with per-cecha skill fields
    schema.cechy = new fields.SchemaField(
      Object.values(SYSTEM.CEHY).reduce((obj, cecha) => {
        // Build fresh skill fields for this cecha
        const skillFields = Object.entries(SYSTEM.UMIEJETNOSCI).reduce(
          (acc, [key, skill]) => {
            const isGlowna = key === "glowna";
            acc[key] = new fields.SchemaField(
              {
                label: new fields.StringField({
                  initial: "",
                  maxLength: 50,
                  validator: (value) =>
                    /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]*$/.test(value),
                }),
                value: new fields.NumberField({
                  ...requiredInteger,
                  initial: 0,
                  min: 0,
                  max: isGlowna ? 3 : 4,
                }),
              },
              { label: skill.label },
            );
            return acc;
          },
          {},
        );
        obj[cecha.id] = new fields.SchemaField(
          {
            value: new fields.NumberField({
              ...requiredInteger,
              initial: 0,
              min: 0,
              max: 3,
            }),
            przewagi: new fields.NumberField({
              ...requiredInteger,
              initial: 0,
              min: 0,
              max: 99,
            }),
            ...skillFields,
          },
          { label: cecha.label },
        );

        return obj;
      }, {}),
    );

    schema.obronne = new fields.SchemaField(
      Object.values(SYSTEM.OBRONNE).reduce((obj, obronny) => {
        obj[obronny.id] = new fields.SchemaField(
          {
            value: new fields.NumberField({
              ...requiredInteger,
              initial: 0,
              min: 0,
              max: 99,
            }),
          },
          { label: obronny.label },
        );

        return obj;
      }, {}),
    );
    schema.witalnosc_moc_dmg = new fields.SchemaField(
      Object.values(SYSTEM.WITALNOSC_MOC_DMG).reduce(
        (obj, witalnosc_moc_dmg) => {
          let initialValue = 0;
          if (witalnosc_moc_dmg.id === "reg") {
            initialValue = 5;
          }
          obj[witalnosc_moc_dmg.id] = new fields.SchemaField(
            {
              value: new fields.NumberField({
                ...requiredInteger,
                initial: initialValue,
                min: initialValue,
                max: 999,
              }),
            },
            { label: witalnosc_moc_dmg.label },
          );

          return obj;
        },
        {},
      ),
    );
    schema.rany = new fields.SchemaField(
      Object.values(SYSTEM.RANY).reduce((obj, rana) => {
        obj[rana.id] = new fields.SchemaField(
          {
            value: new fields.StringField({
              initial: "",
              maxLength: 50,
              validator: (value) =>
                /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s]*$/.test(value),
            }),
          },
          { label: rana.label },
        );

        return obj;
      }, {}),
    );

    return schema;
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
