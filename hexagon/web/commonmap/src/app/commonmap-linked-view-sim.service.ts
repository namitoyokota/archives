import { Injectable } from '@angular/core';
import { LinkedViewSimulatorService } from '@galileo/web_commonlayoutmanager/_core';
import { MailboxService } from '@galileo/web_commonlayoutmanager/_common';

@Injectable()
export class CommonmapLinkedViewSimService extends LinkedViewSimulatorService {
    constructor(private _mailBoxSrv: MailboxService) {
        super(_mailBoxSrv);
    }
    /** Create the mapping manually */
    buildLinks() {

        // This creates a single group. You can create as many independent groups as needed.
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/common/selection');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/list/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/list/filter/sync');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/incidents/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/units/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/alarms/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/devices/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/assets/filter');
        this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/assets/filter/sync');

        // for (let ii = 0; ii < 100; ii++) {
        //     const contextId = 'commonmap-mapview' + ii.toString();
        //     this.link([contextId], '@hxgn/common/selection');
        //     this.link([contextId], '@hxgn/devices/filter');
        //     this.link([contextId], '@hxgn/assets/filter');
        //     this.link([contextId], '@hxgn/alarms/filter');
        //     this.link([contextId], '@hxgn/units/filter');
        //     this.link([contextId], '@hxgn/incidents/filter');
        //     this.link([contextId], '@hxgn/shapes/filter');
        // }
    }
}
