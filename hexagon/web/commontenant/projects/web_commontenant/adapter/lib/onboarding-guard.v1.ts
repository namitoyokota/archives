import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { Claims, moduleRefId as capabilityId } from '@galileo/web_commontenant/_common';

import { CommontenantAdapterService$v1 } from './commontenant-adapter.v1.service';

@Injectable({providedIn: 'root'})
export class OnboardingGuard$v1 implements CanActivate {
    constructor(private router: Router, private userSrv: CommonidentityAdapterService$v1,
        private tenantSrv: CommontenantAdapterService$v1) { }

    /** Called to check if a route can be activated */
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const user = await this.userSrv.getUserInfoAsync();
        const tenant = await this.tenantSrv.getTenantAsync(user.activeTenant);
        const onboardingCompleted = await this.tenantSrv.getIsOnboardingCompletedAsync(tenant);

        if (onboardingCompleted) {
            return true;
        }

        if (!!user.capabilityClaims.get(capabilityId).find(id => id === Claims.tenantOnboardingAccess)) {
            // Go to tenant onboarding
            this.router.navigate(['/admin/onboarding']);
        } else {
            // Go to does not have access
            this.router.navigate(['/onboarding/pending']);
        }
    }
}
