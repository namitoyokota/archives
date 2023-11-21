/**
 * Defines an capability operation in sharing criteria
 */
export class CriteriaOperation$v1 {
    /** An identifier for the operation (.e.g. apiRead) */
    capabilityOperationId: string;

    /**  A value indicating whether the operation is enabled or disabled */
    enabled?: boolean;

    constructor(params: CriteriaOperation$v1 = {} as CriteriaOperation$v1) {
        const { capabilityOperationId, enabled = false } = params;

        this.capabilityOperationId = capabilityOperationId;
        this.enabled = enabled;
    }
}
