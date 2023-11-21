import { Component, OnInit } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

/* tslint:disable */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    ids = [
        '1b16ab3e-b8f6-4fe3-9f3e-2db7fe549f6a',
        'c1878bbb-8173-410a-9a77-d6f4aa23678a',
        '123',
        '00000000-0000-0000-0000-000000000000',
        'tenantId goes here'
    ];

    constructor(
        private layoutCompilerSrv: LayoutCompilerAdapterService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) {
        this.layoutCompilerSrv.loadCapabilityCoreAsync('@hxgn/commontenant');
    }

    /** OnInIt */
    async ngOnInit() {
        this.localizationSrv.changeLanguageAsync('en');

        // this.injectActivityMonitorAsync();
        // this.injectDataSharingAsync();
        this.injectOrganizationManagerAsync();
        // this.injectOrganizationSetupAsync();
        // this.injectOnboardingAsync();
    }

    private async injectActivityMonitorAsync() {
        const adminId = '@hxgn/commontenant/admin/activitymonitoring';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commontenant/admin/activitymonitoring/v1', adminId, '#admin-portal', null);
    }

    private async injectDataSharingAsync() {
        const adminId = '@hxgn/commontenant/admin/datasharing';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commontenant/admin/datasharing/v1', adminId, '#admin-portal', null);
    }

    private async injectOrganizationManagerAsync() {
        const adminId = '@hxgn/commontenant/admin/tenantmanagement';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commontenant/admin/tenantmanagement/v1', adminId, '#admin-portal', null);
    }

    private async injectOrganizationSetupAsync() {
        const adminId = '@hxgn/commontenant/admin/tenantconfiguration';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commontenant/admin/tenantconfiguration/v1', adminId, '#admin-portal', null);
    }

    private async injectOnboardingAsync() {
        const adminId = '@hxgn/commontenant/admin/onboarding';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync('@hxgn/commontenant/admin/onboarding/v1', adminId, '#admin-portal', null);
    }
}
