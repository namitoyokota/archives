export interface FilterOptions$v1 {

    /** Capability the filter option belongs two */
    capabilityId: string;

    /** Id for filter options */
    id: string;

    /** Name for filter options */
    nameToken: string;

    /** Token for capability name */
    capabilityToken: string;
}

export interface CapabilitySettings$v1 {
    /** Token to use for name */
    nameToken: string;

    /** List of filter options */
    filterOptions: FilterOptions$v1[];

    /** List of subtypes */
    subtypes: FilterOptions$v1[];

    /** Path to icon */
    iconPath: string;

    /** Feature flag that must be enable to be used in channels */
    featureFlag: string;
}
