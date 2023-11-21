import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Title } from '@angular/platform-browser';
import { HTTPCode } from '@galileo/web_common-http';
import {
  CommonConfirmDialogComponent,
  CommonUnsavedChangesDialogComponent,
  CommonUnsavedChangesDialogOptions,
  ConfirmDialogData,
  DirtyComponent$v1,
} from '@galileo/web_common-libraries';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import {
  capabilityId,
  CompatibleOptions,
  CompositeIcon$v1,
  FeatureFlags,
  KeywordRule$v1,
  KeywordRuleGroup$v1,
  KeywordRuleset$v1,
  TranslationGroup,
} from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CapabilityManifest$v1, CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { BehaviorSubject, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { CompositeIconService } from './composite-icon.service';
import { GroupListPaneComponent } from './group-list-pane/group-list-pane.component';
import { IconManagementService } from './icon-management.service';
import { TranslationTokens } from './icon-management.translation';
import { KeywordRulesetStoreService } from './keyword-ruleset-store.service';
import { PrimitiveIconStoreService } from './primitivie-icon-store.service';
import { UploadIconDialogComponent } from './upload-icon-dialog/upload-icon-dialog.component';

@Component({
    selector: 'hxgn-commonkeywords-icon-management',
    templateUrl: 'icon-management.component.html',
    styleUrls: ['icon-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconManagementComponent implements OnInit, OnDestroy, DirtyComponent$v1 {

    /** Reference to the group list component */
    @ViewChild('groupList', { static: true }) groupList: GroupListPaneComponent;

    /** Reference to the capability tabs */
    @ViewChild('capabilityTabs', { static: true }) tabs: MatTabGroup;

    /** List of industry's that icons can be made for */
    industryList = [];

    /** Ruleset that matches the database */
    currentRuleset: KeywordRuleset$v1;

    /** The node that is currently selected for editing */
    selectedGroupId: string;

    /** The currently selected industry */
    selectedIndustry: string;

    /** List of capabilities that support icon management */
    capabilityList: CapabilityManifest$v1[] = [];

    /** The loading pane is shown when true; */
    isLoading = true;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Map for translated capability tokens. */
    capabilityTokens: Map<string, string> = new Map<string, string>();

    /** Indicates whether rules are valid to save changes */
    isValid = false;

    /** Bus for is dirty. */
    isDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** IsDirty implementation from DirtyComponent. */
    isDirty$ = this.isDirty.asObservable();

    /** Flag to incidate whether upload feature flag is on or not */
    ffUploadIcons = this.ffAdapter.isActive(FeatureFlags.uploadIcons);

    private skipCapabilityChangeCheck = false;

    private destroy$: Subject<void> = new Subject<void>();

    constructor(
        private iconManagementSrv: IconManagementService,
        private localizationAdapter: CommonlocalizationAdapterService$v1,
        private primitiveIconStore: PrimitiveIconStoreService,
        private dialog: MatDialog,
        private tenantAdapter: CommontenantAdapterService$v1,
        private compositeIconSrv: CompositeIconService,
        private dataSrv: DataService,
        private cdr: ChangeDetectorRef,
        private errorNotification: MatSnackBar,
        public ruleStore: KeywordRulesetStoreService,
        private identitySrv: CommonidentityAdapterService$v1,
        private titleSrv: Title,
        private ffAdapter: CommonfeatureflagsAdapterService$v1
    ) {
        this.initLocalization();
        this.setTitle();
    }

    async ngOnInit() {
        this.capabilityList = (await this.tenantAdapter.getCapabilityListAsync(capabilityId))?.filter(manifest => {
            const settings: CompatibleOptions = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CompatibleOptions;
            if (settings?.featureFlag && !this.ffAdapter.isActive(settings.featureFlag)) {
                return false;
            }

            return true;
        });

        if (this.capabilityList) {

            // Set currently selected capabilities to first index
            this.iconManagementSrv.selectedCapability = this.capabilityList[0].id;

            // Localize capability names
            this.localizeCapabilities();

            // Load primitive icon for each capability
            this.capabilityList.forEach(capability => {
                this.primitiveIconStore.load(capability.id);
            });
        }

        // Filter industries by current user's tenant.
        const user = await this.identitySrv.getUserInfoAsync();
        const tenant = await this.tenantAdapter.getTenantAsync(user.activeTenant);
        const industries = await this.tenantAdapter.getIndustriesAsync();

        industries.forEach(industry => {
            if (tenant.industryIds.includes(industry.id)) {
                this.industryList.push(industry);
            }
        });

        if (this.industryList.length) {
            this.selectedIndustry = this.industryList[0].id;
        }

        this.ruleStore.unsavedGroups$.pipe(takeUntil(this.destroy$)).subscribe(groups => {
            this.isDirty.next(groups.length > 0);
        });

        this.ruleStore.ruleset$.pipe(takeUntil(this.destroy$)).subscribe(ruleset => {
            this.isValid = !ruleset.rules.some(rule => !rule.friendlyName?.trim() || !rule.keywords?.length);
        });

        this.cdr.detectChanges();
        this.cdr.markForCheck();

        this.localizationAdapter.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            this.initLocalization();
            this.setTitle();
            this.localizeCapabilities();
        });
    }

    ngOnDestroy(): void {
        this.iconManagementSrv.selectedLayerIndex = null;
        this.iconManagementSrv.selectedPrimitiveIconId = null;
        this.primitiveIconStore.clear();

        this.destroy$.next();
        this.destroy$.complete();

        // Clean up
        this.discardChanges();
    }

    /**
     * Sets the selected node
     * @param node The node to selected
     */
    setSelectedGroup(group: KeywordRuleGroup$v1) {
        this.selectedGroupId = group ? group.id : null;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }

    /**
     * Event that is raised when a new default icon is created
     */
    onDefaultCreated(icon: CompositeIcon$v1) {
        this.ruleStore.group$(this.selectedGroupId).pipe(
            first()
        ).subscribe((group) => {
            const updatedGroup = new KeywordRuleGroup$v1(group);
            updatedGroup.resourceId = icon.id;

            this.ruleStore.updateGroup(updatedGroup);
            this.selectedGroupId = updatedGroup.id;
        });
    }

    /**
     * Save changes
     */
    async saveChangesAsync(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.isLoading = true;

            this.ruleStore.ruleset$.pipe(
                first()
            ).subscribe(async ruleset => {
                // Get icons to save
                const response = await this.dataSrv.compositeIcon.upsertRuleset$(ruleset, this.compositeIconSrv.getNewIcons())
                    .toPromise().catch(async (err) => {
                        let errorMsg: string;

                        if (err.statusCode === HTTPCode.Conflict) {
                            errorMsg = await this.localizationAdapter.getTranslationAsync(TranslationTokens.cannotSaveRulesetConflict);
                        } else {
                            errorMsg = await this.localizationAdapter.getTranslationAsync(TranslationTokens.cannotSaveUnexpectedError);
                        }

                        this.errorNotification.open(errorMsg, err.status, {
                            duration: 8000
                        });
                    });

                if (response) {
                    // Need to update the etag for the composite icons
                    response.icons.forEach(async icon => {
                        await this.compositeIconSrv.updateAsync(new CompositeIcon$v1(icon));
                    });
                    this.compositeIconSrv.clearNewIcons();
                    this.ruleStore.setRuleset(new KeywordRuleset$v1(response.ruleset));
                }

                this.isLoading = false;
                this.cdr.detectChanges();
                this.cdr.markForCheck();

                resolve();
            });
        });
    }

    /**
     * Discard unsaved changes
     */
    discardChanges() {
        this.ruleStore.discardChanges();
        this.compositeIconSrv.clearNewIcons();
    }

    /**
     * Load in the correct ruleset based on when industry changes
     * @param industry The industry to get a ruleset for
     */
    async loadRuleset(industry: string) {
        // Check for unsaved changes
        if (industry !== this.selectedIndustry) {

            this.ruleStore.unsavedGroups$.pipe(
                first()
            ).subscribe(async groups => {

                if (!groups.length) {
                    this.selectedIndustry = industry;
                    this.ruleStore.setRuleset(null);
                    this.loadRuleSetForIndustry(this.iconManagementSrv.selectedCapability, this.selectedIndustry);
                    return;
                }

                const dialogRef = this.dialog.open(CommonConfirmDialogComponent, {
                    disableClose: true,
                    autoFocus: false,
                    data: {
                        titleToken: TranslationTokens.areYouSure,
                        msgToken: TranslationTokens.discardChangesMsg
                    } as ConfirmDialogData
                });

                dialogRef.afterClosed().subscribe((response) => {
                    if (response) {
                        // Clean up
                        this.discardChanges();

                        this.selectedIndustry = industry;
                        this.loadRuleSetForIndustry(this.iconManagementSrv.selectedCapability, this.selectedIndustry);
                    } else {
                        // Undo selection change
                        this.groupList.selectedIndustry = this.selectedIndustry;
                    }
                });
            });
        } else {
            this.selectedIndustry = industry;
            this.loadRuleSetForIndustry(this.iconManagementSrv.selectedCapability, this.selectedIndustry);
        }
    }

    /**
     * Sets the currently selected capability.
     * @param id Id of the capability to set as being selected
     */
    async setSelectedCapability(event: MatTabChangeEvent) {
        if (this.skipCapabilityChangeCheck) {
            this.skipCapabilityChangeCheck = false;
            return;
        }

        this.groupList.searchString = '';

        // Check to make sure not trying to change to currently selected capability
        const capabilityIndex = this.capabilityList.findIndex(c => c === this.iconManagementSrv.selectedCapability);
        if (capabilityIndex === this.tabs.selectedIndex) {
            return;
        }

        this.ruleStore.unsavedGroups$.pipe(
            first()
        ).subscribe(groups => {
            if (groups.length) {
                this.dialog.open(CommonUnsavedChangesDialogComponent, {
                    disableClose: true,
                    autoFocus: false
                }).afterClosed().subscribe(async (response) => {
                    if (response.selection === CommonUnsavedChangesDialogOptions.cancel) {
                        this.skipCapabilityChangeCheck = true;
                        this.tabs.selectedIndex = this.capabilityList.findIndex(c => c.id === this.iconManagementSrv.selectedCapability);
                        this.cdr.detectChanges();
                        this.cdr.markForCheck();
                        return;
                    } else if (response.selection === CommonUnsavedChangesDialogOptions.saveChanges) {
                        // Save
                        await this.saveChangesAsync();
                    } else {
                        // Discard
                        this.discardChanges();
                    }

                    this.ruleStore.setRuleset(null);
                    this.selectedGroupId = null;
                    this.isLoading = false;
                    this.discardChanges();
                    this.iconManagementSrv.selectedCapability = this.capabilityList[event.index].id;
                    this.loadRuleSetForIndustry(this.iconManagementSrv.selectedCapability, this.selectedIndustry);
                });
            } else {
                this.ruleStore.setRuleset(null);
                this.selectedGroupId = null;
                this.groupList.selectedGroup = null;
                this.iconManagementSrv.selectedCapability = this.capabilityList[event.index].id;
                this.loadRuleSetForIndustry(this.iconManagementSrv.selectedCapability, this.selectedIndustry);
                this.cdr.detectChanges();
                this.cdr.markForCheck();
            }
        });
    }

    /**
     * Loads the rule set and needed meta data for a capability
     * @param id The capabilityId current selected
     * @param industry The industry currently selected
     */
    private async loadRuleSetForIndustry(id: string, industry: string) {
        this.isLoading = true;

        const ruleSet = await this.dataSrv.ruleset.get$(id, industry).toPromise();
        if (ruleSet) {
            this.ruleStore.setRuleset(ruleSet);
        } else {
            this.ruleStore.setRuleset(new KeywordRuleset$v1({
                industryId: this.selectedIndustry,
                capabilityId: this.iconManagementSrv.selectedCapability
            }));
        }

        this.isLoading = false;

        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }

    /** Add new rule to the store */
    addNewRule(rule: KeywordRule$v1) {
        this.ruleStore.addRule(rule);
    }

    /** Oepn upload icon dialog */
    openUploadIconDialog() {
        this.dialog.open(UploadIconDialogComponent, {
            height: '500px',
            width: '550px',
            autoFocus: false,
            disableClose: true,
            data: {
                capabilityList: this.capabilityList,
                defaultCapability: this.capabilityList.find(c => c.id === this.iconManagementSrv.selectedCapability)
            }
        });
    }

    /** Sets the page's title */
    private async setTitle() {
        this.titleSrv.setTitle('HxGN Connect');
        const title = await this.localizationAdapter.getTranslationAsync(this.tokens.iconManager);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }

    private initLocalization() {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.iconAdmin,
            TranslationGroup.core
        ]);
    }

    private localizeCapabilities() {
        const capabilityNameTokens: string[] = this.capabilityList.map(x => x.nameToken);
        this.localizationAdapter.localizeStringsAsync(capabilityNameTokens).then(async () => {
            const translatedTokens = await this.localizationAdapter.getTranslationAsync(capabilityNameTokens);
            capabilityNameTokens.forEach((token: string) => {
                this.capabilityTokens.set(token, translatedTokens[token]);
            });

            // Sort capability list
            this.capabilityList.sort((a, b) => translatedTokens[a.nameToken] > translatedTokens[b.nameToken] ? 1 : -1);
        });
    }
}
