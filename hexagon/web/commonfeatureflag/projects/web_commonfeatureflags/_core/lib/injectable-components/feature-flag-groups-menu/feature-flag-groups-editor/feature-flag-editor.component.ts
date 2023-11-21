import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FeatureFlag$v2, FlagState$v1 } from '@galileo/web_commonfeatureflags/_common';

@Component({
    selector: 'hxgn-commonfeatureflags-groups-editor',
    templateUrl: 'feature-flag-editor.component.html',
    styleUrls: ['feature-flag-editor.component.scss'],
})
export class FeatureFlagGroupsEditorComponent {
    /** List of all feature flags in the system */
    @Input() featureFlags: FeatureFlag$v2[];

    /** List of feature flag states for all groups */
    @Input() groupStates: FlagState$v1[];

    /** List of already edited flags */
    @Input() editedFlags: string[];

    /** Event when flag changes */
    @Output() flagChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Event when override removed */
    @Output() overrideChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Event when any flag state changes */
    @Output() allChanges: EventEmitter<string[]> = new EventEmitter<string[]>();

    /** Output for when flag has been disabled. */
    @Output() flagDisabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /** Output for when flag has been enabled. */
    @Output() flagEnabled: EventEmitter<FeatureFlag$v2> = new EventEmitter<FeatureFlag$v2>();

    /**
     * Event when active feature flags change
     * @param flagIds Active feature flag id list
     */
    flagsChange(flagIds: string[]): void {
        this.flagChange.emit(flagIds);
    }

    /**
     * Event when override removed for flags
     * @param flagIds Flag id list to override
     */
    overridesChange(flagIds: string[]): void {
        this.overrideChange.emit(flagIds);
    }

    /**
     * Event for any flag state changes
     * @param flagIds Flag ids that were changed
     */
    allChange(flagIds: string[]): void {
        this.allChanges.emit(flagIds);
    }
}
