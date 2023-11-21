import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
  CapabilityManifest$v1,
  CommontenantMailboxService,
  SharingConfiguration$v2,
  SharingCriteria$v1,
} from '@galileo/web_commontenant/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EditOverrideDialogTranslationTokens } from './edit-override-dialog.translation';

/**
 * Describe the object that is passed to the edit override dialog
 */
interface EditOverrideDialogData {
    /** Sharing configuration */
    config: SharingConfiguration$v2;

    /** Capability manifest */
    capability: CapabilityManifest$v1;

    /** The currently selected filter level */
    selectedLevel: string;

    /** List of global sharing criteria */
    global: SharingCriteria$v1<any, any>;
}

@Component({
    templateUrl: 'edit-override-dialog.component.html',
    styleUrls: ['edit-override-dialog.component.scss']
})
export class EditOverrideDialogComponent implements OnInit, OnDestroy {

    /** The currently selected display level */
    displayLevel: string;

    /** The current state of the override */
    currentOverride: SharingCriteria$v1<any, any>;

    /** Expose tokens to the html */
    tokens: typeof EditOverrideDialogTranslationTokens = EditOverrideDialogTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dialogRef: MatDialogRef<EditOverrideDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EditOverrideDialogData,
        private mailbox: CommontenantMailboxService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.localizationSrv.localizeStringAsync(this.data.capability.nameToken);

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.localizationSrv.localizeStringAsync(this.data.capability.nameToken);
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Close the dialog
     */
    close() {
        this.dialogRef.close();
    }

    /**
     * Save the overrides
     */
    async save() {
        const updatedCriteria = new SharingCriteria$v1<any, any>(this.currentOverride);
        this.dialogRef.close(updatedCriteria);
    }

    /**
     * Sets the selected display level and tells the portal about it.
     * @param level The level to select
     */
    setSelectedDisplayLevel(level) {
        this.displayLevel = level;
        this.mailbox.mailbox$v1.adminDataFilterLevelChanged$.next(this.displayLevel);
    }

    /**
     * Sets the sharing criteria when it changes
     * @param sharingCriteria The sharing criteria that has been created or updated
     */
    setCriteria(sharingCriteria: SharingCriteria$v1<any, any>): void {
        this.currentOverride = sharingCriteria;
    }
}
