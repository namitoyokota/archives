/**
 * A representation of the tenant that data is being shared with.
 */
export interface ShareeTenantInfo$v1 {

    /** The ID of the sharee tenant */
    shareeTenantId: string;

    /**  The name of the tenant that data is being shared with. */
    tenantName: string;

    /** The city where the tenant is located. */
    city: string;

    /** The state where the tenant is located. */
    state: string;

    /** The country where the tenant is located. */
    country: string;

    /**
     * A value indicating whether the sharer is currently sharing with the sharee.
     * Set to null in situations where it is irrelevant, and we don't want to performance hit of determining
     * whether sharing is actually enabled or not.
     */
    sharingEnabled?: boolean;

    /** The icon used to represent a tenant */
    tenantIconUrl: string;

    /** The grouping the tenant belongs to. */
    industryIds: string[];
}

/**
 * CType guard for ShareeTenantInfo$v1
 * @param arg Object to check is a ShareeTenantInfo$v1 type
 */
export function isShareeTenantInfo$v1(arg: any): arg is ShareeTenantInfo$v1 {
    return arg.shareeTenantId !== undefined &&
        arg.tenantName !== undefined;
}
