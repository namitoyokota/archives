import { Component, OnInit } from '@angular/core';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';

import { TranslationTokens } from './user-issue.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-commonwebroot-user-issue',
    templateUrl: 'user-issue.component.html',
    styleUrls: ['user-issue.component.scss']
})
export class UserIssueComponent implements OnInit {

    /** Expose translation tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** A flag that is true if user has no roles */
    noUserRoles = false;

    constructor(
        private identityAdapter: CommonidentityAdapterService$v1
    ) { }

    /** On init lifecycle hooks */
    ngOnInit(): void {
        this.identityAdapter.getUserInfoAsync().then(user => {
            this.noUserRoles = user?.noUserRoles
        });
    }
}
