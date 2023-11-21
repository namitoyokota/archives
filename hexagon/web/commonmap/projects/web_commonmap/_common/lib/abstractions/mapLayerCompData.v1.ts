/** Used to store the information needed to create an data layer on the map */
export class MapLayerComponentData$v1 {
    /** Localization token needed for name of layer being loaded on the map */
    nameToken?: string;

    /** Translated token */
    translatedToken?: string;

    /** Capability Id of the capability that hosts the map layer component */
    capabilityId?: string;

    /** Capability defined id of the layer being loaded on the map.  This must be unique
     * within a capability.
     */
    id?: string;

    /** Name of feature flag if required */
    featureFlag?: string;

    /** Name of license feature id if required */
    licenseFeatureId?: string;

    constructor(params = {} as MapLayerComponentData$v1) {
        const {
            nameToken,
            translatedToken,
            capabilityId,
            id,
            featureFlag,
            licenseFeatureId
        } = params;

        this.nameToken = nameToken;
        this.translatedToken = translatedToken;
        this.capabilityId = capabilityId;
        this.id = id;
        this.featureFlag = featureFlag;
        this.licenseFeatureId = licenseFeatureId;
    }
}

