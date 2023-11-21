import { BehaviorSubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { WindowMessage$v1 } from '../window-communication/window-communication-msg.v1';
import { WindowCommunication$v1 } from '../window-communication/window-communication.v1';

/**
 * Manages notifications hubs in a multi-window environment. This class should be
 * global as it stores state about which windows have asked to have their hubs setup.
 */
export class HubManager$v1 {
  /** Holding a mapping of capability id to a flag that is true when init is done */
  private windowHubInit = new BehaviorSubject<Map<string, boolean>>(null);

  /** Message channel to listen to */
  private readonly context = '@hxgn/common-http:init-hub';

  /** Event that is raised when a window hub init has been made */
  windowHubInit$ = this.windowHubInit
    .asObservable()
    .pipe(filter((data) => !!data));

  /** Event a list of capability ids that has not completed initialization  */
  pendingHubs$ = this.windowHubInit$.pipe(
    map((hubs) => {
      const pendingIds = [];

      if (hubs) {
        hubs.forEach((isDone, capabilityId) => {
          if (!isDone) {
            pendingIds.push(capabilityId);
          }
        });
      }

      return pendingIds;
    })
  );

  constructor(private windowSrv: WindowCommunication$v1) {
    this.windowHubInit.next(new Map<string, boolean>());

    if (!this.windowSrv.isChildWindow()) {
      // Listen to message from child windows
      this.windowSrv.receiveMessage$
        .pipe(filter((event) => event.contextId === this.context))
        .subscribe((msg: WindowMessage$v1<string>) => {
          // Check if the capability has already been through initialization
          let isDone: boolean;

          try {
            isDone = this.windowHubInit.getValue().get(msg.data);
          } catch (ex) {
            isDone = false;
          }

          if (!isDone) {
            this.initHub(msg.data);
          }
        });
    }
  }

  /**
   * Marks a hub as being initialized and the status of the initialization process
   * @param capabilityId Id of the capability of the hub that is being initialized
   * @param isReady A flag that is true if the capability initialization has been completed
   */
  initHub(capabilityId: string, isReady = false) {
    if (this.windowSrv.isChildWindow()) {
      const windowMsg: WindowMessage$v1<string> = {
        data: capabilityId,
        contextId: this.context,
      } as WindowMessage$v1<string>;

      this.windowSrv.messageMaster(windowMsg);
    } else {
      const current = this.windowHubInit.getValue();
      current.set(capabilityId, isReady);

      this.windowHubInit.next(current);
    }
  }
}
