import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExternalRibbonTranslationTokens } from './external-ribbon.translation';

@Component({
    selector: 'hxgn-commontenant-external-ribbon',
    templateUrl: 'external-ribbon.component.html',
    styleUrls: ['external-ribbon.component.scss']
})
export class ExternalRibbonComponent {

    /** A flag that is true if the tenant wants to receive data */
    @Input() enableDataReceiving = false;

    /** A flag that is true if data sharing is enabled */
    @Input() enabledDataSharing = true;

    /** Event when the state of enable data receiving changes */
    @Output() dataReceivingChange = new EventEmitter<boolean>();

    /** Event when the state of data sharing changes */
    @Output() enabledDataSharingChange = new EventEmitter<boolean>();

    /** The "My Data Sharing Network" button has been clicked" */
    @Output() editSharingNetwork = new EventEmitter<void>();

    /** The edit sharing presets button has been clicked */
    @Output() editPresets = new EventEmitter<void>();

    /** The edit define my data types button has been clicked */
    @Output() editDataTypes = new EventEmitter<void>();

    /** Expose ExternalRibbonTranslationTokens to HTML */
    tokens: typeof ExternalRibbonTranslationTokens = ExternalRibbonTranslationTokens;

    constructor() { }
}
