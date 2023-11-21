export class TenantSettings$v1 {
  /** Tenant id */
  id: string;

  /** Max user idle time before showing away mode */
  userInactivityThreshold: number;

  constructor(param: TenantSettings$v1 = {} as TenantSettings$v1) {
    const { id = null, userInactivityThreshold = 30 } = param;

    this.id = id;
    this.userInactivityThreshold = userInactivityThreshold;
  }
}
