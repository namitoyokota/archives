import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Alarm$v1, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { StoreService } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './alarm-filter.translation';

@Component({
    selector: 'hxgn-alarms-list-filter',
    templateUrl: 'alarm-filter.component.html',
    styleUrls: ['alarm-filter.component.scss']
})
export class AlarmFilterComponent implements OnInit, OnDestroy {

    private alarmIds$ = new BehaviorSubject<string[]>([]);

    /** List of alarm ids */
    @Input('alarmIds')
    set setAlarmIds(ids: string[]) {
        this.alarmIds$.next([].concat(ids));
    }

    /** Custom values from user. */
    @Input() customValues: Map<string, string>;

    /** Outputs the filtered alarm ids based on dropdown selection. */
    @Output() filteredAlarmsIds = new EventEmitter<string[]>();

    /** Outputs the translated filter status. */
    @Output() filteredStatus = new EventEmitter<string>();

    /** Outputs the selected value from the dropdown. */
    @Output() selectedValue = new EventEmitter<string>();


    /** List of alarms from store. */
    alarms$: Observable<Alarm$v1[]> = combineLatest([
        this.alarmStore.entity$.pipe(
            filter(alarms => !!alarms)
        ),
        this.alarmIds$
    ]).pipe(map(([alarms, ids]) => {
        return alarms.filter(alarm => {
            return !!ids?.find(id => id === alarm.id);
        });
    }));

    /** Used to set initial alarms on page load. */
    hasLoaded = false;

    /** Selected status type from dropdown. */
    selectedStatusType = 'all';

    /** Status types for dropdown. */
    statusTypes: Map<string, string> = new Map<string, string>();

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Subscription to alarms list */
    alarmSub: Subscription;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private alarmStore: StoreService<Alarm$v1>,
        private localizationSrv: CommonlocalizationAdapterService$v1) { }

    /** On init life cycle method */
    ngOnInit() {
        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
        });
    }


    /** On destroy life cycle method */
    ngOnDestroy() {
        if (this.alarmSub) {
            this.alarmSub.unsubscribe();
        }

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /** Filter ids on dropdown change. */
    async filterChange(event: MatSelectChange) {
        this.selectedStatusType = event.value;

        this.filterAlarmsAsync();
    }

    private async filterAlarmsAsync() {
        let filteredIds: string[] = [];
        let filteredStatus = '';
        const alarms = await this.alarms$.pipe(first()).toPromise();

        if (this.customValues && this.customValues.has(this.selectedStatusType)) {
            filteredIds = alarms.map(a => a.id);
            filteredStatus = await this.localizationSrv.getTranslationAsync(this.customValues.get(this.selectedStatusType));
        } else {
            switch (this.selectedStatusType) {
                case '0':
                    filteredIds = alarms.filter(x => !x.isRedacted(RestrictIds$v1.priority) && x.priority === 0).map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusCritical);
                    break;
                case '1':
                    filteredIds = alarms.filter(x => !x.isRedacted(RestrictIds$v1.priority) && x.priority === 1).map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusHigh);
                    break;
                case '2':
                    filteredIds = alarms.filter(x => !x.isRedacted(RestrictIds$v1.priority) && x.priority === 2).map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusMedium);
                    break;
                case '3':
                    filteredIds = alarms.filter(x => !x.isRedacted(RestrictIds$v1.priority) && x.priority >= 3).map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusLow);
                    break;
                case 'unknown':
                    filteredIds = alarms.filter(x => x.isRedacted(RestrictIds$v1.priority)).map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusUnknown);
                    break;
                default:
                    filteredIds = alarms.map(a => a.id);
                    filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusAll);
            }
        }

        this.selectedValue.emit(this.selectedStatusType);
        this.filteredAlarmsIds.emit(filteredIds);
        this.filteredStatus.emit(filteredStatus);
    }

    /**
     * Set up routine for localization
     */
    private async initLocalization() {
        this.statusTypes.set('all', TranslationTokens.statusAll);
        this.statusTypes.set('0', TranslationTokens.statusCritical);
        this.statusTypes.set('1', TranslationTokens.statusHigh);
        this.statusTypes.set('2', TranslationTokens.statusMedium);
        this.statusTypes.set('3', TranslationTokens.statusLow);
        this.statusTypes.set('unknown', TranslationTokens.statusUnknown);

        // Need to clean up
        this.alarmSub = this.alarms$.subscribe(() => {
            this.filterAlarmsAsync();
        });

        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const filteredStatus = await this.localizationSrv.getTranslationAsync(TranslationTokens.statusAll);
        this.filteredStatus.emit(filteredStatus);
    }
}
