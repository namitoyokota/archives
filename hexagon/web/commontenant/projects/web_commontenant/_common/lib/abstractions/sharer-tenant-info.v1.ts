import { SharingConfiguration$v1 } from './sharing-configuration.v1';
import { SharingCriteria$v1 } from '@galileo/platform_commontenant';

/**
 * Provides information about a data sharing sharer tenant.
 */
export interface SharerTenantInfo$v1 {

    /** A list of config items concerning sharees */
    sharees: SharingConfiguration$v1[];

    /** The list of global (default) sharing criteria for a sharer */
    globals: SharingCriteria$v1<any, any>[];
}
