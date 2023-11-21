import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { KeywordRuleGroup$v1 } from '@galileo/web_commonkeywords/_common';

@Component({
    selector: 'hxgn-commonkeywords-group-list',
    templateUrl: 'group-list.component.html',
    styleUrls: ['group-list.component.scss']
})
/**
 * Presentation component that show the list of groups
 */
export class GroupListComponent {
    /** Groups to show */
   @Input() groups:  KeywordRuleGroup$v1[] = [];

   /** The group that is currently selected */
   @Input() selectedGroup: KeywordRuleGroup$v1;

   /** Groups that have not been saved */
   @Input() unsavedGroups: string[] = [];

   /** Emit that a group has been selected */
   @Output() groupSelected = new EventEmitter<KeywordRuleGroup$v1>();

   /** Emit that a group has been updated */
   @Output() groupUpdated = new EventEmitter<KeywordRuleGroup$v1>();

   /** Emit that a group has been deleted */
   @Output() groupDeleted = new EventEmitter<string>();

   /** Reference to the cdk scroll viewport */
   @ViewChild('viewport', {static: true}) viewport: CdkVirtualScrollViewport;

   /**
     * Returns true if the group has unsaved changes
     * @param id The groupId to check if there are unsaved changes for
     */
    hasUnsavedChanges(id: string): boolean {
        return !!this.unsavedGroups.find(groupId => groupId === id);
    }

    /**
      * Function used to track an item inside a ngFor loop
      * @param index The index of the item in the list
      * @param item The item in the list
      */
     trackByFn(index, item: KeywordRuleGroup$v1) {
        return item.id;
    }

    /**
     * Scrolls the list to a given group
     * @param id The group id to scroll to
     */
    scrollToGroup(id: string): void {
        this.viewport.scrollToIndex(
            this.groups.findIndex(group => {
                return group.id === id;
            })
        );
    }

    /**
     * Renames a group
     * @param group Group to rename
     * @param newName What to rename the group to
     */
    renameGroup(group: KeywordRuleGroup$v1, newName: string) {
        const updatedGroup = new KeywordRuleGroup$v1(group);
        updatedGroup.name = newName;
        this.groupUpdated.emit(updatedGroup);
    }

    /**
     * Emit that a group should be deleted
     * @param group Group to delete
     */
    deleteGroup(group: KeywordRuleGroup$v1) {
        this.groupDeleted.emit(group.id);
    }
}
