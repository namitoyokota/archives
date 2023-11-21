import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { PresetOptionsTranslationTokens } from './preset-options.translation';

@Component({
    selector: 'hxgn-commonnotifications-preset-options',
    templateUrl: 'preset-options.component.html',
    styleUrls: ['preset-options.component.scss', '../../shared/common-dialog-styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PresetOptionsComponent {

    /** Output for when cancel button is selected. */
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

    /** Output for selected preset. */
    @Output() selectedPreset: EventEmitter<number> = new EventEmitter<number>();

    /** Expose translation tokens to html. */
    tokens: typeof PresetOptionsTranslationTokens = PresetOptionsTranslationTokens;

    constructor() { }
}
