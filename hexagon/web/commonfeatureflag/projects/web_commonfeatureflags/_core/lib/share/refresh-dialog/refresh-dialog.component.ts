import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslationGroup } from '@galileo/web_commonfeatureflags/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RefreshDialogTranslationTokens } from './refresh-dialog.translation';

@Component({
    templateUrl: 'refresh-dialog.component.html',
    styleUrls: ['refresh-dialog.component.scss']
})

export class RefreshDialogComponent implements OnInit, OnDestroy {

    /** Export RefreshDialogTranslationTokens to HTML */
    tokens: typeof RefreshDialogTranslationTokens = RefreshDialogTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dialogRef: MatDialogRef<RefreshDialogComponent>,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    ngOnInit() {
        this.localizationAdapter.localizeGroup(TranslationGroup.main);

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.localizationAdapter.localizeGroup(TranslationGroup.main);
            }
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
    close(primary: boolean) {
        this.dialogRef.close(primary);
    }
}
