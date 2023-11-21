import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
    capabilityId as identityCapabilityId,
    ClaimGuard$v1,
    Claims as IdentityClaims,
} from '@galileo/web_commonidentity/adapter';
import { capabilityId, Claims } from '@galileo/web_commonlayoutmanager/adapter';
import { OnboardingGuard$v1 } from '@galileo/web_commontenant/adapter';
import { LayoutCompilerComponent } from 'src/app/layout-compiler/layout-compiler.component';

import { HelpPageComponent } from './help-page/help-page.component';
import { LicenseIssueComponent } from './license-issue/license-issue.component';
import { OnboardingPendingComponent } from './onboarding-pending/onboarding-pending.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { UserIssueComponent } from './user-issue/user-issue.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutCompilerComponent,
        pathMatch: 'full',
        canActivate: [ClaimGuard$v1, OnboardingGuard$v1],
        data: {
            claim: Claims.mainProductAccess,
            capabilityId: capabilityId,
            fallbackUrl: '/admin'
        }
    },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },
    {
        path: 'screen',
        component: LayoutCompilerComponent,
        canActivate: [ClaimGuard$v1, OnboardingGuard$v1],
        data: {
            claim: Claims.mainProductAccess,
            capabilityId: capabilityId,
            fallbackUrl: '/admin'
        }
    },
    {
        path: 'screen/:id',
        component: LayoutCompilerComponent,
        canActivate: [ClaimGuard$v1, OnboardingGuard$v1],
        data: {
            claim: Claims.mainProductAccess,
            capabilityId: capabilityId,
            fallbackUrl: '/admin'
        }
    },
    {
        path: 'onboarding/pending',
        component: OnboardingPendingComponent,
        data: {
            claim: Claims.mainProductAccess,
            capabilityId: capabilityId,
            fallbackUrl: '/admin'
        }
    },
    {
        path: 'userprofile',
        component: UserProfileComponent,
        canActivate: [ClaimGuard$v1, OnboardingGuard$v1],
        data: {
            claim: IdentityClaims.userInfoAccess,
            capabilityId: identityCapabilityId,
            fallbackUrl: '/admin'
        }
    },
    { path: 'licenseIssue', component: LicenseIssueComponent },
    { path: 'userIssue', component: UserIssueComponent },
    {
        path: 'help',
        component: HelpPageComponent,
        children: [
            {
                path: 'admin',
                component: HelpPageComponent
            },
            {
                path: 'provisioner',
                component: HelpPageComponent
            }
        ]
    },
    { path: '**', redirectTo: '/404' },
    { path: '404', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
