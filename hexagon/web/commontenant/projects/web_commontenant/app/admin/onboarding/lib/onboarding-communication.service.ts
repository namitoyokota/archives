import { Injectable } from '@angular/core';
import { OnboardingModule } from './onboarding.module';
import { OnboardingAdapterService$v1 } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class OnboardingCommunicationService implements OnboardingAdapterService$v1 {

    /** Bus for save enabled state changes */
    private saveEnabled = new BehaviorSubject<boolean>(false);

    /** Bus for save is complete notifications */
    private saveIsComplete = new Subject<void>();

    /** Bus for save event notifications */
    private save = new Subject<void>();

    /** Flag that is true when the save button is enabled */
    readonly saveEnabled$ = this.saveEnabled.asObservable();

    /** Notification that is fried when save is completed */
    readonly saveIsComplete$ = this.saveIsComplete.asObservable();

    /** Event that is raised when onboarding is suppose to save */
    readonly save$ = this.save.asObservable();

    /**
     * Sets the enabled state of the save and continue button
     * @param isEnabled Flag that is true when the save button is enabled
     */
    setSaveEnabled(isEnabled: boolean) {
        if (isEnabled !== this.saveEnabled.getValue()) {
            // This has to be done in the next CD tick
            setTimeout(() => {
                this.saveEnabled.next(isEnabled);
            });
        }
    }

    /**
     * Notify the onboarding wizard that saving is complete
     */
    saveComplete() {
        this.saveIsComplete.next();
    }

    /**
     * Fire off the save event
     */
    startSave() {
        this.save.next();
    }

}
