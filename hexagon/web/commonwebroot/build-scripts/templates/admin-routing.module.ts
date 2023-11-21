import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClaimGuard$v1 } from '@galileo/web_commonidentity/adapter';
import { OnboardingGuard$v1 } from '@galileo/web_commontenant/adapter';
import { capabilityId, Claims } from '@galileo/web_commonlayoutmanager/adapter';

import { AdminHubComponent } from './admin-hub/admin-hub.component';
import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AdminWrapperComponent } from './admin-wrapper.component';
import { DirtyGuard$v1 } from './dirty-guard.v1.service';

const routes: Routes = [
    {
        path: '', component: AdminShellComponent,
        children: [
            {
                path: '',
                component: AdminHubComponent,
                canActivate: [ClaimGuard$v1, OnboardingGuard$v1],
                data: { claim: Claims.adminAccess, capabilityId: capabilityId }
            },
            {
                path: 'videochat',
                component: AdminWrapperComponent,
                canActivate: [ClaimGuard$v1],
                data: {
                    adminComponent: '@hxgn/teams/videochat/v1',
                    adminId: '@hxgn/teams/admin/videochat',
                    adminTitle: 'commonIdentity-accessManager.component.accessManager',
                    claim: 'uiTenantManagementAccess',
                    capabilityId: '@hxgn/commontenant'
                }
            },
            <% adminFeatureRouting %>
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [],
})
export class AdminRoutingModule { }
