import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InternalRibbonTranslationTokens } from './internal-ribbon.translation';

@Component({
    selector: 'hxgn-commontenant-internal-ribbon',
    templateUrl: 'internal-ribbon.component.html',
    styleUrls: ['internal-ribbon.component.scss']
})
export class InternalRibbonComponent {

    /** A flag that is true if all data is being shared */
    @Input() shareAllData = true;

    /** A flag that is true if filter by group is enabled */
    @Input() filterByGroup: boolean;

    /** Event when the state of data sharing changes */
    @Output() shareAllDataChange = new EventEmitter<boolean>();

    /** The "My Data Sharing Network" button has been clicked" */
    @Output() editSharingNetwork = new EventEmitter<void>();

    /** The edit sharing presets button has been clicked */
    @Output() editPresets = new EventEmitter<void>();

    /** The edit define my data types button has been clicked */
    @Output() editDataTypes = new EventEmitter<void>();

    /** THe edit all button has been clicked */
    @Output() editAll = new EventEmitter<void>();

    /** Expose InternalRibbonTranslationTokens to HTML */
    tokens: typeof InternalRibbonTranslationTokens = InternalRibbonTranslationTokens;

    constructor() { }
}
