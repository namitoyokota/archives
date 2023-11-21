import { Observable } from 'rxjs';

export class AlarmStatusSettings$v1 {

    /** Stream of alarm ids */
    alarmIds$: Observable<string[]>;

    /** Whether or not to show the border around the icon */
    showBorder: boolean;

    /** Whether or not to show the border shadow around the icon */
    showBorderShadow: boolean;

    constructor(params: AlarmStatusSettings$v1 = {} as AlarmStatusSettings$v1) {
        const {
            alarmIds$ = null,
            showBorder = false,
            showBorderShadow = false
        } = params;

        this.alarmIds$ = alarmIds$;
        this.showBorder = showBorder;
        this.showBorderShadow = showBorderShadow;
    }
}
