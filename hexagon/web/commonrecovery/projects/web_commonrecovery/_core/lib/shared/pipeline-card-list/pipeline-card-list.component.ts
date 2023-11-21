import { Component, Input, OnInit } from '@angular/core';
import { Action$v1, Pipeline$v1, Scope$v1 } from '@galileo/web_commonrecovery/_common';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';

import { CoreService } from '../../core.service';

@Component({
    selector: 'hxgn-commonrecovery-pipeline-card-list',
    templateUrl: 'pipeline-card-list.component.html',
    styleUrls: ['pipeline-card-list.component.scss']
})
export class PipelineCardListComponent implements OnInit {

    /** List of pipeline runs to display */
    @Input('pipelines')
    set setPipelines(pipelines: Pipeline$v1[]) {
        if (pipelines) {
            this.pipelines = this.sortPipelines(pipelines);
        }
    }

    /** Tenant id of the stored backup */
    @Input('tenantId')
    set setTenantId(tenantId: string) {
        if (this.tenantStore.has(tenantId)) {
            this.tenantName = this.tenantStore.get(tenantId);
        } else if (tenantId === Scope$v1.system) {
            this.tenantName = this.coreSrv.systemTenantId;
        } else {
            this.tenantName = '';
        }
    }

    /** Action buttons to be hidden */
    @Input() hiddenActions: Action$v1[] = [];

    /** Indicates whether there is pipeline runnig */
    @Input() running: boolean;

    /** Indicates whether tenant is deleted */
    @Input('isDeleted')
    set setDeleted(isDeleted: boolean) {
        if (isDeleted) {
            this.hiddenActions = [...this.hiddenActions, Action$v1.restore];
        }
    }

    /** Pipeline list */
    pipelines: Pipeline$v1[];

    /** Tenant name of the backup */
    tenantName: String;

    /** Dictionary to store tenant name relative to its id */
    tenantStore: Map<string, string> = new Map<string, string>();

    constructor(
        private coreSrv: CoreService,
        private tenantSrv: CommontenantAdapterService$v1,
    ) {}

    /** On init lifecycle hook */
    async ngOnInit() {
        await this.tenantSrv.getTenantsAsync().then(tenants => {
            tenants.forEach(tenant => {
                this.tenantStore.set(tenant.id, tenant.name);
            });
        });
    }

    /** Sort pipelines by organization and date */
    sortPipelines(pipelines: Pipeline$v1[]): Pipeline$v1[] {
        return pipelines.sort((a: Pipeline$v1, b: Pipeline$v1) => {
            return +new Date(b.startTime) - +new Date(a.startTime);
        });
    }
}
