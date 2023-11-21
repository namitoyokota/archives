import { StatefulStore$v1 } from "@galileo/platform_common-libraries";

/**
 * @deprecated Stores services should now be implemented in the platform package.
 * Service used to store entity data. This store can track changes in state.
 * This service should be used if changes to an items in the store can be changed by the UI.
 */
export abstract class StatefulStoreService<T> extends StatefulStore$v1<T>{

    
    constructor(
        sourceKey: string,
        sourceType: new (arg: T) => T
    ) {
        super(sourceKey, sourceType);
    }
}
