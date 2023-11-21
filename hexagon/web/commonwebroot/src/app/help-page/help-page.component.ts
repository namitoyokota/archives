import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CommonHttpClient, HttpClientOptions, HTTPCode } from '@galileo/web_common-http';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

import { HelpPageTranslationTokens } from './help-page.translation';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'help-page',
    styleUrls: ['./help-page.component.scss'],
    templateUrl: './help-page.component.html',
})
export class HelpPageComponent implements OnInit, OnDestroy {

    /** Sets help page URL. */
    url: SafeResourceUrl;

    /** Determines if an error has occurred. Initially false. */
    error = false;

    /** Expose translation tokens to html template */
    tokens: typeof HelpPageTranslationTokens = HelpPageTranslationTokens;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private http: CommonHttpClient,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private router: Router,
        private titleSrv: Title
    ) { }

    /** Function run on initialization. */
    async ngOnInit() {
        this.setTitle();
        this.setUrlAsync();

        this.localizationSrv.adapterEvents.languageChanged$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.setTitle();
        });
    }

    /** On destroy life cycle hook */
    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private setUrlAsync() {
        const location =
            this.router.url.indexOf('help/provisioner') !== -1 ? 'provisioner'
                : this.router.url.indexOf('help/admin') !== -1 ? 'admin'
                    : this.router.url.indexOf('help') !== -1 ? 'user'
                        : '';
        const buildNumber = environment.buildNumber;
        const port = window.location.port;
        const host = port !== '4200' ? '/webroot/' : '/';

        this.url = `${host}${buildNumber}/help/en/${location}/index.html`;

        const options = new HttpClientOptions({
            useStandardAuthentication: true,
            httpOptions: {
                responseType: 'text'
            }
        });

        // Check for a 404 not found
        this.http.get(this.url.toString(), options).subscribe(response => {
        }, error => {
            if (error.status !== HTTPCode.Ok) {
                this.error = true;
            }
        });
    }

    /** Sets the page's title */
    private async setTitle(): Promise<void> {
        this.titleSrv.setTitle('HxGN Connect');

        const token =
            this.router.url.indexOf('help/admin') !== -1 ? HelpPageTranslationTokens.adminHelp
                : this.router.url.indexOf('help/provisioner') !== -1 ? HelpPageTranslationTokens.provisionerHelpLink
                    : HelpPageTranslationTokens.userHelp;
        const title = await this.localizationSrv.getTranslationAsync(token);
        this.titleSrv.setTitle(`HxGN Connect - ${title}`);
    }
}
