import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class AlarmFilterSettings$v1 {

    /** Notification for when alarmIds change */
    private alarmIds = new BehaviorSubject<string[]>(null);

    /** Observable for alarm ids. */
    readonly alarmIds$ = this.alarmIds.asObservable().pipe(
        filter(ids => !!ids)
    );

    /** Notification for when customValues change */
    private customValues = new BehaviorSubject<Map<string, string>>(null);

    /** Observable for custom values. */
    readonly customValues$ = this.customValues.asObservable().pipe(
        filter(value => !!value)
    );

    /** Notification for when filteredAlarmIds change */
    private filteredAlarmIds = new BehaviorSubject<string[]>(null);

    /** Observable for the filtered alarm ids. */
    readonly filteredAlarmIds$ = this.filteredAlarmIds.asObservable().pipe(
        filter(ids => !!ids)
    );

    /** Notification for when filteredStatus changes */
    private filteredStatus = new BehaviorSubject<string>(null);

    /** Observable for filtered status. */
    readonly filteredStatus$ = this.filteredStatus.asObservable().pipe(
        filter(status => !!status)
    );

    /** Notification for when selectedValue changes */
    private selectedValue = new BehaviorSubject<string>(null);

    /** Observable for selected value. */
    readonly selectedValue$ = this.selectedValue.asObservable().pipe(
        filter(value => !!value)
    );

    constructor() { }

    /**
     * Set the alarm ids
     * @param alarmIds Alarm ids
     */
    setAlarmIds(alarmIds: string[]) {
        this.alarmIds.next(alarmIds);
    }

    /**
     * Set the custom values
     * @param customValues Custom values
     */
    setCustomValues(customValues: Map<string, string>) {
        this.customValues.next(customValues);
    }

    /**
     * Sets filtered alarm ids
     * @param filteredIds Filtered alarm ids
     */
    setFilteredAlarmIds(filteredIds: string[]) {
        this.filteredAlarmIds.next(filteredIds);
    }

    /**
     * Sets filtered status
     * @param status Filtered status
     */
    setFilteredStatus(status: string) {
        this.filteredStatus.next(status);
    }

    /**
     * Sets selected  value
     * @param selectedValue Selected  value
     */
    setSelectedValue(selectedValue: string) {
        this.selectedValue.next(selectedValue);
    }
}
