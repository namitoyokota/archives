import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Guid } from '@galileo/web_common-libraries';
import { CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { LAYOUT_MANAGER_SETTINGS, Shape$v1 } from '@galileo/web_shapes/_common';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, first, map } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';
import { AppNotificationSubtype, AppNotificationType } from '../../app-notification.service';
import { ShapeStoreService } from '../../shape-store.service';
import { TombstonedService } from '../../tombstoned.service';
import { AppNotificationSettings } from './app-notification-settings';
import { AppNotificationTranslationTokens } from './app-notification.translation';

enum InterpolationTokens {
    shape = 'shape',
    tenant = 'tenant',
    count = 'count'
}

@Component({
    templateUrl: 'app-notification.component.html',
    styleUrls: ['app-notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppNotificationComponent implements OnInit, OnDestroy {

    /** Stream of shape ids */
    shapeIds$: Observable<string[]>;

    /** Stream of shapes to display data for */
    shapes$: Observable<Shape$v1[]>;

    /** The main notification type */
    notificationType: AppNotificationType;

    /** The main notification subtype */
    notificationSubtype: AppNotificationSubtype;

    /** Main notification shape id */
    shapeId: string;

    /** Tenant to the unit from the main notification */
    tenant: Tenant$v1;

    /** Flag that is true when the translation component should be shown */
    isReady = false;

    /** Translation token for msg */
    token: AppNotificationTranslationTokens;

    /** Expose possible interpolation token strings to HTML */
    InterpolationTokens: typeof InterpolationTokens = InterpolationTokens;

    /** Guid used for tombstone service */
    private dataContext = Guid.NewGuid();

    /** Subscription for notification updates */
    private notificationSub: Subscription;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: AppNotificationSettings,
        private store: ShapeStoreService,
        private tenantAdapter: CommontenantAdapterService$v1,
        private actionStore: ActionStoreService,
        private tombstonedSrv: TombstonedService,
        private cdr: ChangeDetectorRef
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        // Gather notification information
        await this.settings.notifications$.pipe(
            first()
        ).toPromise().then(async notificationList => {

            // Make sure tombstoned items are loaded
            const loadMap = new Map<string, string[]>();
            notificationList.forEach(notification => {
                if (loadMap.has(notification.tenantId)) {
                    let list = loadMap.get(notification.tenantId);
                    list.push(notification.id);
                    list = [...new Set(list)];
                    loadMap.set(notification.tenantId, list);
                } else {
                    loadMap.set(notification.tenantId, [notification.id]);
                }
            });

            // Lock items
            const lockList: Promise<void>[] = [];
            loadMap.forEach((list, key) => {
                lockList.push(this.tombstonedSrv.lockAsync(list, this.dataContext, key));
            });

            // Wait for locks to finish
            if (lockList?.length) {
                await Promise.all(lockList);
            }

            this.notificationType = notificationList[0].notificationType;
            this.shapeId = notificationList[0].id;
            this.tenant = await this.getTenantAsync();
        });

        // Retrieve list of shape ids filtering duplicates
        this.shapeIds$ = this.settings.notifications$.pipe(
            map(notifications => {
                return [...new Set(notifications.map(n => n.id))];
            })
        );

        // Find the list of shapes and return at max 2
        this.shapes$ = combineLatest([
            this.shapeIds$, this.store.entity$
        ]).pipe(
            map(([ids, shapes]) => {
                return shapes.filter(unit => {
                    return !!ids.find(id => id === unit.id);
                }).slice(0, 2);
            })
        );

        // Listen for any notification messages
        this.notificationSub = this.settings.notifications$.subscribe(async () => {
            this.isReady = false;
            this.cdr.markForCheck();
            this.cdr.detectChanges();

            this.token = await this.getTokenAsync();
            this.isReady = true;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    /** On destroy hook */
    ngOnDestroy() {
        if (this.notificationSubtype) {
            this.notificationSub.unsubscribe();
        }
        this.tombstonedSrv.release(this.dataContext);
    }

    /** Select the clicked on item */
    async selectAsync(id: string, event: MouseEvent): Promise<void> {
        event.stopPropagation();
        const contextId = await this.settings.contextId$.pipe(first()).toPromise();
        this.actionStore.multiselect(contextId, [id], false);
    }

    /** Returns the token that is used to translate the notification message */
    async getTokenAsync() {
        return this.shapeIds$.pipe(
            first(),
            map(ids => {
                switch (this.notificationType) {
                    case AppNotificationType.newShape:
                        if (ids.length === 1) {
                            return AppNotificationTranslationTokens.shapeFrom;
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.shapes;
                        } else {
                            return AppNotificationTranslationTokens.shapesAndMoreShapes;
                        }
                    case AppNotificationType.shapeUpdate:
                        if (ids.length === 1) {
                            return AppNotificationTranslationTokens.shapeUpdates;
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.shapesUpdates;
                        } else {
                            return AppNotificationTranslationTokens.shapesAndMoreUpdates;
                        }
                    case AppNotificationType.shapeDeleted:
                        if (ids.length === 1) {
                            return AppNotificationTranslationTokens.shapeDeletedBy;
                        } else if (ids.length === 2) {
                            return AppNotificationTranslationTokens.shapesDeletedBy;
                        } else {
                            return AppNotificationTranslationTokens.shapeAndMoreDeleted;
                        }
                }
            })
        ).toPromise();
    }

    /** Returns the tenant for the main shape */
    async getTenantAsync(): Promise<Tenant$v1> {
        const shape = await this.store.entity$.pipe(
            map(shapes => {
                return shapes.find(shape => shape.id === this.shapeId);
            }),
            filter(shapes => !!shapes),
            first()
        ).toPromise();

        return await this.tenantAdapter.getTenantAsync(shape.tenantId);
    }
}
