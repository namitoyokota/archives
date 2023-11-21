import { Request } from 'abstractions/request';
import { SaveStatus } from 'abstractions/save-status';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { first } from 'rxjs/operators';

export class AutosaveService {
    /** Current status of the save */
    private status = new BehaviorSubject<SaveStatus>(SaveStatus.SAVED);

    /** Current status of the save */
    status$ = this.status.asObservable();

    /** Request object to save on the next trigger */
    private requestToSave: Request = null;

    /** Indicates error happened on last API call */
    private errorExists = false;

    /** Observable for timer ticks */
    private timer$: Observable<number>;

    /** Subscription listening to latest timer */
    private timerSubscription: Subscription;

    /** Frequency of the timer tick in milliseconds */
    private readonly tickFrequency = 5000;

    constructor() {}

    /**
     * Requests service to save assessment on the next tick
     * @param request Assessment data to save
     */
    requestSave(request: Request): void {
        this.timerSubscription?.unsubscribe();

        this.timer$ = timer(this.tickFrequency);
        this.requestToSave = request;
        this.errorExists = false;
        this.status.next(SaveStatus.UNSAVED);

        this.listenToTimer();
    }

    /**
     * Saves assessment at the moment of the request
     * @param request Assessment data to save
     */
    async saveNow(request: Request): Promise<void> {
        this.status.next(SaveStatus.UNSAVED);
        this.requestToSave = request;
        this.errorExists = false;

        return this.saveData();
    }

    /** Empties save request */
    clearRequest(): void {
        this.status.next(SaveStatus.SAVED);
        this.requestToSave = null;
        this.errorExists = false;
    }

    /** Triggers save on timer tick */
    private listenToTimer(): void {
        this.timerSubscription = this.timer$.pipe(first()).subscribe(() => {
            const triggerSave = this.requestToSave && !this.errorExists && this.status.getValue() === SaveStatus.UNSAVED;
            if (triggerSave) {
                this.saveData();
            }
        });
    }

    /** Calls API to save data */
    private async saveData(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.status.next(SaveStatus.SAVING);

            this.mockApiRequest()
                .then(() => {
                    this.clearRequest();
                    resolve();
                })
                .catch(() => {
                    this.status.next(SaveStatus.UNSAVED);
                    this.errorExists = true;

                    reject();
                });
        });
    }

    /** This is a mock API request */
    private mockApiRequest(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.clearRequest();
                resolve();
            }, 1000);
        });
    }
}
