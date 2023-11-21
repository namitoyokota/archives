import { Component, Inject } from '@angular/core';
import { Utils } from '@galileo/web_common-libraries';
import {
  CommontenantAdapterService$v1,
  FilterCriteriaEditor,
  FilterCriteriaEditorSettings,
  RestrictionGrouping$v1,
  RestrictionLevels,
} from '@galileo/web_commontenant/adapter';
import { LAYOUT_MANAGER_SETTINGS } from '@galileo/web_shapes/_common';

import { OperationContentRedaction$v1 } from '../operations/operation-content-redaction.v1';
import { OperationContent$v1, OperationIds$v1 } from '../operations/operation-content.v1';

@Component({
    templateUrl: 'create-data-filters.component.html',
    styleUrls: ['create-data-filters.component.scss']
})
export class CreateDataSharingInjectableComponent extends FilterCriteriaEditor {

    /** The restriction level that should be displayed */
    displayFilterLevel: string = RestrictionLevels.low;

    /** Expose RestrictionLevels to the HTML */
    RestrictionLevels: typeof RestrictionLevels = RestrictionLevels;

    /** Medium restriction grouping that can be edited */
    editableMediumRedaction: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    /** Medium restriction grouping that cannot be edited */
    readonlyMediumRedaction: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    /** High restriction grouping that can be edited */
    editableHighFilters: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    /** High restriction grouping that cannot be edited */
    readonlyHighFilters: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) public settings: FilterCriteriaEditorSettings,
        private tenantAdapter: CommontenantAdapterService$v1
    ) {
        super(settings, tenantAdapter);

        this.editableHighFilters = this.getEditableFilterGroup(RestrictionLevels.high);
        this.readonlyHighFilters = this.getReadonlyFilterGroup(RestrictionLevels.high);

        this.editableMediumRedaction = this.getEditableRedactionGroup(RestrictionLevels.medium);
        this.readonlyMediumRedaction = this.getReadOnlyRedactionGroup(RestrictionLevels.medium);
    }

    /** What to do when display filter restriction level changes */
    onRestrictionLevelChange(filterLevel: string) {
        this.displayFilterLevel = filterLevel;
    }

    /** Returns the editable redaction grouping based on level */
    getEditableRedactionGroup(level: string): RestrictionGrouping$v1<any, any> {
        let group = this.settings.editableRedactionCriteria.find(l => l.dataSharingLevel === level);
        if (!group) {
            this.settings.editableRedactionCriteria.push(new RestrictionGrouping$v1<any, any>({
                dataSharingLevel: level
            }));

            group = this.settings.editableRedactionCriteria.find(l => l.dataSharingLevel === level);
        }

        return Utils.deepCopy(group);
    }

    /** Returns the editable filter grouping based on level */
    getEditableFilterGroup(level: string): RestrictionGrouping$v1<any, any> {
        let group = this.settings.editableFilterCriteria.find(l => l.dataSharingLevel === level);
        if (!group) {
            this.settings.editableFilterCriteria.push(new RestrictionGrouping$v1<any, any>({
                dataSharingLevel: level
            }));

            group = this.settings.editableFilterCriteria.find(l => l.dataSharingLevel === level);
        }

        return Utils.deepCopy(group);
    }

    /** Returns the read only redaction grouping based on level */
    getReadOnlyRedactionGroup(level: string): RestrictionGrouping$v1<any, any> {
        let group = this.settings.readOnlyRedactionCriteria.find(l => l.dataSharingLevel === level);
        if (!group) {
            this.settings.readOnlyRedactionCriteria.push(new RestrictionGrouping$v1<any, any>({
                dataSharingLevel: level
            }));
            group = this.settings.readOnlyRedactionCriteria.find(l => l.dataSharingLevel === level);
        }

        return Utils.deepCopy(group);
    }

    /** Returns restriction grouping for read only fitters for a given restriction level */
    getReadonlyFilterGroup(level: string): RestrictionGrouping$v1<any, any> {
        let group = this.settings.readOnlyFilterCriteria.find(l => l.dataSharingLevel === level);
        if (!group) {
            this.settings.readOnlyFilterCriteria.push(new RestrictionGrouping$v1<any, any>({
                dataSharingLevel: level
            }));
            group = this.settings.readOnlyFilterCriteria.find(l => l.dataSharingLevel === level);
        }

        return Utils.deepCopy(group);
    }

    /** Event that is fired when the medium filters change */
    onMediumFilterChange(group: RestrictionGrouping$v1<OperationIds$v1, OperationContentRedaction$v1>) {
        const index = this.settings.editableRedactionCriteria.findIndex(rg => rg.dataSharingLevel === RestrictionLevels.medium);
        if (index !== -1) {
            this.settings.editableRedactionCriteria[index] = group;
        } else {
            this.settings.editableRedactionCriteria = this.settings.editableRedactionCriteria.concat(group);
        }

        this.editableMediumRedaction = this.getEditableRedactionGroup(RestrictionLevels.medium);
        this.emit();
    }

    /** Event that is fired when the high filters change */
    onHighFilterChange(group: RestrictionGrouping$v1<OperationIds$v1, OperationContent$v1>) {
        const index = this.settings.editableFilterCriteria.findIndex(rg => rg.dataSharingLevel === RestrictionLevels.high);
        if (index !== -1) {
            this.settings.editableFilterCriteria[index] = group;
        } else {
            this.settings.editableFilterCriteria = this.settings.editableFilterCriteria.concat(group);
        }

        this.editableHighFilters = this.getEditableFilterGroup(RestrictionLevels.high);
        this.emit();
    }
}
