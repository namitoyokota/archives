import { Component, Input } from '@angular/core';
import { Hyperlink$v1 } from '@galileo/web_common-libraries';

import { TranslationTokens } from './common-hyperlinks.translate';

@Component({
    selector: 'hxgn-common-hyperlinks',
    templateUrl: 'common-hyperlinks.component.html',
    styleUrls: ['common-hyperlinks.component.scss']
})
export class CommonHyperlinksComponent {

    /** List of links to display */
    @Input('links')
    set setLinks(links: Hyperlink$v1[]) {
        this.entireList = links;
        this.toggleShowAll();
    }

    /** All hyperlinks */
    entireList: Hyperlink$v1[] = [];

    /** List of hyperlinks to display */
    displayList: Hyperlink$v1[] = [];

    /** Flag that is true if all properties should be shown */
    showAll = true;

    /** Expose CommonPropertiesTranslationTokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor() { }

    /** Toggle show all */
    toggleShowAll(): void {
        this.showAll = !this.showAll;
        if (this.showAll) {
            this.displayList = this.entireList;
        } else {
            this.displayList = this.entireList.slice(0, 3);
        }
    }
}