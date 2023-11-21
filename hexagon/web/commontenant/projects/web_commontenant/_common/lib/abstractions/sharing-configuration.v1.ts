import { ShareeTenantInfo$v1 } from './sharee-tenant-info.v1';
import { SharingCriteria$v1 } from '@galileo/platform_commontenant';

/**
 * Groups information about a sharee together with the list of associated
 * sharing criteria overrides.
 * Deprecated
 */
export interface SharingConfiguration$v1 {

    /** The tenant info for a sharee */
    shareeTenantInfo: ShareeTenantInfo$v1;

    /** List of overrides for a sharee */
    overrides: SharingCriteria$v1<any, any>[];
}

export class SharingConfiguration$v2 {

    /** Id of the owner entity */
    ownerId?: string;

    /** Name of the entity that owns the criteria. Tenant name or group name */
    ownerName?: string;

    /** URL to the owner's icon */
    ownerIcon?: string;

    /** List of sharing criteria for the sharee */
    criteria?:  SharingCriteria$v1<any, any>[];

    constructor(param:  SharingConfiguration$v2 = {} as  SharingConfiguration$v2) {
        const {
            ownerId = null,
            ownerName = null,
            ownerIcon = null,
            criteria = []
        } = param;

        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.ownerIcon = ownerIcon;

        if (criteria?.length) {
            this.criteria = criteria.map(c => new SharingCriteria$v1<any, any>(c));
        } else {
            this.criteria = criteria;
        }

    }

}
