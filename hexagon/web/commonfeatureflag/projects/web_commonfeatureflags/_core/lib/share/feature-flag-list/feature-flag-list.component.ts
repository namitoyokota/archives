import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeatureFlag$v2, FlagState$v1, Scope$v1 } from '@galileo/web_commonfeatureflags/_common';

import { FeatureFlagListTranslationTokens } from './feature-flag-list.translation';

@Component({
    selector: 'hxgn-commonfeatureflags-list-v2',
    templateUrl: 'feature-flag-list.component.html',
    styleUrls: ['feature-flag-list.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FeatureFlagsListComponent$v2 {

    /** List of all feature flags */
    @Input() featureFlags: FeatureFlag$v2[];

    /** Whether or not the list is in global or tenant mode */
    @Input() globalMode: boolean;

    /** Whether or not the list is in provisioner mode */
    @Input() provisionerMode: boolean;

    /** Emits a list of active feature flag ids */
    @Output() flagsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Emits a list of unlocked feature flag ids */
    @Output() unlocksChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Emits a list of remove override flag ids */
    @Output() overridesChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Emits a list of all changed feature flag ids */
    @Output() allChanges: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Output for when flag has been disabled. */
    @Output() flagDisabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Output for when flag has been enabled. */
    @Output() flagEnabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** List of active feature flags */
    activeFlagIds: string[];

    /** List of optional feature flags */
    optionalFlagIds: string[];

    /** List of feature flag overrides */
    overrideFlagIds: string[];

    /** List of removed flag overrrides */
    disabledFlagIds: string[];

    /** List of editable flags */
    editableFlagIds: string[] = [];

    /** List of all edited flags */
    changedFlagIds: string[];

    /** Map of scope for each flag */
    scopes: Map<string, Scope$v1> = new Map<string, Scope$v1>();

    /** List of all feature flag states */
    @Input('flagStates')
    set flagStates(flags: FlagState$v1[]) {
        this.resetFlagIds();

        flags.forEach(flag => {
            if (flag.enabled) {
                this.activeFlagIds = [...this.activeFlagIds, flag.flagId];
            }
            if (flag.tenantOptional) {
                this.optionalFlagIds = [...this.optionalFlagIds, flag.flagId];
            }
            if (flag.forcePushLevelsBelow) {
                this.overrideFlagIds = [...this.overrideFlagIds, flag.flagId];
            }
            if (flag.removeCurrentLevelOverride) {
                this.disabledFlagIds = [...this.disabledFlagIds, flag.flagId];
            }
            if (flag.editable) {
                this.editableFlagIds = [...this.editableFlagIds, flag.flagId];
            }
            this.scopes.set(flag.flagId, flag.scope);
        });

        this.featureFlags.forEach(flag => {
            if (flags.find(ff => ff.flagId === flag.flagId)) {
                flag.lastModifiedTime = flags.find(ff => ff.flagId === flag.flagId).lastModifiedDate;
            }
        });
    }

    /** List of already edited flag ids */
    @Input('editedFlags')
    set editedFlags(flagIds: string[]) {
        this.changedFlagIds = flagIds;
    }

    /** Expose FeatureFlagListTranslationTokens to HTML */
    tokens: typeof FeatureFlagListTranslationTokens = FeatureFlagListTranslationTokens;

    constructor() {}

    /**
     * Resets the current flag ids when at new input
     */
    resetFlagIds() {
        this.activeFlagIds = [];
        this.optionalFlagIds = [];
        this.overrideFlagIds = [];
        this.disabledFlagIds = [];
        this.changedFlagIds = [];
    }

    /**
     * Returns true if the given feature flag is active
     * @param id Feature flag id
     */
    isActive(id: string): boolean {
        return this.activeFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Returns true if the given feature flag is optional
     * @param id Feature flag id
     */
    isUnlocked(id: string): boolean {
        return this.optionalFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Returns true if the given feature flag is overritten
     * @param id Feature flag id
     */
    isOverride(id: string): boolean {
        return this.overrideFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Returns true if the given feature flag was removed from override
     * @param id Feature flag id
     */
    isDisabled(id: string): boolean {
        return this.disabledFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Returns true if the given feature flag has been edited
     * @param id Feature flag id
     */
    isTouched(id: string): boolean {
        return this.changedFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Returns true if the given feature flag can be locked/unlocked
     * @param id Feature flag id
     */
    isLockable(id: string): boolean {
        const scope = this.getScope(id);
        return scope === Scope$v1.tenant || scope === Scope$v1.any;
    }

    /**
     * Returns true if the given feature flag can be edited
     * @param id Feature flag id
     */
    isEditable(id: string): boolean {
        return this.editableFlagIds?.some(flagId => flagId === id);
    }

    /**
     * Scope of the given feature flag id
     * @param id Feature flag id
     */
    getScope(id: string): Scope$v1 {
        return this.scopes.get(id);
    }

    /**
     * Disables a feature flag
     * @param flag Feature flag to disable
     */
    disableFlag(flag: FeatureFlag$v2): void {
        this.addChange(flag.flagId);
        this.activeFlagIds = this.activeFlagIds.filter(flagId => flagId !== flag.flagId);
        this.flagsChange.emit(this.activeFlagIds);
        this.flagDisabled.emit(flag);
    }

    /**
     * Enables a feature flag
     * @param flag Feature flag to enable
     */
    enableFlag(flag: FeatureFlag$v2): void {
        this.addChange(flag.flagId);
        this.activeFlagIds = [...this.activeFlagIds, flag.flagId];
        this.flagsChange.emit(this.activeFlagIds);
        this.flagEnabled.emit(flag);
    }

    /**
     * Locks a feature flag
     * @param flag Feature flag to lock
     */
    lockFlag(flag: FeatureFlag$v2): void {
        this.addChange(flag.flagId);
        this.optionalFlagIds = this.optionalFlagIds.filter(flagId => flagId !== flag.flagId);
        this.unlocksChange.emit(this.optionalFlagIds);
    }

    /**
     * Unlocks a feature flag
     * @param flag Feature flag to unlock
     */
    unlockFlag(flag: FeatureFlag$v2): void {
        this.addChange(flag.flagId);
        this.optionalFlagIds = [...this.optionalFlagIds, flag.flagId];
        this.unlocksChange.emit(this.optionalFlagIds);
    }

    /**
     * Removes a feature flag override
     * @param flag Feature flag to disable
     */
    removeOverride(flag: FeatureFlag$v2): void {
        this.addChange(flag.flagId);
        this.disabledFlagIds = [...this.disabledFlagIds, flag.flagId];
        this.overridesChange.emit(this.disabledFlagIds);
    }

    /**
     * Adds the changed feature flag id to list
     * @param flagId Feature flag changed
     */
    addChange(flagId: string): void {
        if (!this.changedFlagIds.includes(flagId)) {
            this.changedFlagIds.push(flagId);
            this.allChanges.emit(this.changedFlagIds);
        }
    }
}
