import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslationTokens } from './select-groups-dialog.translation';

export interface DialogSetting {
    existingGroups: string[];
}

@Component({
    templateUrl: 'select-groups-dialog.component.html',
    styleUrls: ['select-groups-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectGroupsDialogComponent implements OnInit {

    /** Currently active groups */
    selectedGroups: string[];

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(private dialogRef: MatDialogRef<SelectGroupsDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private setting: DialogSetting) { }

    ngOnInit() {
        this.selectedGroups = this.setting.existingGroups;
    }

    /**
     * Updates currently selected groups
     * @param groupIds Selected group ids
     */
    addGroups(groupIds: string | string[]): void {
        if (Array.isArray(groupIds)) {
            this.selectedGroups = groupIds.map(id => {
                return id;
            });
        }
    }

    /**
     * Closes the dialog and emits the selected group id
     */
    add() {
        this.dialogRef.close(this.selectedGroups);
    }

    /**
     * Closes the dialog and emits the cancel flag
     */
    close() {
        this.dialogRef.close();
    }
}
