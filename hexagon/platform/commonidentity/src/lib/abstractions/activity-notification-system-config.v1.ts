import { ContactThreshold$v1 } from './contact-threshold.v1';

export class ActivityNotificationSystemConfig$v1 {
  /** The operational email address to send activity notifications to */
  operationalEmail?: string;

  /** Whether operational contacts should be notified when tenant triggers an annual threshold notification */
  notifyOperationalContactsForAnnualNotifications?: boolean;

  /** Whether operational contacts should be notified when a tenant triggers a burst notification */
  notifyOperationalContactsForBurstNotifications?: boolean;

  /** Default tenant thresholds for annual threshold notifications */
  defaultAnnualTenantThresholds?: number[];

  /** Default sales contact information to supply for notifications */
  defaultSalesContact?: ContactThreshold$v1;

  /** Default number of hours to wait between notifications */
  defaultNotificationCooldownHours?: number;

  /** Minimum percentage of a tenant's contract that must be in use before burst notifications can be triggered */
  burstMinimumThreshold?: number;

  /** Number of previous hours to use when determining a tenant's regular usage patterns for burst notification purposes */
  burstWindowSizeInHours?: number;

  constructor(
    params: ActivityNotificationSystemConfig$v1 = {} as ActivityNotificationSystemConfig$v1
  ) {
    const {
      operationalEmail = null,
      notifyOperationalContactsForAnnualNotifications = true,
      notifyOperationalContactsForBurstNotifications = true,
      defaultAnnualTenantThresholds = [0],
      defaultSalesContact = new ContactThreshold$v1(),
      defaultNotificationCooldownHours = 24,
      burstMinimumThreshold = 0,
      burstWindowSizeInHours = 0,
    } = params;

    this.operationalEmail = operationalEmail;
    this.notifyOperationalContactsForAnnualNotifications =
      notifyOperationalContactsForAnnualNotifications;
    this.notifyOperationalContactsForBurstNotifications =
      notifyOperationalContactsForBurstNotifications;
    this.defaultAnnualTenantThresholds = defaultAnnualTenantThresholds;
    this.defaultSalesContact = defaultSalesContact;
    this.defaultNotificationCooldownHours = defaultNotificationCooldownHours;
    this.burstMinimumThreshold = burstMinimumThreshold;
    this.burstWindowSizeInHours = burstWindowSizeInHours;
  }
}
