import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonConfirmDialogComponent, ConfirmDialogData, PopoverPosition } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Tenant$v1, TranslationGroup } from '@galileo/web_commontenant/_common';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { CoreService } from '../../core.service';
import { DataService$v2 } from '../../data.service.v2';
import { TenantStoreService } from '../../tenant-store.service';
import { OrganizationListTranslatedTokens, OrganizationListTranslationTokens } from './organization-list.translation';

enum SelectOptions {
    overview = 'Overview',
    system = 'System'
}

@Component({
    selector: 'hxgn-commontenant-organization-list',
    templateUrl: 'organization-list.component.html',
    styleUrls: [
        'organization-list.component.scss',
        '../../shared/filter-dialog.component.scss'
    ]
})
export class OrganizationListComponent implements OnInit, OnDestroy {

    /** List of organizations */
    @Input('organizations')
    set setOrganizations(organizations: Tenant$v1[]) {
        organizations = organizations.filter(t => t.id !== this.otherTenantId);
        this.organizations.next(this.sortOrganizations(organizations));
    }

    /** String to search the list by */
    @Input() searchString$: Observable<string> = new Observable<string>();

    /** Currently selected organization */
    @Input() selectedOrganization: Tenant$v1 = null;

    /** Flag to display overview element in list */
    @Input() showOverview = false;

    /** Flag to display system element in list */
    @Input() showSystem = false;

    /** Flag to display onboarding indicators */
    @Input() showOnboarding = false;

    /** Flag to display delete tenant button */
    @Input() showDelete = false;

    /** Emits when selected tenant change */
    @Output() selection = new EventEmitter<Tenant$v1>();

    /** Store for organizations */
    private organizations = new BehaviorSubject<Tenant$v1[]>([]);

    /** List of organizations to display */
    organizations$: Observable<Tenant$v1[]> = new Observable<Tenant$v1[]>();
    /** Map of onboarding statuses */
    onboardingMap: Map<string, boolean> = new Map<string, boolean>();

    /** Popover position. */
    popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

    /** Expose enum to HTML */
    selectOptions: typeof SelectOptions = SelectOptions;

    /** Expose translation tokens to html template */
    tokens: typeof OrganizationListTranslationTokens = OrganizationListTranslationTokens;

    /** Translated tokens */
    tTokens: OrganizationListTranslatedTokens = {} as OrganizationListTranslatedTokens;

    /** Tenant id used from backend for system data */
    readonly otherTenantId = '00000000-0000-0000-0000-000000000000';

    /** Observable for component destroyed */
    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private coreSrv: CoreService,
        private dataSrv: DataService$v2,
        private dialog: MatDialog,
        private tenantStore: TenantStoreService
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.initLocalizationAsync();

        this.organizations$ = combineLatest([
            this.organizations.asObservable(),
            this.searchString$
        ]).pipe(
            map(([organizations, searchString]) => {
                let filterOrganizations: Tenant$v1[] = [].concat(organizations);

                if (searchString) {
                    filterOrganizations = filterOrganizations.filter(organization => {
                        return organization.name.toLocaleLowerCase().includes(searchString.toLocaleLowerCase());
                    });
                }

                return filterOrganizations;
            })
        );

        this.organizations$.pipe(takeUntil(this.destroy$)).subscribe((organizations: Tenant$v1[]) => {
            organizations.map(organization => {
                const complete = this.coreSrv.isOnboardingCompleted(organization.onboardingConfiguredSteps, organization.applicationIds);
                this.onboardingMap.set(organization.id, complete);
            });

            const setInitialTenant = !this.showOverview && !this.selectedOrganization && organizations.length > 0;
            if (setInitialTenant) {
                this.selectionChange(organizations[0]);
            } else {
                const defaultOrganization = new Tenant$v1();
                if (this.showOverview) {
                    defaultOrganization.id = SelectOptions.overview;
                } else if (this.showSystem) {
                    defaultOrganization.id = SelectOptions.system;
                }
                this.selectedOrganization = defaultOrganization;
            }
        });

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalizationAsync();
        });
    }

    /**
     * On destroy life cycle hook
     */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Emits event for new organization selected
     * @param organization Organization to select
     */
    selectionChange(organization: Tenant$v1) {
        this.selection.emit(organization);
    }

    /**
     * Emits event for when overview is selected
     */
    selectOverview() {
        const overview = new Tenant$v1();
        overview.id = SelectOptions.overview;
        this.selection.emit(overview);
    }

    /**
     * Emits event for when overview is selected
     */
    selectSystem() {
        const system = new Tenant$v1();
        system.id = SelectOptions.system;
        this.selection.emit(system);
    }

    /**
     * Deletes specified tenant after confirmation.
     * @param tenant Tenant to delete
     */
    deleteOrganization(organization: Tenant$v1): void {
        this.dialog.open(CommonConfirmDialogComponent, {
            disableClose: true,
            autoFocus: false,
            data: {
                titleToken: this.tokens.areYouSure,
                msgToken: this.tokens.deletingMsg
            } as ConfirmDialogData
        }).afterClosed().subscribe(result => {
            if (result) {
                this.dataSrv.tenant.delete$(organization.id).toPromise().then(() => {
                    this.tenantStore.remove(organization.id);
                    if (this.selectedOrganization.id === organization.id) {
                        const newSelection: Tenant$v1 = this.organizations.getValue()[0];
                        this.selectionChange(newSelection);
                    }
                });
            }
        });
    }

    /**
     * Sorts organizations by name.
     */
    private sortOrganizations(organizations: Tenant$v1[]): Tenant$v1[] {
        return organizations.sort((a, b) => {
            if (a.name?.toLocaleLowerCase() > b.name?.toLocaleLowerCase() ||
                a.name?.startsWith('[')) {
                return 1;
            } else if (a.name?.toLocaleLowerCase() < b.name?.toLocaleLowerCase()) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Set up routine for localization
     */
    private async initLocalizationAsync(): Promise<void> {
        this.localizationSrv.localizeGroup([
            TranslationGroup.main
        ]);

        const tokens: string[] = Object.keys(OrganizationListTranslationTokens).map(k => OrganizationListTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.areYouSure = translatedTokens[OrganizationListTranslationTokens.areYouSure];
        this.tTokens.deletingMsg = translatedTokens[OrganizationListTranslationTokens.deletingMsg];
        this.tTokens.deletedOrganization = translatedTokens[OrganizationListTranslationTokens.deletedOrganization];
    }
}
