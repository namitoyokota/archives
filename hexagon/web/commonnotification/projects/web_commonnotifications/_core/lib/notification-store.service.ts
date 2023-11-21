import { Injectable } from '@angular/core';
import { NotificationStore$v1 } from '@galileo/platform_commonnotifications';

@Injectable({
    providedIn: 'root'
})
export class NotificationStoreService extends NotificationStore$v1 {
    constructor() {
        super()
    }
}
