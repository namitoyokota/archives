import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { CommonTombstonedService$v1, DescriptorList$v1 } from '@galileo/web_common-libraries';
import { Shape$v1 } from '@galileo/web_shapes/_common';
import { ShapeStoreService } from './shape-store.service';

/**
 * A service for managing tombstoned entities.
 */
@Injectable()
export class TombstonedService extends CommonTombstonedService$v1<Shape$v1>{

    constructor(private shapeStore: ShapeStoreService,
                private dataSrv: DataService) {
        super(shapeStore);
    }

    /**
     * Get list of shapes by descriptors
     * @param list List of descriptors to get shapes by
     * @returns List of shapes that match the descriptors
     */
    getEntitiesAsync(list: DescriptorList$v1[]): Promise<Shape$v1[]> {
        return this.dataSrv.get$(list).toPromise();
    }
}
