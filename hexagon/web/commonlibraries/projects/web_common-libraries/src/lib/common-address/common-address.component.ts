import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Component, Input, OnInit } from '@angular/core';
import { AddressTranslationTokens } from './common-address.translation';

@Component({
    selector: 'hxgn-common-address',
    templateUrl: 'common-address.component.html',
    styleUrls: ['common-address.component.scss']
})
export class CommonAddressComponent implements OnInit {

    /** Location address. */
    @Input() address: string;

    /**
     * Token for component title.
     * If no token is provided, defaults to "Address".
     */
    @Input() titleToken: string;

    /**
     * URL of icon used within component.
     * If not URL is provided, defaults to map pin icon.
     */
    @Input() iconURL: string;

    /** Expose tokens to HTML */
    tokens: typeof AddressTranslationTokens = AddressTranslationTokens;

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) { }

    /** OnInit */
    ngOnInit() {
        if (this.titleToken) {
            this.localizationAdapter.localizeStringAsync(this.titleToken);
        }
    }
}
