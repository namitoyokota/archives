import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
/**
 * Events that happens system wide for the capability
 */
export class EventService {

    /** True if the notification panel should be shown */
    private panelShown = new BehaviorSubject<boolean>(false);

    /** True if the notification panel should be shown */
    readonly panelShown$ = this.panelShown.asObservable();

    /** How long should items wait before playing notification sound */
    private readonly coolDownTime = 5000;

    /** Event bus for when a notification sound should be played */
    private playNotificationSound = new Subject<string>();

    /** Event when a notification sound should be played */
    readonly playNotificationSound$ = this.playNotificationSound.asObservable();

    /** A flag that is true if the notification sound cool down is active */
    private coolDown = false;

    /**
     * Sets if the notification panel should be shown
     * @param isShown Flag that is true if the panel should be shown
     */
    showPanel(isShown: boolean): void {
        this.panelShown.next(isShown);
    }

    /**
     * Event that a sound should be played
     */
    playSound(file: string): void {
        // Only event if there is not a cool down
        if (!this.coolDown && !this.panelShown.getValue()) {
            this.coolDown = true;
            this.playNotificationSound.next(file);

            setTimeout(() => {
                this.coolDown = false;
            }, this.coolDownTime);
        }
    }
}
