import { Component, OnInit } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { LicenseIssueTranslationTokens } from './license-issue.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-commonwebroot-license-issue',
    templateUrl: 'license-issue.component.html',
    styleUrls: ['license-issue.component.scss']
})
export class LicenseIssueComponent implements OnInit {

    /** Expose LicenseIssueTranslationTokens to HTML */
    tokens: typeof LicenseIssueTranslationTokens = LicenseIssueTranslationTokens;

    /** A flag that is true if the license max has been reached */
    licenseMaximum = false; 

    constructor(
        private identityAdapter: CommonidentityAdapterService$v1
    ) { }

    /**
     * On init lifecycle hooks
     */
    ngOnInit(): void {
        this.identityAdapter.getUserInfoAsync().then(user => {
            this.licenseMaximum = user?.maxLicensesReached;
        });
    }

}
