import { Request } from 'abstractions/request';
import { SaveStatus } from 'abstractions/save-status';
import { inject } from 'aurelia-framework';
import { Subscription } from 'rxjs';
import { AutosaveService } from 'services/assessment-autosave-service';

export class Autosave {
    /** Current status of the save */
    currentStatus = SaveStatus.SAVED;

    /** Subscription listening to the status change */
    private statusSubscription: Subscription;

    constructor(@inject(AutosaveService) private autosaveService: AutosaveService) {}

    /** On attach lifecycle hook */
    attached(): void {
        this.listenToStatusChange();
    }

    /** On detach lifecycle hook */
    detached(): void {
        this.statusSubscription?.unsubscribe();
    }

    /** Sends save request to service */
    requestSave(): void {
        this.autosaveService.requestSave(new Request());
    }

    /** Saves existing changes now */
    saveNow(): void {
        this.autosaveService.saveNow(new Request());
    }

    /** Listens for any changes different in save status */
    private listenToStatusChange(): void {
        this.statusSubscription = this.autosaveService.status$.subscribe((status) => {
            this.currentStatus = status;
        });
    }
}
