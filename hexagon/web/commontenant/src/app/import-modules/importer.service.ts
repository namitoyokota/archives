import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
    constructor(
        private layoutCompilerCore: LayoutCompilerCoreService
    ) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonkeywords', this.commonkeywordsCoreModule);
        modules.set('@hxgn/commonlicensing', this.commonlicensingCoreModule);
        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
        modules.set('@hxgn/commonmap', this.commonmapCoreModule);
        modules.set('@hxgn/commonfeatureflags', this.commonfeatureflagsCoreModule);
        modules.set('@hxgn/commonrecovery', this.commonRecoveryCoreModule);
        modules.set('@hxgn/incidents', this.incidentsCoreModule);
        modules.set('@hxgn/units', this.unitsCoreModule);
        modules.set('@hxgn/commontenant/admin/datasharing', this.commontenantDataSharingModule);
        modules.set('@hxgn/commontenant/admin/activitymonitoring', this.commontenantActivityMonitoringModule);
        modules.set('@hxgn/commontenant/admin/tenantconfiguration', this.commontenantConfigurationModule);
        modules.set('@hxgn/commontenant/admin/tenantmanagement', this.commontenantManagementModule);
        modules.set('@hxgn/commontenant/admin/onboarding', this.commontenantOnboardingModule);
        modules.set('@hxgn/commontenant', this.commontenantCore);

        this.layoutCompilerCore.setDefinedModules(modules);
    }

    private commonkeywordsCoreModule() {
        return import('@galileo/web_commonkeywords/_core').then(m => m.CommonkeywordsCoreModule);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }

    private commontenantCore() {
        return import('@galileo/web_commontenant/app/_core').then(m => m.CommontenantCoreModule);
    }

    private commontenantDataSharingModule() {
        return import('@galileo/web_commontenant/app/admin/data-sharing').then(m => m.CommontenantDataSharing$v2Module);
    }

    private commontenantActivityMonitoringModule() {
        return import('@galileo/web_commontenant/app/admin/activity-monitoring').then(m => m.CommontenantActivityMonitoringModule);
    }

    private commontenantConfigurationModule() {
        return import('@galileo/web_commontenant/app/admin/tenant-configuration').then(m => m.CommontenantConfigurationModule);
    }

    private commontenantManagementModule() {
        return import('@galileo/web_commontenant/app/admin/tenant-management').then(m => m.CommontenantManagementModule);
    }

    private commontenantOnboardingModule() {
        return import('@galileo/web_commontenant/app/admin/onboarding').then(m => m.OnboardingModule);
    }

    private commonlicensingCoreModule() {
        return import('@galileo/web_commonlicensing/app/_core').then(m => m.CommonlicensingCoreModule);
    }

    private commonmapCoreModule() {
        return import('@galileo/web_commonmap/_core').then(m => m.CommonmapCoreModule);
    }

    private commonfeatureflagsCoreModule() {
        return import('@galileo/web_commonfeatureflags/_core').then(m => m.CommonfeatureflagsCoreModule);
    }

    private commonRecoveryCoreModule() {
        return import('@galileo/web_commonrecovery/_core').then(m => m.CommonrecoveryCoreModule);
    }

    private incidentsCoreModule() {
        return import('@galileo/web_incidents/_core').then(m => m.IncidentsCoreModule);
    }

    private unitsCoreModule() {
        return import('@galileo/web_units/_core').then(m => m.UnitsCoreModule);
    }
}
