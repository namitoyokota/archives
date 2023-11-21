export class MapAdminComponentData$v1 {
    /** Localization token needed for name of the map admin component  */
    nameToken: string;

    /** Translated name */
    name?: string;

    /** Capability Id of the capability that hosts the admin component */
    capabilityId?: string;

    /** String name of the injectable component that will provide the UX for the admin */
    componentName?: string;

    /** Icon representing the map capability.  This will be used in the admin selector on the map setup page */
    icon?: string;

    /** Name of feature flag id if required */
    featureFlagId?: string;

    /** Name of license feature id if required */
    licenseFeatureId?: string;

    constructor(params = {} as MapAdminComponentData$v1) {
        const {
            nameToken,
            name,
            capabilityId,
            componentName,
            icon,
            featureFlagId,
            licenseFeatureId
        } = params;

        this.nameToken = nameToken;
        this.name = name;
        this.capabilityId = capabilityId;
        this.componentName = componentName;
        this.icon = icon;
        this.featureFlagId = featureFlagId;
        this.licenseFeatureId = licenseFeatureId;
    }
}
