import { AfterViewInit, Component } from '@angular/core';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
    constructor(private layoutCompilerSrv: LayoutCompilerAdapterService) { }

    async ngAfterViewInit(): Promise<void> {
        const adminId = '@hxgn/documentation/admin';
        await this.layoutCompilerSrv.loadCapabilityCoreAsync(adminId);
        this.layoutCompilerSrv.delegateInjectComponentPortalAsync(
            '@hxgn/documentation/admin/apidocumentation/v1', adminId, '#admin-portal', null);
    }
}
