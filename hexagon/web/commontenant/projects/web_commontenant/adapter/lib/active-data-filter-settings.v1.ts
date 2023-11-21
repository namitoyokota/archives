import { RestrictionGrouping$v1 } from '@galileo/web_commontenant/_common';

/**
 * The settings injected into active data filter portals
 */
export interface ActiveDataFilterSettings {
    /**
     * List of global restriction filter groups
     */
    globalFilters: RestrictionGrouping$v1<any, any>[];
    /**
     * List of overridden filter groups.
     */
    overriddenFilters: RestrictionGrouping$v1<any, any>[];
    /**
    * List of global restriction redaction groups
    */
    globalRedaction: RestrictionGrouping$v1<any, any>[];
    /**
     * List of overridden redaction groups.
     */
    overriddenRedaction: RestrictionGrouping$v1<any, any>[];
    /**
     * The current level of restriction that are being applied. (i.e. low, medium, high)
     */
    currentLevel: string;
}
