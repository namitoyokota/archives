import { Guid } from '@galileo/platform_common-libraries';

import { AppNotificationSettings$v1 } from './app-notification-settings.v1';

/**
 * Represents an app level notification. Theses notification should map directly to UI and
 * be displayed in the app notification panel.
 */
export class AppNotification$v1<T, V> {
    /** Name of the notification */
    name?: string;

    /** Entity id */
    id?: string;

    /** Id that created the notification */
    capabilityId?: string;

    /** Id of the entity owner tenant */
    tenantId?: string;

    /** When the notification was created */
    timestamp?: Date;

    /** Setting used by the UI */
    uiSettings?: AppNotificationSettings$v1;

    /** The type for the notification */
    notificationType?: T;

    /** The subtype for the notification */
    notificationSubtype?: V;

    /** Unique identify for this notification generated by the system at creation */
    systemCorrelationId?: string;

    /** A flag that is true if the user has seen this notification */
    hasBeenSeen?: boolean;

    /** A flag that is true if the toast notification has already been displayed */
    toastDisplayed?: boolean;

    /** Id of the group the notification is part of */
    groupId?: string;

    /** Any capability-specific data */
    data?: any;

    /** Is true if the notification has been flagged by the user */
    flagged: boolean;

    constructor(params: AppNotification$v1<T, V> = {} as AppNotification$v1<T, V>) {
        const {
            name = null,
            id = null,
            capabilityId = null,
            tenantId = null,
            uiSettings = null,
            notificationType = null,
            notificationSubtype = null,
            systemCorrelationId = null,
            hasBeenSeen = false,
            toastDisplayed = false,
            timestamp = null,
            data = null,
            flagged = false
        } = params;

        this.name = name;
        this.id = id;
        this.capabilityId = capabilityId;
        this.tenantId = tenantId;
        this.uiSettings = uiSettings;
        this.notificationType = notificationType;
        this.notificationSubtype = notificationSubtype;
        this.systemCorrelationId = systemCorrelationId;
        this.hasBeenSeen = hasBeenSeen;
        this.toastDisplayed = toastDisplayed;
        this.timestamp = timestamp;
        this.data = data;
        this.flagged = flagged;

        if (uiSettings) {
            this.uiSettings = new AppNotificationSettings$v1(uiSettings);
        } else {
            this.uiSettings = new AppNotificationSettings$v1();
        }

        let tempGroupId = capabilityId + ';' + notificationType + ';';

        if (this.uiSettings.toastDuration === -1) {
            tempGroupId += '-1';
        }

        if (this.uiSettings.noGrouping) {
            tempGroupId += Guid.NewGuid();
        }

        this.groupId = tempGroupId;
    }
}
