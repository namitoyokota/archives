export class OnboardingStep$v1 {
    /** The component type to portal inject into the onboarding UI */
    componentType: string;

    /** Translation token for the name of the section */
    nameToken: string;

    /** Path to the icon section icon */
    iconPath: string;

    /** What order should the section appear in the list.  This order is relative to every section. */
    orderPreference: number;

    /** Capability id the step is part of */
    capabilityId: string;

    /** List of application ids this step is for */
    applicationIds: string [];
}
