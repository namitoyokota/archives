import { Component, Input } from '@angular/core';
import { CompositeIcon$v1 } from '@galileo/web_commonkeywords/_common';

import { IconPreviewPaneTranslationTokens } from './icon-preview-pane.translation';

@Component({
    selector: 'hxgn-commonkeywords-icon-preview-pane',
    templateUrl: 'icon-preview-pane.component.html',
    styleUrls: ['icon-preview-pane.component.scss']
})
export class IconPreviewPaneComponent {

    /** Composite icon to show in preview */
    @Input() icon: CompositeIcon$v1;

    /** Export IconPreviewPaneTranslationTokens to HTML */
    tokens: typeof IconPreviewPaneTranslationTokens = IconPreviewPaneTranslationTokens;

    constructor() { }
}
