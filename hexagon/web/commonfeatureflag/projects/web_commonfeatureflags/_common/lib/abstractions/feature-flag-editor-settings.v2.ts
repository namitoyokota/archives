import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { FeatureFlag$v2 } from './feature-flag.v2';

/** Object used to communicate between the adapter feature flag editor and the core's component */
export class FeatureFlagEditorSettings$v2 {

    private tenantId: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    /** Notification for when tenantId changes */
    readonly tenantId$: Observable<string> = this.tenantId.asObservable().pipe(
        filter(id => !!id)
    );

    private save: Subject<void> = new Subject<void>();

    /** Signal to save changes */
    readonly save$: Observable<void> = this.save.asObservable();

    private cancel: Subject<void> = new Subject<void>();

    /** Signal to cancel changes */
    readonly cancel$: Observable<void> = this.cancel.asObservable();

    private dirty: Subject<boolean> = new Subject<boolean>();

    /** Notification for when flag changes */
    readonly dirty$: Observable<boolean> = this.dirty.asObservable();

    private completed: Subject<void> = new Subject<void>();

    /** Notification for when flags changes */
    readonly completed$: Observable<void> = this.completed.asObservable();

    /** List of disabled flags. */
    private readonly disabledFlags: BehaviorSubject<FeatureFlag$v2[]> = new BehaviorSubject<FeatureFlag$v2[]>([]);

    /** Disabled flags observable. */
    readonly disabledFlags$: Observable<FeatureFlag$v2[]> = this.disabledFlags.asObservable();

    constructor() { }

    /**
     * Finished saving
     */
    complete(): void {
        this.completed.next();
    }

    /**
     * Whether changes have been made or discarded
     */
    isDirty(flag: boolean): void {
        this.dirty.next(flag);
    }

    /**
     * Signal component to save changed states
     */
    saveChanges(): void {
        this.save.next();
    }

    /**
     * Signal component to cancel any changes
     */
    cancelChanges(): void {
        this.cancel.next();
    }

    /**
     * Sets the active tenant id
     * @param id Tenant id
     */
    setTenant(id: string): void {
        this.tenantId.next(id);
    }

    /**
     * Gets the active tenant id
     */
    getTenant(): string {
        return this.tenantId.value;
    }

    /**
     * Sets list of disabled flags.
     * @param disabledFlags List of disabled flags
     */
    setDisabledFlags(disabledFlags: FeatureFlag$v2[]) {
        this.disabledFlags.next(disabledFlags);
    }

    /**
     * Clears list of disabled flags.
     */
    clearDisabledFlags(): void {
        this.disabledFlags.next([]);
    }
}
