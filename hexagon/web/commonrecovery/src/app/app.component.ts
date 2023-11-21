import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {

    constructor(
        private layoutAdapter: LayoutCompilerAdapterService,
        private localizationSrv: CommonlocalizationAdapterService$v1
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.localizationSrv.changeLanguageAsync('en');
    }

    /** After view init hook */
    async ngAfterViewInit() {
        const adminId = '@hxgn/commonrecovery/admin/recoverymanagement';
        await this.layoutAdapter.loadCapabilityCoreAsync(adminId);
        this.layoutAdapter.delegateInjectComponentPortalAsync(
            '@hxgn/commonrecovery/admin/recoverymanagement/v1', adminId, '#admin-portal', null);
    }
}
