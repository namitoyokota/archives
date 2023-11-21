import { CommontenantAdapterService$v1 } from './commontenant-adapter.v1.service';
import { filter } from 'rxjs/operators';

/**
 * Base class that must be extended by a service in a capability module to work
 * with data sharing.
 */
export abstract class CapabilityManifestBaseService$v1 {

    constructor(protected tenantSrc: CommontenantAdapterService$v1,
      private capabilityId: string) {
        this.bootStrap();
    }

    /**
     * Returns a list of operation ids that can be toggled off and on by the data sharing admin UI
     */
    getCapabilityOperations(): string[] {
      throw new Error('getCapabilityOperations() Not Implemented');
    }

    /**
     * Kicks off startup processes.
     */
    private bootStrap(): void {
      this.subscribeToRequestForCapabilityOperations();
    }

    /**
     * Listener for request for capability operations event.
     */
    private subscribeToRequestForCapabilityOperations(): void {
      this.tenantSrc.notifications.onRequestCapabilityOperations$.pipe(
        filter(item => {
          return (item && item.payload === this.capabilityId);
        })
      ).subscribe((msg) => {
        msg.response.next(this.getCapabilityOperations());
      });
    }
  }
