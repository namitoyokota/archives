import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import { PrimitiveIcon$v2 } from '@galileo/web_commonkeywords/_common';

import { TranslationTokens } from './icon-card.translation';

@Component({
    selector: 'hxgn-commonkeywords-icon-card',
    templateUrl: 'icon-card.component.html',
    styleUrls: ['icon-card.component.scss']
})

export class IconCardComponent  {

    /** The meta data about the icon */
    @Input() primitiveIcon: PrimitiveIcon$v2;

    /** Show delete button */
    @Input() enableDelete = false;

    /** Emits when delete is pressed */
    @Output() deleteIcon: EventEmitter<string> = new EventEmitter<string>();

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Export url helper to html */
    UrlHelper: typeof UrlHelper = UrlHelper;

    constructor() { }

    /** Emits delete flag */
    delete(event: any) {
        event.stopPropagation();
        this.deleteIcon.emit(this.primitiveIcon.id);
    }
}
