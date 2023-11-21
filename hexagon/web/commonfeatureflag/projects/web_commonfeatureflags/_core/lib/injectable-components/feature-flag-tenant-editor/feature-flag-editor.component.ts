import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import {
    FeatureFlag$v2,
    FeatureFlagEditorSettings$v2,
    FlagState$v1,
    GlobalStates$v1,
    LAYOUT_MANAGER_SETTINGS,
    Scope$v1,
} from '@galileo/web_commonfeatureflags/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

import { FlagStateRequest$v2 } from '../../abstractions/flag-state-request.v2';
import { DataService$v2 } from '../../data.service.v2';
import { ForcePushViewDialogComponent } from '../../share/force-push-dialog/force-push-dialog.component';
import { FeatureFlagEditorTranslationTokens } from './feature-flag-editor.translation';

@Component({
    templateUrl: 'feature-flag-editor.component.html',
    styleUrls: ['feature-flag-editor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureFlagTenantEditorComponent implements OnInit, OnDestroy {

    /** List of all feature flags in the system */
    featureFlags: FeatureFlag$v2[];

    /** List of all feature flag states globally and tenant wide */
    globalStates: GlobalStates$v1;

    /** List of flag states currently displayed */
    currentStates: FlagState$v1[];

    /** List of all edited flags */
    editedFlags: string[];

    /** Flag to indicate when in process of saving */
    saving = false;

    /** Flag that is true if there are unsaved changes */
    isDirty = false;

    /** Toggle for whether to force changes to tenants */
    forcePush = false;

    /** Expose FeatureFlagEditorTranslationTokens to HTML */
    tokens: typeof FeatureFlagEditorTranslationTokens = FeatureFlagEditorTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private settings: FeatureFlagEditorSettings$v2,
        private dataService: DataService$v2,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /**
     * On init lifecycle hook
     */
    async ngOnInit() {
        this.featureFlags = await this.dataService.featureFlag.getAll().toPromise();
        this.initLocalization();
        this.globalStates = await this.dataService.featureFlag.getStates(this.settings.getTenant()).toPromise();
        this.setStates();

        this.cdr.markForCheck();
        this.cdr.detectChanges();

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
     * Event when active feature flags change
     * @param flagIds Active feature flag id list
     */
    flagsChange(flagIds: string[]): void {
        this.currentStates.map(state => {
            state.enabled = flagIds.includes(state.flagId);
        });
    }

    /**
     * Event when optional feature flags change
     * @param flagIds Unlocked feature flag id list
     */
    unlocksChange(flagIds: string[]): void {
        this.currentStates.map(state => {
            state.tenantOptional = flagIds.includes(state.flagId);
        });
    }

    /**
     * Event when tenant override removed
     * @param flagIds Removed override flag id list
     */
    overrideChange(flagIds: string[]): void {
        this.currentStates.map(state => {
            state.removeCurrentLevelOverride = flagIds.includes(state.flagId);
        });
    }

    /**
     * Event when toggle for either enable or lock ahcnge
     * @param flagIds All of the edited feature flag id list
     */
    allChange(flagIds: string[]): void {
        this.editedFlags = flagIds;
        this.isDirty = true;
    }

    /**
     * Event when force push check box toggled
     * @param event checkbox for force push
     */
    toggleForce(event: MatCheckboxChange) {
        this.forcePush = event.checked;
    }

    /**
     * Prompt the user with a warning dialog
     */
    confirm(): void {
        if (this.forcePush) {
            const friendlyNames = this.editedFlags.filter(id =>
                !this.currentStates.find(flag => flag.flagId === id).removeCurrentLevelOverride
            ).map(id => {
                return this.featureFlags.find(ff => ff.flagId === id).friendlyName;
            });
            this.dialog.open(ForcePushViewDialogComponent, {
                disableClose: true,
                width: '500px',
                data: {
                    globalMode: false,
                    friendlyNames
                }
            }).afterClosed().subscribe((val) => {
                if (val) {
                    this.save();
                }
            });
        } else {
            this.save();
        }
    }

    /**
     * Saves any flags that have been changed
     */
    save() {
        this.settings.tenantId$.pipe(
            first()
        ).subscribe(async tenantId => {
            this.saving = true;

            const update: FlagStateRequest$v2[] = this.featureFlags.filter(ff =>
                this.editedFlags.includes(ff.flagId)
            ).map(flag => {
                const flagState = this.currentStates.find(ff => ff.flagId === flag.flagId);
                return new FlagStateRequest$v2({
                    featureFlag: flag,
                    enabled: flagState.enabled,
                    tenantOptional: flagState.tenantOptional,
                    forcePushLevelsBelow: this.forcePush && !flagState.removeCurrentLevelOverride,
                    removeCurrentLevelOverride: flagState.removeCurrentLevelOverride
                });
            });

            this.dataService.featureFlag.update(update, tenantId).toPromise().then(async () => {
                this.settings.complete();
                this.isDirty = false;
                this.globalStates = await this.dataService.featureFlag.getStates(this.settings.getTenant()).toPromise();
                this.cancel();
                this.saving = false;
                this.cdr.detectChanges();
            });
        });
    }

    /**
     * Cancels any changes
     */
    cancel(): void {
        this.setStates();
        this.forcePush = false;
        this.isDirty = false;
    }

    /**
     * Sets all feature flag states to display
     */
    private setStates(): void {
        this.currentStates = [];
        this.editedFlags = [];

        this.featureFlags.forEach(ff => {
            let flagData: FlagState$v1 = this.globalStates.tenant.find(flag => flag.flagId === ff.flagId);

            if (flagData) {
                flagData.forcePushLevelsBelow = true;
            } else {
                flagData = this.globalStates.global.find(flag => flag.flagId === ff.flagId);

                if (!flagData) {
                    flagData = new FlagState$v1({
                        flagId: ff.flagId,
                        enabled: false,
                        tenantOptional: false,
                        forcePushLevelsBelow: false,
                        removeCurrentLevelOverride: false,
                        lastModifiedDate: ff.lastModifiedTime
                    });
                }
            }

            flagData.scope = ff.scope;
            flagData.editable = ff.scope === Scope$v1.tenant || ff.scope === Scope$v1.any;
            this.currentStates = [...this.currentStates, { ...flagData }];
        });
    }

    private initLocalization() {
        const mapTokens = [];
        this.featureFlags.forEach(flag => {
            mapTokens.push(flag.descriptionToken);
            mapTokens.push(flag.friendlyName);
        });
        this.localizationSrv.localizeStringsAsync(mapTokens);
    }
}
