import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonConfirmDialogComponent } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Action$v1, Pipeline$v1, PipelineColumn$v1, Scope$v1, Status$v1 } from '@galileo/web_commonrecovery/_common';
import {
    DataService,
    PipelineStoreService,
    RestoreDialogComponent,
    SettingsDialogComponent,
} from '@galileo/web_commonrecovery/_core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslatedTokens, TranslationTokens } from './global-management.translation';

@Component({
    selector: 'hxgn-commonrecovery-global-management',
    templateUrl: './global-management.component.html',
    styleUrls: ['./global-management.component.scss']
})
export class GlobalManagementComponent implements OnInit, OnDestroy {

    /** List of system pipelines */
    @Input('pipelines')
    set setPipelines(pipelines: Pipeline$v1[]) {
        if (pipelines.length) {
            this.pipelines = pipelines;
            this.canRun = !this.pipelines.some(pipeline => pipeline.status === Status$v1.running);
        }
    }

    /** List of child pipelines for the currently expanded parent */
    @Input() childPipelines: Pipeline$v1[] = [];

    /** Indicates whether pipelines have been loaded */
    @Input() isLoading = true;

    /** Emits when row expand changes */
    @Output() expandChange: EventEmitter<string> = new EventEmitter<string>();

    /** List of system pipelines to display */
    pipelines: Pipeline$v1[] = [];

    /** Flag used to track whether operation is currently running */
    canRun = true;

    /** Expose pipeline column enum to HTML */
    pipelineColumn: typeof PipelineColumn$v1 = PipelineColumn$v1;

    /** Expose operation enum to HTML */
    operation: typeof Action$v1 = Action$v1;

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** Destory subscription flag */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private pipelineStore: PipelineStoreService,
        private dialog: MatDialog
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Emits event for when expand changes
     * @param parentId Parent pipeline id
     */
    expandIdChange(parentId: string) {
        this.expandChange.emit(parentId);
    }

    /** View configurations */
    openSettings() {
        this.dialog.open(SettingsDialogComponent, {
            height: '380px',
            width: '500px',
            disableClose: true
        });
    }

    /** Backup all data */
    async backupAll() {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            width: '500px',
            data: {
                titleToken: this.tokens.backupAll,
                msgToken: this.tokens.backupWarningMsg
            }
        }).afterClosed().subscribe(async (val) => {
            if (val) {
                this.dataSrv.backupAll$().toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Restore all data */
    async restoreLatest() {
        this.dialog.open(RestoreDialogComponent, {
            height: '600px',
            width: '930px',
            disableClose: true,
            data: {
                tenantId: Scope$v1.global
            }
        }).afterClosed().subscribe(async capabilities => {
            if (capabilities) {
                this.dataSrv.restoreAll$(capabilities).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.backupAll = translatedTokens[TranslationTokens.backupAll];
        this.tTokens.backupWarningMsg = translatedTokens[TranslationTokens.backupWarningMsg];
    }
}
