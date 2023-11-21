import { Injectable, Inject } from '@angular/core';
import {
    CommonNotificationHubService$v2,
    CommonHubManagerService,
    CommonWindowCommunicationService,
    CommonHttpClient
} from '@galileo/web_common-http';
import { ICommonConstants, CommonConstants } from '@galileo/web_common-libraries';
import { Subject, Observable } from 'rxjs';

/***
 * The notification hub service handles notification processing from signalR or the window service.
 */
@Injectable()
export class NotificationService extends CommonNotificationHubService$v2 {

    /** Bus for artifactUpdate notification */
    private artifactUpdate: Subject<boolean>;

    /** ArtifactUpdate notification */
    artifactUpdate$: Observable<boolean>;

    constructor(private commonWindowCommSrv: CommonWindowCommunicationService,
        private _httpSrv: CommonHttpClient,
        private commonManager: CommonHubManagerService,
        @Inject(CommonConstants) private constants: ICommonConstants) {

        super(`api/commonWebRoot/hub/artifactUpdate/v1?buildId=${constants.BUILD_NUMBER}`,
            false, 'webRoot', commonWindowCommSrv, _httpSrv, commonManager);
    }

    /** On Hub init life cycle hook */
    onHubInit() {
        this.artifactUpdate = new Subject<boolean>();
        this.artifactUpdate$ = this.artifactUpdate.asObservable();
    }

    /** Returns list of event names */
    eventNames(): string[] {
        return ['artifactUpdate'];
    }

    /** Process event */
    onEvent(eventName: string, isExpired: boolean) {
        this.artifactUpdate.next(isExpired);
    }

    /** On connection established event */
    onConnectionEstablished() { }

    /** On close connection event */
    onConnectionClosed() { }
}

