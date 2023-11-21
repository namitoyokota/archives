import { Injectable } from '@angular/core';
import { NotificationManager$v1 } from '@galileo/platform_commonnotifications';
import {
    CommonHubManagerService,
    CommonWindowCommunicationService,
    TokenManagerService
} from '@galileo/web_common-http';

/***
 * The notification hub service handles notification processing from signalR or the window service.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificationService extends NotificationManager$v1 {
    constructor(
        tokenManagerSrv: TokenManagerService,
        commonWindowCommSrv: CommonWindowCommunicationService,
        commonManager: CommonHubManagerService
    ) {
        super(tokenManagerSrv, null, commonWindowCommSrv, commonManager);
    }
}
