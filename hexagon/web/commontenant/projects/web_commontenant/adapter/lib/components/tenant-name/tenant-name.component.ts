import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Tenant$v1 } from '@galileo/web_commontenant/_common';

import { CommontenantAdapterService$v1 } from '../../commontenant-adapter.v1.service';

@Component({
    selector: 'hxgn-commontenant-name',
    templateUrl: 'tenant-name.component.html',
    styleUrls: ['tenant-name.component.scss']
})
export class TenantNameComponent implements OnInit {

    /** Tenant input. */
    @Input() tenantId: string;

    /** Flag that is true when the icon should be shown */
    @HostBinding('class.show-icon') @Input() showIcon = true;

    /** Tenant object for name component. */
    tenant: Tenant$v1;

    constructor(private tenantSrv: CommontenantAdapterService$v1) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        this.tenant = await this.tenantSrv.getTenantAsync(this.tenantId);
    }
}
