import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonConfirmDialogComponent } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Action$v1, Operation$v1, Pipeline$v1 } from '@galileo/web_commonrecovery/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { PipelineStoreService } from '../../pipeline-store.sevice';
import { RestoreDialogComponent } from '../restore-dialog/restore-dialog.component';
import { TranslatedTokens, TranslationTokens } from './pipeline-card.translation';

@Component({
    selector: 'hxgn-commonrecovery-pipeline-card',
    templateUrl: 'pipeline-card.component.html',
    styleUrls: ['pipeline-card.component.scss']
})
export class PipelineCardComponent implements OnInit, OnDestroy {

    /** Pipeline data to display on card */
    @Input('pipeline')
    set setPipeline(pipeline: Pipeline$v1) {
        this.pipeline = pipeline;
        if (this.pipeline.downloadSize) {
            this.getDownloadSize();
        }

        if (this.pipeline.downloadExpires) {
            this.downloadExpired = new Date(this.pipeline.downloadExpires) < new Date();
        }
    }

    /** Tenant name of the backup */
    @Input() tenantName: string;

    /** Indicates whether there is pipeline runnig */
    @Input() running: boolean;

    /** Action buttons to be hidden */
    @Input() hiddenActions: Action$v1[];

    /** Pipeline object to display */
    pipeline: Pipeline$v1;

    /** Estimate download size to nearest unit */
    fileSize: string;

    /** Token name of the file unit */
    fileSizeUnit: string;

    /** Flag false if only one backup exists */
    canDelete: boolean;

    /** Flag that indicates whether download is expired or not */
    downloadExpired: boolean;

    /** Expose operation enum to HTML */
    action: typeof Action$v1 = Action$v1;

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private dataSrv: DataService,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private pipelineStore: PipelineStoreService
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.initLocalizationAsync();

        this.pipelineStore.pipelines$.subscribe(pipelines => {
            const tenantPipelines = pipelines.filter(p =>
                p.isAvailable &&
                p.operation === Operation$v1.backup &&
                p.tenantId === this.pipeline.tenantId
            );
            this.canDelete = tenantPipelines.length > 1;
        });

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

    /** Returns the estimate size of the zip file */
    getDownloadSize() {
        const units = [this.tokens.bytes, this.tokens.kilobytes, this.tokens.megabytes, this.tokens.gigabytes, this.tokens.terabytes];
        let fileSize = parseInt(this.pipeline.downloadSize, 10) || 0;
        let unitLength = 0;

        while (fileSize >= 1024 && ++unitLength) {
            fileSize = fileSize / 1024;
        }

        this.fileSize = fileSize.toFixed(fileSize < 10 && unitLength > 0 ? 1 : 0);
        this.fileSizeUnit = units[unitLength];
    }

    /** Download backup zip file */
    download() {
        location.href = this.pipeline.downloadUrl;
    }

    /** Restore pipeline */
    restore() {
        this.dialog.open(RestoreDialogComponent, {
            height: '600px',
            width: '930px',
            disableClose: true,
            data: {
                runId: this.pipeline.runId,
                tenantId: this.pipeline.tenantId
            }
        }).afterClosed().subscribe(async capabilities => {
            if (capabilities) {
                await this.dataSrv.restore$(capabilities, this.pipeline.tenantId, this.pipeline.runId).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Delete pipeline */
    delete() {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            width: '500px',
            data: {
                titleToken: this.tokens.deleteBackup,
                msgToken: this.tokens.deleteWarningMsg
            }
        }).afterClosed().subscribe(async (val) => {
            if (val) {
                await this.dataSrv.delete$(this.pipeline.runId, this.pipeline.tenantId).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Request download */
    async request() {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            width: '500px',
            data: {
                titleToken: this.tokens.requestDownload,
                msgToken: this.tokens.requestWarningMsg
            }
        }).afterClosed().subscribe(async (val) => {
            if (val) {
                await this.dataSrv.download$(this.pipeline.runId, this.pipeline.tenantId).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        const keys = Object.keys(TranslationTokens);
        for (const index in keys) {
            const prop = keys[index];
            this.tTokens[prop] = translatedTokens[TranslationTokens[prop]];
        }
    }
}
