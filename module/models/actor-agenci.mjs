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
    //cechy postaci
    schema.cechy = new fields.SchemaField(
      Object.values(SYSTEM.CEHY).reduce((obj, cecha) => {
        obj[cecha.id] = new fields.SchemaField(
          {
            value: new fields.NumberField({
              ...requiredInteger,
              initial: 0,
              min: 0,
              max: 3,
            }),
          },
          { label: cecha.label },
        );
        return obj;
      }, {}),
    );
    return schema;
  }
}
