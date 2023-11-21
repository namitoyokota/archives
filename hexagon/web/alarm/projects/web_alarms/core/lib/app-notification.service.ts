import { ComponentRef, Injectable, Injector } from '@angular/core';
import { Alarm$v1, capabilityId, InjectableComponentNames, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { AppNotification$v1, AppNotificationService$v1 } from '@galileo/web_commonnotifications/adapter';
import { combineLatest, Observable } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';

import { AppNotificationSettings } from './injectable-components/app-notification/app-notification-settings';

export enum AppNotificationType {
    unknown = 'Unknown',
    newAlarm = 'NewAlarm',
    alarmClosed = 'AlarmClosed',
    alarmUpdate = 'AlarmUpdate'
}

export enum AppNotificationSubtype {
    unknown = 'Unknown',
    remarkAdded = 'RemarkAdded',
    mediaAdded = 'MediaAdded'
}

enum AppNotificationTranslationTokens {
    newAlarm = 'alarm-core.notification.newAlarm',
    alarmClosed = 'alarm-core.notification.alarmClosed',
    alarmUpdate = 'alarm-core.notification.alarmUpdate'
}

@Injectable()
export class AppNotificationService extends AppNotificationService$v1 {

    constructor(
        injector: Injector, private store: StoreService<Alarm$v1>,
        private layoutAdapter: LayoutCompilerAdapterService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        super(injector);
    }

    /**
     * Return the color the notification should be
     * @param notifications$  Stream of notifications
     */
    getNotificationColorAsync(
        notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>
    ): Promise<Observable<string>> {
        return new Promise<Observable<string>>(resolve => {
           const color$ = combineLatest([
               this.store.entity$,
               notifications$
           ]).pipe(
               map(([alarms, n]) => {
                    // Get the main alarm for notification
                    const alarm = alarms.find(a => a.id === n[0].id);
                    if (!alarm || alarm.isRedacted(RestrictIds$v1.priority)) {
                        return '#9EA0A3';
                    }

                    switch (alarm.priority) {
                        case 0:
                            return '#e01827';
                        case 1:
                            return '#ff8429';
                        case 2:
                            return '#ebd444';
                        case 3:
                        default:
                            return '#3474ff';
                    }
               })
           );

           resolve(color$);
        });
    }

    /**
     * Returns the title for the notification
     * @param notifications$ Stream of notifications
     */
    getNotificationTitleAsync(
        notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>
    ): Promise<Observable<string>> {
        return new  Promise<Observable<string>>(resolve => {
            resolve(notifications$.pipe(
                flatMap(async notifications => {
                    let token: AppNotificationTranslationTokens;
                    switch (notifications[0].notificationType) {
                      case AppNotificationType.alarmClosed:
                        token = AppNotificationTranslationTokens.alarmClosed;
                        break;
                      case AppNotificationType.alarmUpdate:
                        token = AppNotificationTranslationTokens.alarmUpdate;
                        break;
                    case AppNotificationType.newAlarm:
                        token = AppNotificationTranslationTokens.newAlarm;
                        break;
                    }

                    await this.localizationAdapter.localizeStringAsync(token);
                    const name: string = await this.localizationAdapter.getTranslationAsync(token);
                    return name;
                })
            ));
        });
    }

    /**
     * Inject the icon component
     * @param notifications$ Stream of notifications
     * @param id Id of the container where the component will be injected
     */
    injectIconAsync(
        notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>,
        id: string
    ): Promise<ComponentRef<any>> {
        return new Promise<ComponentRef<any>>(async resolve => {

            const id$ = notifications$.pipe(
                map(notifications => {
                    return notifications[0].id;
                })
            );

            resolve(
                await this.layoutAdapter.delegateInjectComponentPortalAsync(
                    InjectableComponentNames.iconComponent,
                    capabilityId, `#${id}`, id$
                )
            );
        });
    }

    /**
     * Inject the item component
     * @param notifications$ Stream of notifications
     * @param id Id of the container where the component will be injected
     * @param contextId$ Stream for context id that the component will use
     */
    injectItemAsync(
        notifications$: Observable<AppNotification$v1<AppNotificationType, AppNotificationSubtype>[]>,
        id: string, contextId$: Observable<string>
    ): Promise<ComponentRef<any>> {
        return new Promise<ComponentRef<any>>(async resolve => {
            resolve(
                await this.layoutAdapter.delegateInjectComponentPortalAsync(
                    InjectableComponentNames.appNotificationComponent,
                    capabilityId, `#${id}`, new AppNotificationSettings({
                        contextId$, notifications$
                    })
                )
            );
        });
    }

    /**
     * Returns the capability id
     */
    getCapabilityId(): string {
        return capabilityId;
    }

}
