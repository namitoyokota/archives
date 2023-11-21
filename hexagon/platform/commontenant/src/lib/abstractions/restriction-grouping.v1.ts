import { RestrictionOperation$v1 } from './restriction-operation.v1';

/**
 * An object that groups a set of restrictions into categories with a label (e.g. High, Medium, and Low)
 */
export class RestrictionGrouping$v1<T, V> {
    /** A label for the category of restriction (e.g. High) */
    dataSharingLevel: string;

    /** A list of restriction operations */
    restrictions?: RestrictionOperation$v1<T, V>[];

    constructor(params: RestrictionGrouping$v1<T, V> = {} as RestrictionGrouping$v1<T, V>) {
        const { dataSharingLevel = null, restrictions = [] } = params;

        this.dataSharingLevel = dataSharingLevel;

        if (restrictions?.length) {
            this.restrictions = restrictions.map(ro => new RestrictionOperation$v1<T, V>(ro));
        } else {
            this.restrictions = restrictions;
        }
    }
}
