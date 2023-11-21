import { NotificationCriteria$v1 } from "./notification-criteria.v1";
import { NotificationSettings$v1 } from "./notification-settings.v1";

/**
 * API response for getting a notification info
 */
export class NotificationResponse$v1 {
    /** Requested info object */
    payload?: NotificationCriteria$v1 | NotificationSettings$v1;

    /** Status of the call */
    statusCode?: number;
}
