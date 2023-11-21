import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { DisplayPriority$v1, MapCommunication$v1, Marker$v1, MarkerDescriptor$v1 } from '@galileo/web_commonmap/adapter';
import { Subject, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';

export interface MarkerSettings {
    alarmId: string;
    mapComm: MapCommunication$v1;
}

@Component({
    templateUrl: 'map-marker.component.html',
    styleUrls: ['map-marker.component.scss'],
    animations: [
        trigger('fadeout', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(200)
            ]),
            transition(':leave', [
                animate(200, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' })),
        ])
    ]
})

export class MapMarkerInjectableComponent implements OnInit, OnDestroy {

    /** The alarm for the map marker */
    alarm: Alarm$v1;

    /** Flag that is set to true will show the title tooltip */
    showToolTip = false;

    /** Flag that is set to true if the alarm is selected */
    isSelected = false;

    /** Flag to indicate the marker should have focus */
    isFocused = false;

    private marker: Marker$v1;
    private compSettings: MarkerSettings;
    private markerClickedRef$: Subscription;
    private destroy$: Subject<boolean> = new Subject<boolean>();
    private contextId: string;

    constructor(private cdr: ChangeDetectorRef,
                private alarmStore: StoreService<Alarm$v1>,
                private actionStore: ActionStoreService,
                private ffAdapter: CommonfeatureflagsAdapterService$v1,
                @Inject(LAYOUT_MANAGER_SETTINGS) private data: any) {
        if (data instanceof Marker$v1) {
            this.marker = data;
            this.compSettings = this.marker.markerSettings.properties;
        }
        this.contextId = data.contextId;
    }

    ngOnInit() {
        this.alarm = this.alarmStore.snapshot(this.compSettings.alarmId);

        if (this.contextId) {
            this.listenToSelectionChangeEvent();
        }
        this.listenToUpdateEvent();

        if (this.contextId) {
            this.markerClickedRef$ = this.marker.markerClicked$.subscribe((markerDesc: MarkerDescriptor$v1) => {
                if (this.isSelected) {
                    this.actionStore.multiselect(this.contextId, null, false);
                } else {
                    this.actionStore.multiselect(this.contextId, [this.alarm.id], false);
                }
            });
        }
    }

    ngOnDestroy() {
        if (this.markerClickedRef$) {
            this.markerClickedRef$.unsubscribe();
            this.markerClickedRef$ = null;
        }
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Mouse over of map marker
     */
    mouseEnter() {
        if (!this.isSelected) {
            this.marker.setDisplayPriority(DisplayPriority$v1.Top);
            this.isFocused = true;
        }
        this.showToolTip = true;
    }

    /**
     * Mouse leaves map marker
     */
    mouseLeave() {
        if (!this.isSelected) {
            this.marker.setDisplayPriority(DisplayPriority$v1.Normal);
            this.isFocused = false;
        }
        this.showToolTip = false;
    }

    /**
     * Listen for alarm selection change event
     */
    private listenToSelectionChangeEvent() {
        this.actionStore.multiselect$(this.data.contextId).pipe(
            takeUntil(this.destroy$)
        ).subscribe((data) => {
            if (data && this.alarm) {
                if (data?.items?.some(item => item.entityId === this.alarm.id)) {
                    this.isSelected = true;
                } else {
                    this.isSelected = false;
                }
            }
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }

    /**
     * Listen to alarm update events
     */
    private listenToUpdateEvent() {
        this.alarmStore.upserted$.pipe(
            filter(changes => !!changes?.updates?.length),
            map(alarms => alarms.updates.find(a => a.id === this.alarm.id)),
            filter((alarm) => !!alarm),
            takeUntil(this.destroy$)
        ).subscribe((alarm) => {
            this.alarm = alarm;
            this.cdr.markForCheck();
            this.cdr.detectChanges();
        });
    }
}
