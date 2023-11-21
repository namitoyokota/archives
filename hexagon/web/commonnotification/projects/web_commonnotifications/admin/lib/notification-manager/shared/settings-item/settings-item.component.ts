import { Component, HostBinding, Input } from '@angular/core';
import { NotificationSettings$v1 } from '@galileo/web_commonnotifications/_common';

import { SettingsItemTranslationTokens } from './settings-item.translation';

@Component({
    selector: 'hxgn-commonnotifications-settings-item',
    templateUrl: 'settings-item.component.html',
    styleUrls: ['settings-item.component.scss']
})
export class SettingsItemComponent {

    /** Used to track when default system defined presets are being shown. */
    @Input() isDefaultItems = false;

    /** Whether or not this item is selected. */
    @Input() @HostBinding('class.selected') isSelected = false;

    /** The settings info to display. */
    @Input() settings: NotificationSettings$v1;

    /** Show default star if settings item is default preset. */
    @Input() showDefault = false;

    /** Expose translation tokens to html. */
    tokens: typeof SettingsItemTranslationTokens = SettingsItemTranslationTokens;

    constructor() { }
}
