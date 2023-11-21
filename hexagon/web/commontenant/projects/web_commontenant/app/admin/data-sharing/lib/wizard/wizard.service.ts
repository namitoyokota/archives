import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class WizardService {

    /** Bus for wizard close event */
    private close = new Subject<void>();

    /** Stream of close events */
    readonly close$ = this.close.asObservable();

    constructor() { }

    /**
     * Close the wizard
     */
    closeWizard(): void {
        this.close.next();
    }
}
