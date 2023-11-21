import { Location$v1 } from '@galileo/web_common-libraries';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export class LocationSelectSettings$v1 {

    /** Default location */
    private location: BehaviorSubject<Location$v1> = new BehaviorSubject<Location$v1>(null);

    /** Default location */
    readonly location$: Observable<Location$v1> = this.location.asObservable();

    /** Notification for when location changes */
    private locationChange = new Subject<Location$v1>();

    /** Observable for address */
    readonly locationChange$ = this.locationChange.asObservable();

    /** Notification for when loading changes */
    private loadingChange = new Subject<boolean>();

    /** Observable for loading */
    readonly loadingChange$ = this.loadingChange.asObservable();

    /**
     * Sets default location
     * @param location Current location object
     */
    setLocation(location: Location$v1): void {
        this.location.next(location);
    }

    /**
     * Emits notification for location change
     * @param location New location object
     */
    locationChanged(location: Location$v1): void {
        this.locationChange.next(location);
    }

    /**
     * Emits notification for loading flag change
     * @param isLoading True when loading 
     */
    loadingChanged(isLoading: boolean): void {
        this.loadingChange.next(isLoading);
    }
}
