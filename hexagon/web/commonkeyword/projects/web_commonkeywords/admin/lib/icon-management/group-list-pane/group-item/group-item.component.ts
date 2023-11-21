import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { PopoverPosition } from '@galileo/web_common-libraries';
import { KeywordRuleGroup$v1 } from '@galileo/web_commonkeywords/_common';

import { KeywordRulesetStoreService } from '../../keyword-ruleset-store.service';
import { GroupItemTranslationTokens } from './group-item.translation';

@Component({
    selector: 'hxgn-commonkeywords-group-item',
    templateUrl: 'group-item.component.html',
    styleUrls: ['group-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupItemComponent {

    /** Group for this item */
    @Input() group: KeywordRuleGroup$v1;

    /** That that is true when the item is selected */
    @Input() selected = false;

    /** Flag that is true if the group has unsaved changes */
    @Input() hasUnsavedChanges = false;

    /** Event when an item is deleted */
    @Output() delete = new EventEmitter();

    /** Event when an item is renamed */
    @Output() renamed = new EventEmitter<string>();

    /** Reference to add new group input box */
    @ViewChild('renameGroup', { static: true}) renameGroupInp: ElementRef;

    /** Value of the group's new name during the rename process */
    groupRenameValue: string = null;

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Expose GroupItemTranslationTokens to HTML */
    tokens: typeof GroupItemTranslationTokens = GroupItemTranslationTokens;

    constructor(public ruleStore: KeywordRulesetStoreService) { }


    /**
     * Start the group renaming process
     */
    startRename() {
        this.groupRenameValue = this.group.name;

         // Break angular tick
         setTimeout(() => {
            this.renameGroupInp.nativeElement.focus();
            this.renameGroupInp.nativeElement.select();
        });
    }

    /**
     * Event that is fired when renaming of a group is done
     */
    endRename() {
        this.renamed.emit(this.groupRenameValue);
        this.groupRenameValue = null;
    }
}
