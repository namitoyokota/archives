import { Store$v1 } from '@galileo/platform_common-libraries';

import { Tenant$v1 } from '../abstractions/tenant.v1';

export class TenantStore$v1 extends Store$v1<Tenant$v1> {
    constructor() {
        super('id', Tenant$v1);
    }

    /** Causes the tenant list to revaluate itself */
    refresh() {
        this.entity.next(this.entity.getValue());
    }
}
