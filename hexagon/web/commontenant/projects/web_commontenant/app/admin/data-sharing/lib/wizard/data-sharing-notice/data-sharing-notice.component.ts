import { Component } from '@angular/core';
import { DataSharingNoticeTranslationTokens } from './data-sharing-notice.translation';

@Component({
    selector: 'hxgn-commontenant-data-sharing-notice',
    templateUrl: 'data-sharing-notice.component.html',
    styleUrls: ['data-sharing-notice.component.scss']
})
export class DataSharingNoticeComponent {

    /** Expose DataSharingNoticeTranslationTokens to HTML */
    tokens: typeof DataSharingNoticeTranslationTokens = DataSharingNoticeTranslationTokens;

    constructor() { }
}
