import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UrlHelper$v1 } from '@galileo/web_common-http';
import { Hyperlink$v1 } from '@galileo/web_common-libraries';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

import { TranslatedTokens, TranslationTokens } from './common-create-hyperlinks.translate';

@Component({
    selector: 'hxgn-common-create-hyperlinks',
    templateUrl: './common-create-hyperlinks.component.html',
    styleUrls: ['./common-create-hyperlinks.component.scss']
})
export class CommonCreateHyperlinksComponent implements OnInit {

    /** Currently URL being edited */
    @Input() currentLink = new Hyperlink$v1();

    /** List of hyperlinks */
    @Input('hyperlinks')
    set setHyperlinks(links: Hyperlink$v1[]) {
        if (links) {
            this.hyperlinks = links.map(l => new Hyperlink$v1(l));
        } else {
            this.hyperlinks = links;
        }
    }

    /** Flag that is true if component is disabled */
    @Input() disabled = false;

    /** List of hyperlinks */
    hyperlinks: Hyperlink$v1[];

    /** Changes whether to display components in row/column */
    @Input() displayColumns = false;

    /** Emits when list of hyperlinks is updated */
    @Output() listChanged = new EventEmitter<Hyperlink$v1[]>();

    /** Flag to indicate valid url */
    urlIsValid = false;

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** Translated tokens */
    tTokens: TranslatedTokens = {} as TranslatedTokens;

    constructor(
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.initLocalization();
    }

    /** Validates inputted url */
    validateUrl(url: string) {
        this.urlIsValid = UrlHelper$v1.isValid(url);
    }

    /** Add new url to the list of hyperlinks */
    add() {
        if (this.urlIsValid && !!this.currentLink.text && !!this.currentLink.href) {
            this.hyperlinks = [...this.hyperlinks, this.currentLink];
            this.emit();
            this.currentLink = new Hyperlink$v1();
            this.urlIsValid = false;
        }
    }

    /** Update list when link was removed */
    update(links: Hyperlink$v1[]) {
        this.hyperlinks = links;
        this.emit();
    }

    /** Emits event when the list gets updated */
    emit() {
        this.listChanged.emit(this.hyperlinks);
    }

    /** Set up routine for localization */
    private async initLocalization() {
        const tokens: string[] = Object.keys(TranslationTokens).map(k => TranslationTokens[k]);
        const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);
        this.tTokens.title = translatedTokens[TranslationTokens.title];
        this.tTokens.url = translatedTokens[TranslationTokens.url];
    }
}
