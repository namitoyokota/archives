import { Observable } from 'rxjs';
import { AppNotification$v1 } from '@galileo/platform_commonnotifications';

export class AppNotificationInjectionRequest$v1 {

    /** Id of the capability the request if for */
    capabilityId?: string;

    /** Stream of app notifications */
    appNotifications?: Observable<AppNotification$v1<string, string>[]>;

    /** Id used to inject icon component */
    iconContentId?: string;

    /** Id used to inject item component */
    itemContentId?: string;

    /** Stream for context id */
    contextId$?: Observable<string>;

    constructor(params: AppNotificationInjectionRequest$v1 = {} as AppNotificationInjectionRequest$v1) {
        const {
            capabilityId = null,
            appNotifications = null,
            iconContentId = null,
            itemContentId = null,
            contextId$ = null
        } = params;

        this.capabilityId = capabilityId;
        this.appNotifications = appNotifications;
        this.iconContentId = iconContentId;
        this.itemContentId = itemContentId;
        this.contextId$ = contextId$;
    }
}
