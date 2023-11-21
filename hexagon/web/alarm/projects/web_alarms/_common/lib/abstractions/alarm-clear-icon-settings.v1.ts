import { Observable } from 'rxjs';

export class AlarmClearIconSettings$v1 {

    /** Stream of alarm ids */
    alarmIds$: Observable<string[]>;

    /** Whether or not to display the selected icon. */
    selected$: Observable<boolean>;

    /** Whether or not to show the associated device info. */
    showDeviceInfo: boolean;

    constructor(params: AlarmClearIconSettings$v1 = {} as AlarmClearIconSettings$v1) {
        const {
            alarmIds$ = null,
            selected$ = null,
            showDeviceInfo
        } = params;

        this.alarmIds$ = alarmIds$;
        this.selected$ = selected$;
        this.showDeviceInfo = showDeviceInfo;
    }
}
