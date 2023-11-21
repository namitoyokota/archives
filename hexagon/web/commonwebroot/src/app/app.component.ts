import { DOCUMENT, Location } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { filter, first } from 'rxjs/operators';

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    /** Determines whether or not the admin page is being displayed to reflect in loading screen. */
    isAdmin = false;

    /** Flag that is true when the loading UI should be shown */
    loading = true;

    constructor(
        @Inject(DOCUMENT) private _document: HTMLDocument,
        private location: Location,
        private router: Router,
        private localizationSrv: CommonlocalizationAdapterService$v1,
        private identityAdapter: CommonidentityAdapterService$v1,
        private tenantAdapter: CommontenantAdapterService$v1
    ) {
        this.setDefaultCultureAsync();

        const favicon = this._document.getElementById('appFavicon');
        if (this.location.path().includes('admin')) {
            this.isAdmin = true;
            if (!!favicon) {
                favicon.setAttribute('href', 'assets/branding/administrator-favicon.ico');
            }
        } else {
            if (!!favicon) {
                favicon.setAttribute('href', 'assets/branding/favicon.ico');
            }
        }

        this.router.events.pipe(
            filter(event => {
                return (event instanceof NavigationEnd ||
                    event instanceof NavigationCancel ||
                    event instanceof NavigationError);
            }),
            first()
        ).subscribe(() => {
            this.loading = false;
        });
    }

    private async setDefaultCultureAsync(): Promise<void> {
        const currentUser = await this.identityAdapter.getUserInfoAsync();
        if (currentUser.culture) {
            await this.localizationSrv.changeLanguageAsync(currentUser.culture);
        } else {
            const activeTenant = (await this.tenantAdapter.getUserTenantsAsync()).find(t => t.id === currentUser.activeTenant);
            if (activeTenant.culture) {
                await this.localizationSrv.changeLanguageAsync(activeTenant.culture);
            }
        }
    }
}
