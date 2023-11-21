import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { Observable, Subject } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService } from '../../data.service';
import { DetailsMarkerTranslationTokens } from './map-cluster-details-marker.translation';

@Component({
    selector: 'hxgn-alarms-map-cluster-details-marker-v1',
    templateUrl: 'map-cluster-details-marker.component.html',
    styleUrls: ['map-cluster-details-marker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeout', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(300)
            ]),
            transition(':leave', [
                animate(300, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' })),
        ])
    ]
})
/**
 * A component that is intended to be displayed on a map.
 */
export class MapClusterDetailsMarkerComponent implements OnInit, OnDestroy {

    /** The alarm id for the map maker */
    @Input() alarmId: string;

    /** The context id of the parent using this component */
    @Input() contextId: string;

    /** Event fired when the marker icon is clicked  */
    @Output() markerClicked: EventEmitter<Alarm$v1> = new EventEmitter<Alarm$v1>();

    /** Event fired when a clear alarm is completed */
    @Output() alarmCleared: EventEmitter<null> = new EventEmitter<null>();

    /** Translation tokens */
    tokens: typeof DetailsMarkerTranslationTokens = DetailsMarkerTranslationTokens;

    /** The alarm for the map maker */
    alarm$: Observable<Alarm$v1>;

    /** Expose to HTML */
    RestrictIds$v1: typeof RestrictIds$v1 = RestrictIds$v1;

    /** Flag that is set to true will show the title tooltip */
    showToolTip = false;

    /** Flag that is set to true if the alarm is selected */
    isSelected = false;

    /** Flag to indicate the marker should have focus */

    isFocused = false;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose RestrictIds$v1 to the HTML */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    /** The current user's tenant id */
    tenantId: string;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private alarmStore: StoreService<Alarm$v1>,
                private dataSrv: DataService,
                private coreSrv: CoreService,
                private identitySrv: CommonidentityAdapterService$v1) {
    }

    async ngOnInit() {

        if (this.alarmId) {
            this.alarm$ = this.alarmStore.entity$.pipe(
                map(alarms => {
                    return alarms?.find(alarm => alarm.id === this.alarmId);
                })
            );
        }

        this.tenantId = (await this.identitySrv.getUserInfoAsync()).activeTenant;
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Emits a marker clicked event.
     */
    emitMarkerClicked(event: any) {

        event.stopPropagation();
        this.alarm$.pipe(first()).subscribe(alarm => {
            if (!alarm.tombstoned) {
                this.markerClicked.emit(alarm);
            }
        });
    }

    /**
     * Mouse over of map marker
     */
    mouseEnter() {
        this.alarm$.pipe(first()).subscribe(alarm => {
            if (!alarm.tombstoned) {
                this.isFocused = true;
            }
        });
        this.showToolTip = true;
    }

    /**
     * Mouse leaves map marker
     */
    mouseLeave() {
        this.alarm$.pipe(first()).subscribe(alarm => {
            if (!alarm.tombstoned) {
                this.isFocused = false;
            }
        });
        this.showToolTip = false;
    }

    /**
     * Stops events from propagation
     * @param event The event to stop
     */
    stopPropagation(event: any) {
        event.stopPropagation();
    }

    /**
     * Clears the alarm
     */
    async clearAsync(event: MouseEvent) {
        event.stopPropagation();
        const alarm = await this.alarm$.pipe(
            first()
        ).toPromise();
        if (await this.coreSrv.confirmDeleteAsync()) {
            await this.dataSrv.deleteUnmanagedAlarms$([alarm.id]).toPromise();
            this.alarmCleared.emit();
        }
    }
}
