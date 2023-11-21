import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { Actions$v1 } from './actions.v1';
import { CommonAdapterService$v1 } from '@galileo/web_common/adapter';

@Injectable()
export class ActionBroadcastService {

    constructor(private commonAdapter: CommonAdapterService$v1) { }

    /**
     * Broadcast action to select incident
     * @param contextId Context id of the component making the selection
     * @param incidentId The id of the incident to select
     */
    select(contextId: string, incidentId: string) {
        this.commonAdapter.selectAsync(contextId, incidentId);
    }
}
