import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { PageNotFoundTranslationTokens } from './page-not-found.translation';
import { CommonWindowCommunicationService } from '@galileo/web_common-http';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'hxgn-root-page-not-found',
    templateUrl: 'page-not-found.component.html',
    styleUrls: ['page-not-found.component.scss']
})

export class PageNotFoundComponent implements OnInit {

    /** Flag that is true if the user is logged in */
    isLoggedIn = false;

    /** Expose PageNotFoundTranslationTokens to the HTML */
    tokens: typeof PageNotFoundTranslationTokens = PageNotFoundTranslationTokens;

    constructor(private windowCommSrv: CommonWindowCommunicationService,
                private identitySrv: CommonidentityAdapterService$v1,
                private locationSrv: Location) { }

    /** On init event */
    ngOnInit() {
        this.isLoggedIn = !!this.identitySrv.getUserInfoAsync();
    }

    /** Logs out the user */
    logOut(): void {
        if (this.windowCommSrv.isChildWindow()) {
            this.windowCommSrv.messageMaster({
                contextId: 'MAIN_LOGOFF',
                handleId: null,
                data: null
            });
        } else {
            this.windowCommSrv.destroyAll();
            this.identitySrv.logoff();
        }
    }

    /** Back to the last page */
    goBack(): void {
        this.locationSrv.back();
    }
}
