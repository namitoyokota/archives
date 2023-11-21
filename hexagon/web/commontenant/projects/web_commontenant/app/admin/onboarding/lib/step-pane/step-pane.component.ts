import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OnboardingStep$v1 } from '@galileo/web_commontenant/_common';

import { StepPaneTranslationTokens } from './step-pane.translation';

@Component({
    selector: 'hxgn-commontenant-step-pane',
    templateUrl: 'step-pane.component.html',
    styleUrls: ['step-pane.component.scss']
})
export class StepPaneComponent {

    /** Onboarding steps */
    @Input() steps: OnboardingStep$v1[];

    /** Id of the step that is selected */
    @Input() selectedStepId: string = null;

    /** List of step ids that have been completed */
    @Input() completedStepIds: string[] = [];

    /** Event when the selected step changes */
    @Output() stepChange = new EventEmitter<OnboardingStep$v1>();

    /** Expose StepPaneTranslationTokens to HTML */
    tokens: typeof StepPaneTranslationTokens = StepPaneTranslationTokens;

    constructor() { }

    /**
     * Returns true if the step has been completed
     * @param stepId Id of the step to check if it is completed
     */
    isStepCompleted(stepId: string): boolean {
        if (!this.completedStepIds) {
            return false;
        }

        return !!this.completedStepIds.find(id => id === stepId);
    }

    /**
     * Sets the given step as being selected
     * @param step The step to select
     */
    setSelected(step: OnboardingStep$v1) {
        if (this.selectedStepId !== step.componentType) {
            this.selectedStepId = step.componentType;
            this.stepChange.emit(step);
        }
    }

    /**
     * Returns true if the step is locked
     * @param step The step to check
     */
    isStepLocked(step: OnboardingStep$v1): boolean {
        if (step.componentType === this.selectedStepId) {
            return false;
        }

        // Check if step is next uncompleted step
        const nextUncompletedStep = this.steps.find(s => {
            if (!this.completedStepIds) {
                return false;
            }

            return !this.completedStepIds.find(id => id === s.componentType);
        });

        if (nextUncompletedStep && nextUncompletedStep.componentType === step.componentType) {
            return false;
        }

        // Check if the step has been completed
        if (!this.completedStepIds) {
            return false;
        }

        return !this.completedStepIds.find(id => id === step.componentType);
    }
}
