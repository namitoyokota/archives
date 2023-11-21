import { Injectable } from '@angular/core';
import { CapabilityManifestBaseService$v1, CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { capabilityId } from '@galileo/web_shapes/_common';

@Injectable()
export class DataSharingService extends CapabilityManifestBaseService$v1 {

    constructor(
        protected tenantSrv: CommontenantAdapterService$v1
    ) {
        super(tenantSrv, capabilityId);
    }

    /** Returns list of operation Ids that data sharing cares about */
    getCapabilityOperations(): string[] {
        return ['apiRead', 'apiWrite'];
    }
}
