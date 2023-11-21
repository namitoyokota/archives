import { Injectable } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import {
    capabilityId,
    CommonMailboxService,
    Pipeline$v1,
    PipelineChangeNotifications$v1,
} from '@galileo/web_commonrecovery/_common';
import { filter } from 'rxjs/operators';

import { DataService } from './data.service';
import { EventService } from './event.service';
import { NotificationService } from './notification.service';
import { PipelineStoreService } from './pipeline-store.sevice';

@Injectable()
/**
 * The core service is the place where you tie all your other service
 * together. It should not be provided to any component or service. This
 * is where you will set up the listeners to the common mailbox, and
 * set up converting notifications into events.
 */
export class CoreService {

    /** Tenant id to indicate system pipeline by frontend */
    readonly systemTenantId = 'System';

    constructor(
        private mailbox: CommonMailboxService,
        private layoutAdapter: LayoutCompilerAdapterService,
        private pipelineStore: PipelineStoreService,
        private eventSrv: EventService,
        private dataSrv: DataService,
        private notificationSrv: NotificationService
    ) {
        this.initListeners();
        this.initPostOffice();

        this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
        this.layoutAdapter.coreIsLoadedAsync(capabilityId);
    }

    /**
     * Listen for notifications and trigger events off of them
     */
    async initListeners() {
        this.listenConnectionEstablished();
        this.listenToStoreEvents();
        this.listenPipelineUpdate();
    }

    /**
     * Listens to the connection established event on the notification service
     */
    private listenConnectionEstablished(): void {
        this.notificationSrv.connectionEstablished$.pipe(
            filter(isConnected => isConnected)
        ).subscribe(async () => {
            this.eventSrv.dataInit();

            this.eventSrv.dataReady();
            console.log('connection established');
        });
    }

    /**
     * Listens to events on the incident store and sends the update to the adapter
     */
    private listenToStoreEvents(): void {
        this.pipelineStore.updated$.subscribe(pipeline => {
            this.mailbox.mailbox$v1.updated$.next(new Pipeline$v1(pipeline));
        });
    }

    /**
     * Listens to incident creates and updates from the notification service
     */
    private listenPipelineUpdate(): void {
        console.log('listenpipeline update')
        this.notificationSrv.updated$.subscribe(async (notification: PipelineChangeNotifications$v1) => {
            console.info('updated notification', notification);

            await this.dataSrv.getPipeline$(notification.runId, notification.tenantId).toPromise().then(pipeline => {
                this.pipelineStore.upsert(pipeline);
            });
        });
    }

    /**
     * Listen to all messages in the mailbox service
     */
    private initPostOffice(): void { }
}
