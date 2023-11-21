import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonConfirmDialogComponent } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Action$v1, Pipeline$v1, PipelineColumn$v1, Status$v1, TranslationGroup } from '@galileo/web_commonrecovery/_common';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DataService } from '../../data.service';
import { PipelineStoreService } from '../../pipeline-store.sevice';
import { SettingsDialogComponent } from '../../shared/settings-dialog/settings-dialog.component';
import { TranslatedTokens, TranslationTokens } from './tenant-recovery.translation';

@Component({
    templateUrl: './tenant-recovery.component.html',
    styleUrls: ['./tenant-recovery.component.scss']
})
export class TenantRecoveryComponent implements OnInit, OnDestroy {

    /** Pipeline runs of currently active tenant */
    pipelines$ = this.pipelineStore.pipelines$.pipe(map((pipelines: Pipeline$v1[]) => {
        this.backups = pipelines.filter(p => p.tenantId === this.activeTenantId && p.isAvailable);
        this.canRun = !pipelines.some(pipeline => pipeline.status === Status$v1.running);
        return pipelines.filter(p => p.tenantId === this.activeTenantId);
    }));

    /** Active backup files */
    backups: Pipeline$v1[];

    /** Current active tenant of the user */
    activeTenantId: string;

    /** Flag false after data loaded */
    dataLoaded = false;

    /** Flag disabled when operation is running */
    canRun: boolean;

    /** Expose pipeline column enum to HTML */
    pipelineColumn: typeof PipelineColumn$v1 = PipelineColumn$v1;

    /** Expose operation enum to HTML */
    action: typeof Action$v1 = Action$v1;

    /** Used to clean up subscriptions */
    destroy$: Subject<boolean> = new Subject<boolean>();

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    constructor(
        private dataSrv: DataService,
        private dialog: MatDialog,
        private pipelineStore: PipelineStoreService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private identitySrv: CommonidentityAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.activeTenantId = await (await this.identitySrv.getUserInfoAsync()).activeTenant;

        this.dataSrv.getPipelines$(this.activeTenantId).pipe(
            takeUntil(this.destroy$)
        ).subscribe((pipelines) => {
            this.pipelineStore.concatenate(pipelines);
            this.dataLoaded = true;
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /** Life cycle hook for on destroy */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /** View configurations */
    openSettings() {
        this.dialog.open(SettingsDialogComponent, {
            height: '380px',
            width: '500px',
            disableClose: true
        });
    }

    /** Backup currently selected tenant */
    async backupOrganization() {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            width: '500px',
            data: {
                titleToken: this.tokens.backupOrganization,
                msgToken: this.tokens.backupWarningMsg
            }
        }).afterClosed().subscribe(async (val) => {
            if (val) {
                this.canRun = false;
                await this.dataSrv.backup$(this.activeTenantId).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.common,
            TranslationGroup.core,
            TranslationGroup.main
        ]);

        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.backupOrganization = translatedTokens[TranslationTokens.backupOrganization];
        this.tTokens.backupWarningMsg = translatedTokens[TranslationTokens.backupWarningMsg];
    }
}
