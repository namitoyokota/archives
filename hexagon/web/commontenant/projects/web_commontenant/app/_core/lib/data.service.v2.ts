import { Injectable } from '@angular/core';
import {
    DataSharingDataAccessor$v1,
    JargonDataAccessor$v1,
    SharingCriteriaDataAccessor$v1,
    TenantDataAccessor$v1
} from '@galileo/platform_commontenant';
import { TokenManagerService } from '@galileo/web_common-http';

/**
 * Service for interacting the Common Identity REST API
 */
@Injectable({ providedIn: 'root' })
export class DataService$v2 {
    /** Access v1 of the Data Sharing REST API */
    dataSharing: DataSharingDataAccessor$v1;

    /** Access v1 of the Jargon REST API */
    jargon: JargonDataAccessor$v1;

    /** Access v1 of the Sharing Criteria REST API */
    sharingCriteria: SharingCriteriaDataAccessor$v1;

    /** Access v1 of the Tenant REST API */
    tenant: TenantDataAccessor$v1;

    constructor(
        tokenManagerSrv: TokenManagerService
    ) {
        this.dataSharing = new DataSharingDataAccessor$v1(tokenManagerSrv);
        this.jargon = new JargonDataAccessor$v1(tokenManagerSrv);
        this.sharingCriteria = new SharingCriteriaDataAccessor$v1(tokenManagerSrv);
        this.tenant = new TenantDataAccessor$v1(tokenManagerSrv);
    }
}
