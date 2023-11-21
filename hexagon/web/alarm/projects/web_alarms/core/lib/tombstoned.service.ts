import { Injectable } from '@angular/core';
import { Alarm$v1 } from '@galileo/web_alarms/_common';
import { CommonTombstonedService$v1, DescriptorList$v1, StoreService } from '@galileo/web_common-libraries';

import { DataService } from './data.service';

/**
 * A service for managing tombstoned entities.
 */
@Injectable()
export class TombstonedService extends CommonTombstonedService$v1<Alarm$v1>{

    constructor(private alarmStore: StoreService<Alarm$v1>,
                private dataSrv: DataService) {
        super(alarmStore);
    }

    getEntitiesAsync(list: DescriptorList$v1[]): Promise<Alarm$v1[]> {
        return this.dataSrv.getAlarms$(list).toPromise();
    }
}
