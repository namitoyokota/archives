import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Pipeline$v1, Scope$v1, TranslationGroup } from '@galileo/web_commonrecovery/_common';
import { CoreService, DataService, PipelineStoreService } from '@galileo/web_commonrecovery/_core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './recovery-management.translation';

enum ManagementTab {
    sysManagement = 0,
    orgManagement = 1
}

@Component({
    selector: 'hxgn-commonrecovery-recovery-management',
    templateUrl: './recovery-management.component.html',
    styleUrls: ['./recovery-management.component.scss']
})
export class RecoveryManagementComponent implements OnInit, OnDestroy {

    /** Element reference to tab group */
    @ViewChild(MatTabGroup) matTabGroupRef: MatTabGroup;

    /** Used to track which tab can be selected */
    managementTab: typeof ManagementTab = ManagementTab;

    /** Currently selected tab */
    selectedTab = ManagementTab.sysManagement;

    /** Currently selected tenant id */
    selectedTenant$ = new BehaviorSubject<string>(Scope$v1.system);

    /** Currently expanded parent pipeline runid */
    expandedParent$ = new BehaviorSubject<string>('');

    /** Flag to indicate that global piplines are loaded */
    loadingGlobal = true;

    /** List of tenant id that has been already loaded */
    loadedTenants: string[] = [];

    /** List of parent runids that has been already loaded */
    loadedParents: string[] = [];

    /** List of organizations with backups */
    organizations: string[] = [];

    /** Pipelines ran at global level */
    globalPipelines$ = this.pipelineStore.pipelines$.pipe(map((pipelines: Pipeline$v1[]) => {
        return pipelines.filter(p => p.tenantId === Scope$v1.global);
    }));

    /** Pipelines for the currently selected tenant */
    tenantPipelines$ = combineLatest([
        this.pipelineStore.pipelines$,
        this.selectedTenant$
    ]).pipe(map(([pipelines, tenantId]: [Pipeline$v1[], string]) => {
            return pipelines.filter(p => p.tenantId === tenantId);
        })
    );

    /** Child piplines for the currently selected parent pipeline */
    childPipelines$ = combineLatest([
        this.pipelineStore.pipelines$,
        this.expandedParent$
    ]).pipe(map(([pipelines, parentId]: [Pipeline$v1[], string]) => {
            return pipelines.filter(p => p.parentPipeline === parentId);
        })
    );

    /** Used to clean up subscriptions */
    destroy$: Subject<boolean> = new Subject<boolean>();

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(
        private coreSrv: CoreService,
        private dataSrv: DataService,
        private titleSrv: Title,
        private pipelineStore: PipelineStoreService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) {
        this.initLocalization();
        this.setTitleAsync();
    }

    /** On init lifecycle hook */
    ngOnInit() {
        this.dataSrv.getTenants$().toPromise().then(tenantIds => {
            this.organizations = tenantIds;
        });

        this.dataSrv.getPipelines$(Scope$v1.global).pipe(
            takeUntil(this.destroy$)
        ).subscribe((pipelines) => {
            pipelines.forEach(p => p.tenantId = Scope$v1.global);
            this.pipelineStore.concatenate(pipelines);
            this.loadingGlobal = false;
        });

        this.dataSrv.getPipelines$(Scope$v1.system).pipe(
            takeUntil(this.destroy$)
        ).subscribe((pipelines) => {
            pipelines.forEach(p => p.tenantId = Scope$v1.system);
            this.pipelineStore.concatenate(pipelines);
            this.loadedTenants = [...this.loadedTenants, this.coreSrv.systemTenantId];
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.setTitleAsync();
        });
    }

    /** Life cycle hook for on destroy */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.complete();
    }

    /** Event when tab is changed */
    handleTabChangeAsync() {
        this.selectedTab = this.matTabGroupRef.selectedIndex;
    }

    /**
     * Event when selected tenant changed
     * @param tenantId Id of the selected tenant
     */
    tenantChange(tenantId: string) {
        if (!!tenantId && !this.loadedTenants.includes(tenantId)) {
            this.dataSrv.getPipelines$(tenantId).toPromise().then(pipelines => {
                this.pipelineStore.concatenate(pipelines);
                this.loadedTenants = [...this.loadedTenants, tenantId];
            });
        }

        this.selectedTenant$.next(tenantId);
    }

    /**
     * Set parent pipeline id to expand
     * @param runId Parent pipeline id
     */
    async expandIdChange(runId: string) {
        if (runId && !this.loadedParents.includes(runId)) {
            this.dataSrv.getChildPipelines$(runId).toPromise().then(pipelines => {
                this.pipelineStore.concatenate(pipelines);
                this.loadedParents.push(runId);
            });
        }

        this.expandedParent$.next(runId);
    }

    /** Loads translation tokens */
    private initLocalization() {
        this.localizationSrv.localizeGroup([
            TranslationGroup.core,
            TranslationGroup.common,
            TranslationGroup.recoveryManager
        ]);
    }

    /** Sets the page's title */
    private async setTitleAsync(): Promise<void> {
        this.titleSrv.setTitle('HxGN Connect');
        const title = await this.localizationSrv.getTranslationAsync(this.tokens.recoveryManager);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }
}
