import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './force-push-dialog.translation';

export interface DialogSetting {
    /** List of feature flags' friendly names */
    friendlyNames?: string[];

    /** Whether to show global message or tenant message */
    globalMode?: boolean;
}

@Component({
    templateUrl: 'force-push-dialog.component.html',
    styleUrls: ['force-push-dialog.component.scss']
})
export class ForcePushViewDialogComponent implements OnInit, OnDestroy {

    /** Turn on global warning description or tenant wide */
    globalMode: boolean;

    /** List of edited flags */
    friendlyNames: string[];

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(private dialogRef: MatDialogRef<ForcePushViewDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private setting: DialogSetting,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    async ngOnInit() {
        this.initLocalization();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalization();
            }
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Closes the dialog and emits the cancel flag
     */
    cancel(): void {
        this.dialogRef.close(false);
    }

    /**
     * Closes the dialog and emits the continue flag
     */
    continue(): void {
        this.dialogRef.close(true);
    }

    private initLocalization() {
        this.localizationSrv.localizeStringsAsync(this.setting.friendlyNames);
        this.globalMode = this.setting.globalMode;
        this.friendlyNames = this.setting.friendlyNames;
    }
}
