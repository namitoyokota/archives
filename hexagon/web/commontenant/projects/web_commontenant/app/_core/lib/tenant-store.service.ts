import { Injectable } from '@angular/core';
import { TenantStore$v1 } from '@galileo/platform_commontenant';

@Injectable({
    providedIn: 'root'
})
export class TenantStoreService extends TenantStore$v1 {
    constructor() {
        super();
    }
}
