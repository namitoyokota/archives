import { ChangeDetectionStrategy, Component, Input, OnDestroy } from '@angular/core';
import { Alarm$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { AlarmWithDeviceAdapterService$v1 } from '@galileo/web_commonassociation/adapter';
import { from, Observable, Subject } from 'rxjs';
import { first, map, mergeMap } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService } from '../../data.service';
import { TranslationTokens } from './devices-menu.translation';

@Component({
    selector: 'hxgn-alarms-devices-menu',
    templateUrl: 'devices-menu.component.html',
    styleUrls: ['devices-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesMenuComponent implements OnDestroy {

    /** Alarm IDs to manage. */
    @Input() alarmIds: string[];

    /** List of alarms from store. */
    alarmList$: Observable<Alarm$v1[]> = this.alarmStore.entity$.pipe(
        map((alarms) => {
            const list = alarms.filter(alarm => {
                return !!this.alarmIds.find(id => id === alarm.id);
            });

            return list;
        })
    );

    /** Stream of device count */
    deviceCount$ = from(this.alarmWithDeviceSrv.getAssociationsAsync()).pipe(
            mergeMap(data => data)
        ).pipe(map(associations => {

        return associations.filter((association) => {
            return !!this.alarmIds.find(id => id === association.alarmId);
        }).reduce((unique, item) => {
            return unique.includes(item) ? unique : [...unique, item];
        }, []).length;
    }));

    /** Number of clearable alarms. */
    clearableCount$ = this.alarmList$.pipe(
        map(alarms => alarms.filter(x => !x.isManaged)?.length)
    );

    /** Number of non clearable alarms. */
    nonClearableCount$ = this.alarmList$.pipe(
        map(alarms => alarms.filter(x => x.isManaged)?.length)
    );

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(private alarmStore: StoreService<Alarm$v1>,
                private alarmWithDeviceSrv: AlarmWithDeviceAdapterService$v1,
                private dataSrv: DataService,
                private coreSrv: CoreService) { }

    /** Function run on component destroy. */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Clears all alarms when there are no associated managed alarms. */
    async clearAlarms() {
        if (await this.coreSrv.confirmDeleteAsync()) {
            this.alarmList$.pipe(first()).subscribe(async alarms => {
                const clearAlarms = alarms.filter(a => !a.isManaged);
                if (clearAlarms?.length) {
                    await this.dataSrv.deleteUnmanagedAlarms$(clearAlarms.map(a => a.id)).toPromise();
                }
            });
        }
    }

}
