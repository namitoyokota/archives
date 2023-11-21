import { AppNotification$v1 } from '@galileo/web_commonnotifications/adapter';
import { Observable } from 'rxjs';

import { AppNotificationSubtype, AppNotificationType } from '../../app-notification.service';

export class AppNotificationSettings {

    /** Id used for linked view actions */
    contextId$: Observable<string>;

    /** Notifications to display data for */
    notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>;

    constructor(param: AppNotificationSettings = {} as AppNotificationSettings) {
        const {
            contextId$ = null,
            notifications$ = null
        } = param;

        this.contextId$ = contextId$;
        this.notifications$ = notifications$;
    }
}
