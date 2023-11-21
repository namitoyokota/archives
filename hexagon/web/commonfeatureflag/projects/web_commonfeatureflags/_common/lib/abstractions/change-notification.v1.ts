/**
 * Type of notification this is
 */
export enum ChangeNotificationReason$v1 {
    unknown = 'Unknown',
    updated = 'Updated'
}

/**
 * Change notification object (v1)
 */
export class ChangeNotification$v1 {

    /** Name of Change Notification */
    name: string;

    /** The reason for the notification */
    reason: ChangeNotificationReason$v1;

    /** Identity Entity Id */
    id: string;

    /** Identity Tenant Id */
    tenantId: string;

    /** Timestamp of change notification creation */
    timestamp: string;

    /**  Unique Identify for this notification generated by the system at creation */
    systemCorrelationId: string;

    constructor(params: ChangeNotification$v1 = {} as ChangeNotification$v1) {
        const {
            name,
            reason = ChangeNotificationReason$v1.unknown,
            id,
            timestamp,
            systemCorrelationId
        } = params;

        this.name = name;
        this.reason = reason;
        this.id = id;
        this.timestamp = timestamp;
        this.systemCorrelationId = systemCorrelationId;
    }
}
