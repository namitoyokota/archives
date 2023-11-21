import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class AlarmMediaSettings$v1 {

    /** Stream of alarm ids */
    alarmIds$?: Observable<string[]>;

    private isRedacted = new BehaviorSubject<boolean>(null);

    /** Observable to determine if property is redacted. */
    readonly isRedacted$ = this.isRedacted.asObservable().pipe(
        filter(data => data != null)
    );

    constructor(alarmIds$: Observable<string[]>) {
        this.alarmIds$ = alarmIds$;
    }

    /**
     * Sets if media is redacted
     * @param isRedacted Flag that is true if media is redacted
     */
    setIsRedacted(isRedacted: boolean) {
        this.isRedacted.next(isRedacted);
    }
}
