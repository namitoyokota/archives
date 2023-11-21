import { Inject, Injectable } from '@angular/core';
import { Store$v1 } from '@galileo/platform_common-libraries';

/**
 * @deprecated Stores services should now be implemented in the platform package.
 * Service used to store entity data. This store does not track edit state.
 * This store is a good option if the data will only be changed by the calls to a
 * data service and not through the UI. If state is needed, for undo, see StatefulStore Service.
 */
@Injectable()
export class StoreService<T> extends Store$v1<T> {

    constructor(
        @Inject('sourceKey') sourceKey: string,
        @Inject('sourceType')  sourceType: new (arg: T) => T
    ) {
        super(sourceKey, sourceType);
    }
}
