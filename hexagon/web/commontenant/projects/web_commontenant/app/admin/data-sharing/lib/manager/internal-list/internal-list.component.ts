import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharingCriteria$v1 } from '@galileo/web_commontenant/_common';

@Component({
    selector: 'hxgn-commontenant-internal-list',
    templateUrl: 'internal-list.component.html',
    styleUrls: ['internal-list.component.scss']
})

export class InternalListComponent {

    /** List of internal sharing criteria */
    @Input('sharingCriteria')
    set setSharingCriteria(list: SharingCriteria$v1<any, any>[]) {
        this.sharingCriteria = list;

        // Build list of groups
        this.displayGroupIds = [...new Set(list.map(c => c.groupId))];

        if (this.displayGroupIds?.length === 1 ) {
            this.setSelectedCriteria(this.displayGroupIds[0]);
        }
    }

    /** List of internal sharing criteria */
    sharingCriteria: SharingCriteria$v1<any, any>[] = [];

    /** Event the criteria that has been selected */
    @Output() selectedCriteria = new EventEmitter<SharingCriteria$v1<any, any>[]>();

    /** The group that is currently selected */
    selectedGroupId: string;

    /** List of groups to show in the list */
    displayGroupIds: string[] = [];

    constructor() { }

    /**
     * Sets the sharing criteria
     * @param groupId Group id that is selected
     */
    setSelectedCriteria(groupId: string): void {
        if (!groupId) {
            return;
        }

        this.selectedGroupId = groupId;

        // Get list of selected criteria
        const selection = this.sharingCriteria.filter(c => {
            return c.groupId === this.selectedGroupId;
        });

        this.selectedCriteria.emit(selection);
    }
}
