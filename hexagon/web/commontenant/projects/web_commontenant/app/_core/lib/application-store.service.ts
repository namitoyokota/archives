import { Injectable } from '@angular/core';
import { ApplicationStore$v1 } from '@galileo/platform_commontenant';
import { DataService$v2 } from './data.service.v2';

@Injectable({
    providedIn: 'root'
})
export class ApplicationStoreService extends ApplicationStore$v1 {
    constructor(private dataSrv: DataService$v2) {
        super();

        this.dataSrv.tenant.getApplications$().subscribe(list => {
            this.upsert(list);
        });
    }
}
