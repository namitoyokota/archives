import { Component, Inject } from '@angular/core';
import { ActiveDataFilterSettings, RestrictionGrouping$v1, RestrictionLevels } from '@galileo/web_commontenant/adapter';
import { LAYOUT_MANAGER_SETTINGS } from '@galileo/web_shapes/_common';

import { OperationContentRedaction$v1 } from '../operations/operation-content-redaction.v1';
import { OperationIds$v1 } from '../operations/operation-content.v1';

@Component({
    templateUrl: 'active-data-filters.component.html'
})
export class ActiveDataFiltersInjectableComponent {

    /** Expose restriction levels to html */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: ActiveDataFilterSettings
    ) { }

    /** Returns a filter list of restriction grouping objects based on a given level. */
    filterLevel(
        group: RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>[],
        level: string
    ): RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1> {
        const g = group.filter(item => item.dataSharingLevel === level);
        return g?.length ? g[0] : null;
    }
}
