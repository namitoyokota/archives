/**
 * Defines an capability operation in a capability manifest
 */
export class ManifestOperation$v1 {
    /** The ID of the capability operation (e.g. apiRead) */
    capabilityOperationId: string;

    /** The feature ID that appears in the license file */
    licenseFeatureId: string;

    constructor(params: ManifestOperation$v1 = {} as ManifestOperation$v1) {
        const { capabilityOperationId, licenseFeatureId } = params;

        this.capabilityOperationId = capabilityOperationId;
        this.licenseFeatureId = licenseFeatureId;
    }
}
