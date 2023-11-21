import { Injectable } from '@angular/core';
import { CommonWindowCommunicationService } from '../common-window-communication/common-window-communication.service';
import { HubManager$v1 } from '@galileo/platform_common-http';
@Injectable({providedIn: 'root'})
export class CommonHubManagerService extends HubManager$v1 {

  constructor(windowSrv: CommonWindowCommunicationService) {
    super(windowSrv);
  }
}
