import { NotificationGrouping$v1 } from './notification-grouping.v1';

/**
 * Represents notification criteria
 */
export class NotificationCriteria$v1 {
    /** Handles concurrency */
    etag?: string;

    /** Id of the entity owner tenant */
    tenantId?: string;

    /** Name of preset */
    preset?: string;

    /** Id that created the notification */
    capabilityId?: string;

    /** The type for the notification */
    notificationType?: string;

    /** The subtype for the notification */
    notificationSubtype?: string;

    /** Whether the criteria is enabled. */
    isEnabled?: boolean;

    /** Notification criteria grouping. */
    grouping?: NotificationGrouping$v1[];

    constructor(params: NotificationCriteria$v1 = {} as NotificationCriteria$v1) {
        const {
            etag = null,
            tenantId = null,
            preset = null,
            capabilityId = null,
            notificationType = null,
            notificationSubtype = null,
            isEnabled = true,
            grouping = []
        } = params;

        this.etag = etag;
        this.tenantId = tenantId;
        this.preset = preset;
        this.capabilityId = capabilityId;
        this.notificationType = notificationType;
        this.notificationSubtype = notificationSubtype;
        this.isEnabled = isEnabled;
        this.grouping = grouping;
    }
}
