/** Mapping of role id to the expiration date */
export type RolesExpiration = Record<string, Date>;

export class Invitation$v1 {
  /** The invitation's id */
  id?: string;

  /** The id of the invited user */
  userId?: string;

  /** The username of the invited user */
  userName?: string;

  /** The email of the invited user */
  email?: string;

  /** The tenantId of the invited user */
  tenantId?: string;

  /** The roles to assign to the invited user */
  roles?: RolesExpiration;

  /** The creation time of the invitation */
  creationTime?: Date;

  /** The expiration time for the invitation */
  expiration?: Date;

  constructor(params: Invitation$v1 = {} as Invitation$v1) {
    const {
      id = null,
      userId = null,
      userName = null,
      email = null,
      tenantId = null,
      roles = {},
      creationTime = null,
      expiration = null,
    } = params;

    this.id = id;
    this.userId = userId;
    this.userName = userName;
    this.email = email;
    this.tenantId = tenantId;

    if (roles && Object.keys(roles)?.length) {
      Object.keys(roles).forEach((name) => {
        if (!roles[name] || new Date(roles[name])?.getFullYear() === 9999) {
          roles[name] = null;
        } else {
          roles[name] = new Date(roles[name]);
        }
      });
    } else {
      this.roles = roles;
    }

    this.roles = roles;
    this.creationTime = creationTime;

    if (expiration && new Date(expiration).getFullYear() === 9999) {
      this.expiration = null;
    } else {
      this.expiration = expiration;
    }
  }
}
