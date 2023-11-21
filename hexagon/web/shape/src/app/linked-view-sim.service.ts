import { Injectable } from '@angular/core';
import { MailboxService } from '@galileo/web_commonlayoutmanager/_common';
import { LinkedViewSimulatorService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class LinkedViewSimService extends LinkedViewSimulatorService {

    // tslint:disable-next-line: variable-name
    constructor(private _mailBoxSrv: MailboxService) {
        super(_mailBoxSrv);
    }

    /** Create the mapping manually */
    buildLinks(): void {
      // this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/common/selection');
      // this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/filter');
      // this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/assets/filter');
      // this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a', 'workspaceId;screenId;tabId;map-b'], '@hxgn/assets/filter/sync');

      this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a'], '@hxgn/shapes/filter');
      this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a'], '@hxgn/common/selection');
      this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a'], '@hxgn/shapes/list/filter');
      this.link(['workspaceId;screenId;tabId;list-a', 'workspaceId;screenId;tabId;map-a'], '@hxgn/shapes/list/filter/sync');


      this.link(['workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/filter');
      this.link(['workspaceId;screenId;tabId;map-b'], '@hxgn/common/selection');
      this.link(['workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/list/filter');
      this.link(['workspaceId;screenId;tabId;map-b'], '@hxgn/shapes/list/filter/sync');
    }
}
