import { OnboardingStep$v1 } from './onboarding-step.v1';

/**
 * Setting needed to be compatible with the tenant onboarding process
 */
export class OnboardingOptions$v1 {

    /** Steps to show in the onboarding UI */
    steps: OnboardingStep$v1[];
}
