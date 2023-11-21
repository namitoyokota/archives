import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonConfirmDialogComponent } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import {
    Action$v1,
    Operation$v1,
    Pipeline$v1,
    PipelineColumn$v1,
    Scope$v1,
    Status$v1,
} from '@galileo/web_commonrecovery/_common';
import {
    CoreService,
    DataService,
    PipelineStoreService,
    RestoreDialogComponent,
    SettingsDialogComponent,
} from '@galileo/web_commonrecovery/_core';
import { Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TranslatedTokens, TranslationTokens } from './organizations-management.translation';

@Component({
    selector: 'hxgn-commonrecovery-organizations-management',
    templateUrl: './organizations-management.component.html',
    styleUrls: ['./organizations-management.component.scss']
})
export class OrganizationsManagementComponent implements OnInit, OnDestroy {

    /** View child for search input. */
    @ViewChild('search') searchInput: ElementRef;

    /** List of pipelines for current tenant */
    @Input('pipelines')
    set setPipelines(pipelines: Pipeline$v1[]) {
        if (this.organizations.length && pipelines.length) {
            this.history = pipelines;
            this.backups = this.history.filter(pipeline => pipeline.operation === Operation$v1.backup && pipeline.isAvailable);
            this.canRun = !this.history.some(pipeline => pipeline.status === Status$v1.running);
        }
    }

    /** List of organizations with backup */
    @Input() organizations: Tenant$v1[];

    /** List of tenantIds that's been loaded */
    @Input('loadedTenants')
    set setLoadedTenants(tenantIds: string[]) {
        this.loadedTenants = tenantIds;
        this.isLoading = !this.loadedTenants.includes(this.selectedTenant?.id);
    }

    /** Emits when tenant select changes */
    @Output() selectChange: EventEmitter<string> = new EventEmitter<string>();

    /** Bus for search string. */
    private searchString: BehaviorSubject<string> = new BehaviorSubject<string>('');

    /** Search string observable. */
    readonly searchString$: Observable<string> = this.searchString.asObservable();

    /** Flag used to track whether backup is currently running */
    canRun = true;

    /** Flag to indicate whether pipelines have loaded */
    isLoading = true;

    /** Flag to indicate whether to display deleted tenants */
    showDeleted = false;

    /** List of tenantIds that are already loaded */
    loadedTenants: string[];

    /** Flag to indicate that selected tenant is deleted */
    isDeleted = false;

    /** Filtered pipelines for only backups */
    backups: Pipeline$v1[] = [];

    /** Filtered pipelines for non-backup operations */
    history: Pipeline$v1[] = [];

    /** Currently selected tenant */
    selectedTenant: Tenant$v1 = { id: this.coreSrv.systemTenantId } as Tenant$v1;

    /** Expose pipeline type enum to HTML */
    scope: typeof Scope$v1 = Scope$v1;

    /** Expose pipeline column enum to HTML */
    pipelineColumn: typeof PipelineColumn$v1 = PipelineColumn$v1;

    /** Expose operation enum to HTML */
    operation: typeof Action$v1 = Action$v1;

    /** Expose translations to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    /** Name in tenant object used to indicate deleted */
    readonly deletedOrganization = '[Deleted Organization]';

    /** Destory subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private coreSrv: CoreService,
        private dataSrv: DataService,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private pipelineStore: PipelineStoreService,
        private dialog: MatDialog
    ) { }

    /** On init lifecycle hook */
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
     * Sets search string
     * @param $event Input event
     */
    setSearchString($event) {
        this.searchString.next($event.target.value);
    }

    /** Clears textbox for search */
    clearText() {
        this.searchString.next('');
        this.searchInput.nativeElement.value = '';
    }

    /** Event called when tenant select changes */
    async changeSelect(organization: Tenant$v1) {
        if (organization) {
            this.selectedTenant = organization;
            this.isDeleted = organization.name === this.deletedOrganization;
            this.isLoading = !this.loadedTenants.includes(this.selectedTenant?.id);
            this.selectChange.emit(this.getTenantId());
        }
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
    async backupTenant() {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            width: '500px',
            data: {
                titleToken: (this.getTenantId() === Scope$v1.system) ? this.tokens.backupSystem : this.tokens.backupOrganization,
                msgToken: this.tokens.backupWarningMsg
            }
        }).afterClosed().subscribe(async (val) => {
            if (val) {
                this.canRun = false;
                await this.dataSrv.backup$(this.getTenantId()).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Restore currently selected tenant from latest backup */
    async restoreLatest() {
        this.dialog.open(RestoreDialogComponent, {
            height: '600px',
            width: '930px',
            disableClose: true,
            data: {
                runId: this.backups[0].runId,
                tenantId: this.getTenantId()
            }
        }).afterClosed().subscribe(async capabilities => {
            if (capabilities) {
                this.canRun = false;
                await this.dataSrv.restore$(capabilities, this.getTenantId()).toPromise().then(response => {
                    this.pipelineStore.upsert(response);
                });
            }
        });
    }

    /** Get id used to call API */
    getTenantId() {
        return (this.selectedTenant?.id.toLowerCase() === Scope$v1.system) ? Scope$v1.system : this.selectedTenant?.id;
    }

    /** Toggle show deleted button */
    toggleDeleted() {
        this.showDeleted = !this.showDeleted;
    }

    /** Set up routine for localization. */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.search = translatedTokens[TranslationTokens.search];
        this.tTokens.backupOrganization = translatedTokens[TranslationTokens.backupOrganization];
        this.tTokens.backupSystem = translatedTokens[TranslationTokens.backupSystem];
        this.tTokens.backupWarningMsg = translatedTokens[TranslationTokens.backupWarningMsg];
    }
}
