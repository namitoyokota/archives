import { AlarmFilter$v1 } from '@galileo/web_alarms/_common';
import { ViewSettings$v1 } from '@galileo/web_commonlayoutmanager/adapter';

import { SortOptions } from '../../shared/sorting/sort-options';

export interface AlarmListSettings extends ViewSettings$v1 {
    /** The options used to sort the alarm list */
    sortBy?: SortOptions;

    /** The default filter to apply to the list */
    filter?: AlarmFilter$v1;

    /** When true the UI will show card details expansion icon */
    enableCardExpansion: boolean;

    /**
     * When true shows remarks if they are not redacted.
     * Is false if enableCardExpansion is false.
     */
    enableRemarks: boolean;

    /**
     * When true will show media if they are not redacted.
     * Is false if  enableCardExpansion is false.
     */
    enableMedia: boolean;

    /**
     * When true will show keywords if they are not redacted.
     * Is false if enableCardExpansion is false.
     */
    enableKeywords: boolean;
}
