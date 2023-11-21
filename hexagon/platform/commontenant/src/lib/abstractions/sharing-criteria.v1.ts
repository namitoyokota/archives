import { Guid } from '@galileo/platform_common-libraries';

import { CriteriaOperation$v1 } from './criteria-operation.v1';
import { CriteriaType$v1 } from './criteria-type.v1';
import { RestrictionGrouping$v1 } from './restriction-grouping.v1';
import { RestrictionLevels$v1 } from './restriction-levels.v1';

/**
 * A representation of data restriction.
 */
export class SharingCriteria$v1<T, V> {
    /** Server-provided Etag to handle concurrency between states */
    etag?: string;

    /** Unique identifier */
    sharingCriteriaId?: string;

    /** The id of the capability that the restriction applies to. */
    capabilityId: string;

    /** The operations for a capability */
    capabilityOperations?: CriteriaOperation$v1[];

    /** The tenant id of the tenant that is sharing data. */
    sharerTenantId?: string;

    /** The tenant id of the tenant that data is being shared with. */
    shareeTenantId?: string;

    /** The current level of restriction that are being applied. (i.e. low, medium, height) */
    currentLevel?: string;

    /** A collection of redaction operations. */
    redactionOperations?: RestrictionGrouping$v1<T, V>[];

    /**  A collection of filter operations. */
    filterOperations?: RestrictionGrouping$v1<T, V>[];

    /** The id of the group the sharing criteria is for. */
    groupId?: string;

    /** The type for the criteria */
    criteriaType?: CriteriaType$v1;

    /** Id the frontend created  */
    referenceId?: string;

    constructor(params: SharingCriteria$v1<T, V> = {} as SharingCriteria$v1<T, V>) {
        const {
            etag = null,
            sharingCriteriaId = null,
            capabilityId = null,
            capabilityOperations = [],
            sharerTenantId = null,
            shareeTenantId = null,
            currentLevel = RestrictionLevels$v1.low,
            redactionOperations = [],
            filterOperations = [],
            groupId = null,
            criteriaType = null,
            referenceId = Guid.NewGuid()
        } = params;

        this.etag = etag;
        this.sharingCriteriaId = sharingCriteriaId;
        this.capabilityId = capabilityId;

        if (capabilityOperations?.length) {
            this.capabilityOperations = capabilityOperations.map(co => new CriteriaOperation$v1(co));
        } else {
            this.capabilityOperations = capabilityOperations;
        }

        this.sharerTenantId = sharerTenantId;
        this.shareeTenantId = shareeTenantId;
        this.currentLevel = currentLevel;

        if (redactionOperations?.length) {
            this.redactionOperations = redactionOperations.map(ro => new RestrictionGrouping$v1<T, V>(ro));
        } else {
            this.redactionOperations = redactionOperations;
        }

        if (filterOperations?.length) {
            this.filterOperations = filterOperations.map(fo => new RestrictionGrouping$v1<T, V>(fo));
        } else {
            this.filterOperations = filterOperations;
        }

        this.groupId = groupId;
        this.criteriaType = criteriaType;
        this.referenceId = referenceId;
    }
}
