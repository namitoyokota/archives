export class RoleAssignment$v1 {
  /** Id of user */
  userId?: string;

  /** When the role expires. Null mean it does not expire. */
  expiration?: Date;

  /** Name of role the user is part of */
  nameToken?: string;

  /** Id of the role */
  roleName?: string;

  /** Tenant Id */
  tenantId?: string;

  constructor(param: RoleAssignment$v1 = {} as RoleAssignment$v1) {
    const {
      userId = null,
      expiration = null,
      nameToken = null,
      roleName = null,
      tenantId = null,
    } = param;

    /** If expiration is set to the year 9999 then it does not expire */
    this.userId = userId;
    if (expiration && new Date(expiration).getFullYear() === 9999) {
      this.expiration = null;
    } else {
      this.expiration = expiration;
    }

    this.nameToken = nameToken;
    this.roleName = roleName;
    this.tenantId = tenantId;
  }
}
