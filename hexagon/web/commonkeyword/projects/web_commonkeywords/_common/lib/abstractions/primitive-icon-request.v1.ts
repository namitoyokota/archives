export class PrimitiveIconRequest$v1 {

  /** List of primitive icons being requested */
  ids?: string[];

  /** Id of the tenant who owns the primitive icons being requested */
  tenantId?: string;

  constructor(param: PrimitiveIconRequest$v1 = {} as PrimitiveIconRequest$v1) {
    const {
      ids = [],
      tenantId = null
    } = param;

    this.ids = ids;
    this.tenantId = tenantId;
  }
}
