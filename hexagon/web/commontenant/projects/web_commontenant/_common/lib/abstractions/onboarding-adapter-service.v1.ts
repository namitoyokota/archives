import { Observable } from 'rxjs';

/**
 * Interface for the onboarding adapter service
 */
export interface OnboardingAdapterService$v1 {

    /** Event that is fired when the save button is clicked*/
    save$: Observable<void>;

    /** Sets the enabled state of the save and continue button */
    setSaveEnabled(isEnabled: boolean): void;

    /** Notify the onboarding wizard that saving is complete */
    saveComplete(): void;
}
