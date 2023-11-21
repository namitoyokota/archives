import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tenant$v1 } from '@galileo/web_commontenant/_common';
import { filter, map } from 'rxjs/operators';
import { OnboardingStep$v1 } from '@galileo/web_commontenant/_common';

@Injectable()
export class OnboardingStore {

    /** Bus for is loading changes */
    private isLoading = new BehaviorSubject<boolean>(true);

    /** Bus for step changes */
    private steps = new BehaviorSubject<OnboardingStep$v1[]>(null);

    /** Bus for active step changes */
    private activeStep = new BehaviorSubject<OnboardingStep$v1>(null);

    /** Flag that is true with the UI is loading */
    readonly isLoading$ = this.isLoading.asObservable();

    /** Onboarding steps */
    readonly steps$ = this.steps.asObservable().pipe(
        filter(steps => !! steps),
        map(steps => {
            return steps.sort((a, b) => a.orderPreference - b.orderPreference);
        })
    );

    /** The step that is currently active */
    readonly activeStep$ = this.activeStep.asObservable().pipe(
        filter(step => !!step)
    );


    /**
     * Sets the state of the is loading flag
     * @param isLoading Flag that is true with the UI is loading
     */
    setIsLoading(isLoading: boolean) {
        this.isLoading.next(isLoading);
    }

    /**
     * Sets the onboarding steps
     * @param steps The steps that must be completed as part of onboarding
     */
    setSteps(steps: OnboardingStep$v1[]) {
        this.steps.next(steps);
    }

    /**
     * Sets the the active step
     * @param step The step to set as being active
     */
    setActiveStep(step: OnboardingStep$v1) {
        this.activeStep.next(step);
    }

    /**
     * Returns the last completed step
     */
    findLastStep$(): Observable<OnboardingStep$v1> {
        return new Observable(obs => {
            const activeStep = this.activeStep.getValue();
            const currentIndex = this.steps.getValue().findIndex(step => step.componentType === activeStep.componentType);
            if (currentIndex === 0) {
                obs.next(this.activeStep.getValue());
            } else {
                obs.next(this.steps.getValue()[currentIndex - 1]);
            }
            obs.complete();
        });
    }

    /**
     * Returns true if the active step is the first step
     */
    isActiveStepFirstStep$(): Observable<boolean> {
        return new Observable(obs => {
            const activeStep = this.activeStep.getValue();
            obs.next(activeStep &&
                this.steps.getValue().findIndex(step => step.componentType === activeStep.componentType) === 0
            );
            obs.complete();
        });
    }
}
