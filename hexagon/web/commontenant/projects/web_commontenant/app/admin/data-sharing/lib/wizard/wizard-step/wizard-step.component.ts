import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IWizardStepComponent {
    /** UI for the action pane */
    actionPaneRef: TemplateRef<any>;

    /** UI for the description header pane */
    descriptionHeaderPaneRef: TemplateRef<any>;

        /** Should be true if the step has unsaved changes. Some steps maybe dirty by default.*/
    isDirty$: Observable<boolean>;

    /**
     * Returns true if the step is complete. If more processing for the step is
     * required then should return false.
     */
    completeAsync(): Promise<boolean>;
}

/**
 * An interface that any component that is to be part of the wizard must implement
 */
 @Component({
    template: ''
 })
export class WizardStepComponent implements IWizardStepComponent {

    /** UI for the action pane */
    @Input() actionPaneRef: TemplateRef<any>;

    /** UI for the description header pane */
    @Input() descriptionHeaderPaneRef: TemplateRef<any>;

    /** Should be true if the step has unsaved changes. Some steps maybe dirty by default.*/
    private isDirty = new BehaviorSubject<boolean>(false);

    /** Should be true if the step has unsaved changes.  */
    readonly isDirty$ = this.isDirty.asObservable();

    /**
     * Returns true if the step is complete. If more processing for the step is
     * required then should return false.
     */
    completeAsync(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            resolve(true);
        });
    }

    /**
     * Sets if the component is dirty
     * @param dirty Is component dirty
     */
    setIsDirty(dirty: boolean): void {
        this.isDirty.next(dirty);
    }
}
