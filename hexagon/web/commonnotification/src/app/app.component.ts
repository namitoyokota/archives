import { AfterViewInit, Component } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { capabilityId, InjectableComponentNames } from '@galileo/web_commonnotifications/_common';
import { from, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

    contextId = '1';

    /** List of overlay ids */
    customOverlays$ = from(this.layoutAdapter.getCustomOverlaysAsync()).pipe(
        mergeMap(data => data)
    );

    buttonCount = Array(200).fill(4);

    constructor(
        private layoutAdapter: LayoutCompilerAdapterService,
        private localizationAdapter: CommonlocalizationAdapterService$v1
    ) {
        this.localizationAdapter.changeLanguageAsync('en');
        setInterval(() => {
            this.contextId = new Date().toString();
        }, 5000);
    }

    async ngAfterViewInit(): Promise<void> {
        // this.injectOnboardingAsync();
        this.injectNotificationManagerAsync();
    }

    private async injectOnboardingAsync() {
        await this.layoutAdapter.loadCapabilityCoreAsync(capabilityId);
        this.layoutAdapter.delegateInjectComponentPortalAsync(
            InjectableComponentNames.onboarding,
            capabilityId, '#portal', { save$: new Observable(), setSaveEnabled: () => { } }
        );
    }

    private async injectNotificationManagerAsync() {
        const adminId = '@hxgn/commonnotifications/admin/notificationmanager';
        await this.layoutAdapter.loadCapabilityCoreAsync(adminId);
        this.layoutAdapter.delegateInjectComponentPortalAsync('@hxgn/commonnotifications/admin/notificationmanager/v1', adminId, '#portal', null);
    }
}
