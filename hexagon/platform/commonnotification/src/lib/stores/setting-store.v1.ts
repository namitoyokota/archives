import { Store$v1 } from '@galileo/platform_common-libraries';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NotificationSettings$v1 } from '../abstractions/notification-settings.v1';

export class NotificationSettingsStore$v1 extends Store$v1<NotificationSettings$v1> {
    /** Stream of the current default settings. Used by the runtime */
    readonly defaultSettings$: Observable<NotificationSettings$v1> = this.entity$.pipe(
        map(list => {
            return list.find(item => item.isDefault);
        })
    );

    /** A flag that is true if the user has sound enabled */
    enableSound = true;

    constructor() {
        super('preset', NotificationSettings$v1);
    }
}
