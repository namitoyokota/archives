import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Alarm$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService } from '../../data.service';
import { ClearAlarmsDialogComponent } from '../clear-alarms-dialog/clear-alarms-dialog.component';
import { TranslationTokens } from './alarms-menu.translation';

@Component({
    selector: 'hxgn-alarms-menu',
    templateUrl: 'alarms-menu.component.html',
    styleUrls: ['alarms-menu.component.scss']
})
export class AlarmsMenuComponent implements OnInit, OnDestroy {

    /** Alarm IDs to manage. */
    @Input() alarmIds: string[];

    /** List of alarms. */
    alarms: Alarm$v1[] = [];

    /** Number of clearable alarms. */
    clearableCount = 0;

    /** Number of non-clearable alarms. */
    nonClearableCount = 0;

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(private alarmStore: StoreService<Alarm$v1>,
        private dataSrv: DataService,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private coreSrv: CoreService) { }

    /** Function ran on component initialization. */
    ngOnInit() {
        this.alarmStore.entity$.pipe(filter(data => !!data), takeUntil(this.destroy$)).subscribe(alarms => {
            // Filter alarms based on the ids passed in
            this.alarms = alarms.filter(alarm => {
                return !!this.alarmIds.find(id => id === alarm.id);
            });

            this.clearableCount = this.alarms.filter(x => !x.isManaged).length;
            this.nonClearableCount = this.alarms.filter(x => x.isManaged).length;
        });

        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
        });
    }

    /** Function ran on component destroy. */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Clears all alarms when there are no associated managed alarms. */
    async clearAlarms() {
        if (await this.coreSrv.confirmDeleteAsync()) {
            const alarms = this.alarms.filter(a => !a.isManaged)
            if (alarms?.length) {
                await this.dataSrv.deleteUnmanagedAlarms$(alarms.map(a => a.id)).toPromise();
            }
        }
    }

    /** Opens clear alarms dialog. */
    openClearDialog() {
        this.dialog.open(ClearAlarmsDialogComponent, {
            height: '550px',
            width: '790px',
            disableClose: true,
            autoFocus: false,
            data: {
                ids: this.alarmIds
            }
        });
    }

    /** Set up routine for localization */
    private initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        this.localizationSrv.localizeStringsAsync(tokens);
    }
}
