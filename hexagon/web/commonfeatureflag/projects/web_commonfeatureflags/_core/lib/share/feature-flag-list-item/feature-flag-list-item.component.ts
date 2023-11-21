import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FeatureFlag$v2, Scope$v1 } from '@galileo/web_commonfeatureflags/_common';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
    FeatureFlagListItemTranslatedTokens,
    FeatureFlagListItemTranslationTokens,
} from './feature-flag-list-item.translation';

@Component({
    selector: 'hxgn-commonfeatureflags-list-item-v2',
    templateUrl: 'feature-flag-list-item.component.html',
    styleUrls: ['feature-flag-list-item.component.scss']
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class FeatureFlagsListItemComponent$v2 implements OnInit, OnDestroy {

    /** Feature flags */
    @Input() featureFlag: FeatureFlag$v2;

    /** Whether or not the item is in global or tenant mode */
    @Input() globalMode: boolean;

    /** Whether or not the iteam is in provisioner view */
    @Input() provisionerMode: boolean;

    /** Level of the scope this flag can be edited in */
    @Input() scope: Scope$v1;

    /** Event when a feature flag is enabled */
    @Output() enabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Event when a feature flag is disabled */
    @Output() disabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Event when a feature flag is unlocked */
    @Output() unlocked: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Event when a feature flag is locked */
    @Output() locked: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Event when a flag override is removed */
    @Output() remove: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Flag that is true when the feature flag is active */
    isActive = false;

    /** Flag that is true when the feature flag is unlocked */
    isUnlocked = false;

    /** Flag that is true when feature flag is overridden */
    isOverride = false;

    /** Flag that is true when feature flag override is removed */
    isDisabled = false;

    /** Flag that is true when feature flag has been edited */
    isTouched = false;

    /** Flag that is true when feature flag can be locked/unlocked */
    isLockable = false;

    /** Flag that is true when feature flag can be edited */
    isEditable = false;

    /** Expose Scope$v1 to HTML */
    Scope: typeof Scope$v1 = Scope$v1;

    /** Expose FeatureFlagListItemTranslationTokens to HTML */
    tokens: typeof FeatureFlagListItemTranslationTokens = FeatureFlagListItemTranslationTokens;

    /** Translated tokens */
    tTokens: FeatureFlagListItemTranslatedTokens = {} as FeatureFlagListItemTranslatedTokens;

    /** Sets if the flag is currently active */
    @Input('isActive')
    set setIsActive(val) {
        this.isActive = val;
    }

    /** Sets if the flag is currently unlocked */
    @Input('isUnlocked')
    set setIsUnlocked(val) {
        this.isUnlocked = val;
    }

    /** Sets if the flag is overridden in this level */
    @Input('isOverride')
    set setIsOverride(val) {
        this.isOverride = val;
    }

    /** Sets if the flag's override is removed */
    @Input('isDisabled')
    set setIsDisabled(val) {
        this.isDisabled = val;
    }

    /** Sets if the flag has been changed */
    @Input('isTouched')
    set setIsTouched(val) {
        this.isTouched = val;
    }

    /** Sets if the flag can be locked/unlocked */
    @Input('isLockable')
    set setIsLocable(val) {
        this.isLockable = val;
    }

    /** Sets if the flag can be edited */
    @Input('isEditable')
    set setIsEditable(val) {
        this.isEditable = val;
    }

    /** Destory subscription */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.initLocalizationAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe((lang) => {
            if (lang && lang !== '') {
                this.initLocalizationAsync();
            }
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    /**
     * Event that is called when the toggle value changes
     * @param event MatSlideToggleChange event
     */
    changeEnabled(event: MatSlideToggleChange): void {
        if (event.checked) {
            this.enabled.emit(new FeatureFlag$v2(this.featureFlag));
        } else {
            this.disabled.emit(new FeatureFlag$v2(this.featureFlag));
        }
    }

    /**
     * Change current flag to be unlocked
     */
    changeToUnlocked(): void {
        this.unlocked.emit(new FeatureFlag$v2(this.featureFlag));
        this.isUnlocked = true;
    }

    /**
     * Change current flag to be locked
     */
    changeToLocked(): void {
        this.locked.emit(new FeatureFlag$v2(this.featureFlag));
        this.isUnlocked = false;
    }

    /**
     * Removes tenant override
     */
    disableOverride(): void {
        this.remove.emit(new FeatureFlag$v2(this.featureFlag));
        this.isDisabled = true;
    }

    /**
     * Set up routine for localization.
     */
    private async initLocalizationAsync(): Promise<void> {
        const tokens: string[] = Object.keys(FeatureFlagListItemTranslationTokens).map(k => FeatureFlagListItemTranslationTokens[k]);
        const translatedTokens = await this.localizationSrv.getTranslationAsync(tokens);
        this.tTokens.overrideToolTip = translatedTokens[FeatureFlagListItemTranslationTokens.overrideToolTip];
        this.tTokens.scopeToolTip = translatedTokens[FeatureFlagListItemTranslationTokens.scopeToolTip];
        this.tTokens.scopeToolTipLevel = translatedTokens[FeatureFlagListItemTranslationTokens.scopeToolTipLevel];
        this.tTokens.softwareUpdateTooltip = translatedTokens[FeatureFlagListItemTranslationTokens.softwareUpdateTooltip];
    }
}
