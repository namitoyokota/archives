/**
 * Represents the API response for getting sharees
 */
export class OptInResponse$v1 {
    /** Tenant id of the sharee */
    shareeTenantId?: string;

    /** Name of the tenant */
    tenantName?: string;

    /** City of the tenant */
    city?: string;

    /** State of the tenant */
    state?: string;

    /** Country of the tenant */
    country?: string;

    /** Icon URL of the tenant */
    tenantIconUrl?: string;

    /** List of industry ids for the tenant */
    industryIds?: string[];
}
