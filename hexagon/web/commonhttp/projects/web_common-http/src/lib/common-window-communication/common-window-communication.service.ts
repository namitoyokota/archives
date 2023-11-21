import { Injectable } from '@angular/core';
import { WindowCommunication$v1 } from '@galileo/platform_common-http';

@Injectable()
export class CommonWindowCommunicationService extends WindowCommunication$v1 {
    constructor() {
      super()
    }
}
