import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
/**
 * Events that happens system wide for the capability
 */
export class EventService {

    private enabledFeatureFlagsChanged = new Subject<void>();

    /** Event bus for when enabled feature flags has changed */
    readonly enabledFeatureFlagsChanged$ = this.enabledFeatureFlagsChanged.asObservable();

    /**
     * Event that the the list of enabled feature flags has changed
     */
    enabledFeatureFlagChanged() {
        this.enabledFeatureFlagsChanged.next();
    }

}
