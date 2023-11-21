export class ContactThreshold$v1 {
  /** Email address to be notified */
  contactEmail?: string;

  /** The amount of time to delay in between notifications to prevent spamming */
  cooldownHours?: number;

  /** Timestamp of the last notification */
  lastNotification?: string;

  /** The threshold at which the notification should occur */
  threshold?: number[];

  /** Gets or sets a value indicating whether or not this contact is enabled for Annual Threshold notifications */
  isAnnualThresholdEnabled?: boolean;

  /** Gets or sets a value indicating whether or not this contact is enabled for Burst activity notifications */
  isBurstEnabled?: boolean;

  constructor(params: ContactThreshold$v1 = {} as ContactThreshold$v1) {
    const {
      contactEmail = null,
      cooldownHours = 24,
      lastNotification = null,
      threshold = [0],
      isAnnualThresholdEnabled = true,
      isBurstEnabled = true,
    } = params;

    this.contactEmail = contactEmail;
    this.cooldownHours = cooldownHours;
    this.lastNotification = lastNotification;
    this.threshold = threshold;
    this.isAnnualThresholdEnabled = isAnnualThresholdEnabled;
    this.isBurstEnabled = isBurstEnabled;
  }
}
