import { ContactThreshold$v1 } from './contact-threshold.v1';

export class ActivityNotificationConfig$v1 {
  /** Gets or sets the configuration for a tenant's contact for activity notifications */
  tenantContact?: ContactThreshold$v1;

  /** Gets or sets the configuration for a tenant's sales contact for activity notifications */
  salesContact?: ContactThreshold$v1;

  constructor(
    params: ActivityNotificationConfig$v1 = {} as ActivityNotificationConfig$v1
  ) {
    const {
      tenantContact = new ContactThreshold$v1(),
      salesContact = new ContactThreshold$v1(),
    } = params;

    this.tenantContact = tenantContact;
    this.salesContact = salesContact;
  }
}
