export class RoleDetails$v1 {
  /** Role detail id */
  id: string;

  /** Id the details is for */
  applicationId: string;

  /** Token used to get translated string */
  detailToken: string;

  constructor(param: RoleDetails$v1 = {} as RoleDetails$v1) {
    const { id = null, applicationId = null, detailToken = null } = param;

    this.id = id;
    this.applicationId = applicationId;
    this.detailToken = detailToken;
  }
}
