import { AfterViewInit, Component, ComponentRef, HostBinding, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
    AppNotification$v1,
    capabilityId,
    InjectableComponentNames,
    LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commonnotifications/_common';
import { Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

import { EventService } from '../../event.service';
import { NotificationStoreService } from '../../notification-store.service';

@Component({
    templateUrl: 'notification-btn.component.html',
    styleUrls: ['notification-btn.component.scss']
})

export class NotificationBtnComponent implements OnInit, AfterViewInit, OnDestroy {

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private contextId$: Observable<string>,
        private layoutAdapter: LayoutCompilerAdapterService,
        private eventSrv: EventService,
        private storeSrv: NotificationStoreService
    ) { }

    /** How many notifications has not been seen? */
    unseenCount$ = this.storeSrv.entity$.pipe(
        map(notifications => {
            return notifications.filter(n => {
                return !n.hasBeenSeen;
            })?.length;
        })
    );

    /** Id of the custom overlay that is being used by notifications */
    private overlayId: string;

    /** Reference to the injected component */
    private ref: ComponentRef<any>;

    /** Active class state */
    isActive = false;

    /** Apply class when notifications exist */
    @HostBinding('class.has-notifications') hasNotifications = false;

    /** Apply class when there are more then 99 notifications */
    @HostBinding('class.large') largeCount = false;

    /**  Observable for component destroyed. Used to clean up subscriptions. */
    private destroy$ = new Subject<boolean>();

    /** Component is clicked */
    @HostListener('click', [])
    onClick() {
        this.isActive = !this.isActive;
        this.eventSrv.showPanel(this.isActive);
        this.hasNotifications = false;
    }

    /** On init lifecycle hook */
    ngOnInit() {
        // Listen to panel changes
        this.eventSrv.panelShown$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(isShown => {
            // Clean up count. Any notification that already exist has already been seen by the user
            if (!isShown) {
                this.storeSrv.entity$.pipe(first()).subscribe((list => {
                    list.forEach(n => {
                        const update = new AppNotification$v1<string, string>(n);
                        update.hasBeenSeen = true;
                        this.storeSrv.upsert(update);
                    });

                    this.isActive = isShown;
                }));

            } else {
                this.isActive = isShown;
            }
        });

        this.unseenCount$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(count => {
            if (!this.isActive) {
                this.largeCount = count > 99;
                this.hasNotifications = !!count;
            } else {
                this.largeCount = false;
                this.hasNotifications = false;
            }
        });
    }

    /** After view init lifecycle hook */
    async ngAfterViewInit(): Promise<void> {
        this.overlayId  = await this.layoutAdapter.createCustomOverlayAsync(100);

        // Now inject the component into the overlay
        this.ref = await this.layoutAdapter.delegateInjectComponentPortalAsync(
            InjectableComponentNames.notificationOverlay,
            capabilityId, '#' + this.overlayId, this.contextId$);
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();

        if (this.ref) {
            this.ref.destroy();
        }
        this.layoutAdapter.removeCustomOverlayAsync(this.overlayId);
    }
}
