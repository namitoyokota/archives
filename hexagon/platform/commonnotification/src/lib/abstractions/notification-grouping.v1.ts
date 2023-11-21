import { AppNotificationSettings$v1 } from "./app-notification-settings.v1";
import { NotificationFilter$v1 } from "./notification-filter.v1";

/**
 * Represents notification criteria grouping
 */
export class NotificationGrouping$v1 {
    /** Notification grouping filters. */
    filters?: NotificationFilter$v1[];

    /** Settings used by the UI. */
    uiSettings?: AppNotificationSettings$v1;

    constructor(params: NotificationGrouping$v1 = {} as NotificationGrouping$v1) {
        const { filters = [], uiSettings = null } = params;

        this.filters = filters;
        this.uiSettings = uiSettings;
    }
}
