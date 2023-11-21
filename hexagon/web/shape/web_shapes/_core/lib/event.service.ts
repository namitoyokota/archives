import { Injectable } from '@angular/core';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Events that happens system wide for the capability
 */
export class EventService {

    /** Event when a minute has passed */
    readonly minuteTick$ = interval(60000);
}
