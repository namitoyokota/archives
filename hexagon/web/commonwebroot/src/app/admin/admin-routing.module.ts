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
            {
            path: 'systemManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commonconfiguration/admin/systemconfiguration/v1',
                adminId: '@hxgn/commonconfiguration/admin',
                adminTitle: 'commonconfiguration-admin.component.systemManager',
                claim: 'uiSystemConfigurationAccess',
                capabilityId: '@hxgn/commonconfiguration'
            }
        },{
            path: 'conversations/acs',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commonconversations/acs/poc/v1',
                adminId: '@hxgn/commonconversations/acs',
                adminTitle: 'commonConversation-core.component.videoVoiceChat',
                claim: 'uiAcsPOCAccess',
                capabilityId: '@hxgn/commonconversations'
            }
        },{
            path: 'userManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonidentity/usermanager/v1',
                adminId: '@hxgn/commonidentity/admin/usermanagement',
                adminTitle: 'commonIdentity-userManager.component.userGroupManager',
                claim: 'uiUserManagerAccess',
                capabilityId: '@hxgn/commonidentity'
            }
        },{
            path: 'accessManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commonidentity/tokenmanagement/v1',
                adminId: '@hxgn/commonidentity/admin/tokenmanagement',
                adminTitle: 'commonIdentity-accessManager.component.accessManager',
                claim: 'uiAccessManagerAccess',
                capabilityId: '@hxgn/commonidentity'
            }
        },{
            path: 'providerManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonidentity/providermanagement/v1',
                adminId: '@hxgn/commonidentity/admin/providermanagement',
                adminTitle: 'commonIdentity-providerManager.component.providerConfiguration',
                claim: 'uiProviderManagerAccess',
                capabilityId: '@hxgn/commonidentity'
            }
        },{
            path: 'keywords/iconManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonkeywords/admin/iconmanager/v1',
                adminId: '@hxgn/commonkeywords/admin',
                adminTitle: 'commonKeyword-iconManagement.component.iconManager',
                claim: 'uiIconManagerAccess',
                capabilityId: '@hxgn/commonkeywords'
            }
        },{
            path: 'layoutManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonlayoutmanager/admin/layoutbuilder/v1',
                adminId: '@hxgn/commonlayoutmanager/admin/layoutbuilder',
                adminTitle: 'commonLayoutManager-builder.component.layoutManager',
                claim: 'uiLayoutManagerAccess',
                capabilityId: '@hxgn/commonlayoutmanager'
            }
        },{
            path: 'terminologyManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonlocalization/admin/terminologymanager/v1',
                adminId: '@hxgn/commonlocalization/admin/terminologymanager',
                adminTitle: 'commonLocalization-admin.component.terminologyManager',
                claim: 'uiTerminologyManagerAccess',
                capabilityId: '@hxgn/commonlocalization'
            }
        },{
            path: 'eventLogger',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commonlogging/admin/eventlogging/v1',
                adminId: '@hxgn/commonlogging/admin',
                adminTitle: 'commonLogging-admin.component.eventLogger',
                claim: 'uiLoggingViewerAccess',
                capabilityId: '@hxgn/commonlogging'
            }
        },{
            path: 'mapSetup',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonmap/map-configuration/v1',
                adminId: '@hxgn/commonmap/admin',
                adminTitle: 'commonmap-admin.component.mapSetup',
                claim: 'uiMapConfigurationAccess',
                capabilityId: '@hxgn/commonmap'
            }
        },{
            path: 'notificationManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commonnotifications/admin/notificationmanager/v1',
                adminId: '@hxgn/commonnotifications/admin/notificationmanager',
                adminTitle: 'commonNotification-manager.component.notificationManager',
                claim: 'uiNotificationManagerAccess',
                capabilityId: '@hxgn/commonnotifications'
            }
        },{
            path: 'recoveryManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commonrecovery/admin/recoverymanagement/v1',
                adminId: '@hxgn/commonrecovery/admin/recoverymanagement',
                adminTitle: 'commonrecovery-recoveryManager.component.recoveryManager',
                claim: 'uiRecoveryManagementAccess',
                capabilityId: '@hxgn/commonrecovery'
            }
        },{
            path: 'tenant/dataSharing',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commontenant/admin/datasharing/v1',
                adminId: '@hxgn/commontenant/admin/datasharing',
                adminTitle: 'commonTenant-dataSharing.component.dataSharing',
                claim: 'uiDataSharingAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'activityMonitor',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commontenant/admin/activitymonitoring/v1',
                adminId: '@hxgn/commontenant/admin/activitymonitoring',
                adminTitle: 'commonTenant-activityMonitor.component.activityMonitor',
                claim: 'uiActivityMonitoringAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'activityMonitor/:id',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commontenant/admin/activitymonitoring/v1',
                adminId: '@hxgn/commontenant/admin/activitymonitoring',
                adminTitle: 'commonTenant-activityMonitor.component.activityMonitor',
                claim: 'uiActivityMonitoringAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'organizationSetup',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commontenant/admin/tenantconfiguration/v1',
                adminId: '@hxgn/commontenant/admin/tenantconfiguration',
                adminTitle: 'commonwebroot-admin.component.organizationSetup',
                claim: 'uiTenantConfigurationAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'onboarding',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/commontenant/admin/onboarding/v1',
                adminId: '@hxgn/commontenant/admin/onboarding',
                adminTitle: 'commonwebroot-admin.component.onboarding',
                claim: 'uiTenantOnboardingAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'organizationManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/commontenant/admin/tenantmanagement/v1',
                adminId: '@hxgn/commontenant/admin/tenantmanagement',
                adminTitle: 'commonTenant-orgManager.component.organizationManager',
                claim: 'uiTenantManagementAccess',
                capabilityId: '@hxgn/commontenant'
            }
        },{
            path: 'apiDocumentation',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/documentation/admin/apidocumentation/v1',
                adminId: '@hxgn/documentation/admin',
                adminTitle: 'documentation-admin.component.apiDocumentation',
                claim: 'uiApiDocumentationAccess',
                capabilityId: '@hxgn/documentation'
            }
        },{
            path: 'eamGatewayManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/eamgateway/admin/v1',
                adminId: '@hxgn/eamgateway/admin',
                adminTitle: 'eamgateway-admin.component.eamGatewayManager',
                claim: 'uiEamGatewayManagerAccess',
                capabilityId: '@hxgn/eamgateway'
            }
        },{
            path: 'elertsGatewayManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/elertsgateway/admin/v1',
                adminId: '@hxgn/elertsgateway/admin',
                adminTitle: 'elertsgateway-admin.component.elertsGatewayManager',
                claim: 'uiElertsManagerAccess',
                capabilityId: '@hxgn/elertsgateway'
            }
        },{
            path: 'priorityManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/incidents/admin/prioritymanagement/v1',
                adminId: '@hxgn/incidents/admin/prioritymanagement',
                adminTitle: 'incident-priorityManager.component.priorityManager',
                claim: 'uiPriorityManagementAccess',
                capabilityId: '@hxgn/incidents'
            }
        },{
            path: 'onCallGatewayManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/oncallcloudgateway/admin/v1',
                adminId: '@hxgn/oncallcloudgateway/admin',
                adminTitle: 'onCallCloudGateway-admin.component.oncallGatewayManager',
                claim: 'uiOnCallSourceManagerAccess',
                capabilityId: '@hxgn/oncallcloudgateway'
            }
        },{
            path: 'rapidSOSGatewayManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/rapidsosgateway/admin/v1',
                adminId: '@hxgn/rapidsosgateway/admin',
                adminTitle: 'rapidsosgateway-admin.component.rapidsosGatewayManager',
                claim: 'uiRapidsosGatewayManagerAccess',
                capabilityId: '@hxgn/rapidsosgateway'
            }
        },{
            path: 'smartShapes/manager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [DirtyGuard$v1],
            data: {
                adminComponent: '@hxgn/shapes/admin/shape-manager/v1',
                adminId: '@hxgn/shapes/admin/shape-manager',
                adminTitle: 'shape-manager.component.smartShapeManager',
                claim: 'uiShapeManagerAccess',
                capabilityId: '@hxgn/shapes'
            }
        },{
            path: 'shotSpotterManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/shotspotter/admin/v1',
                adminId: '@hxgn/shotspotter/admin',
                adminTitle: 'shotspotter-admin.component.shotSpotterManager',
                claim: 'uiShotSpotterManagerAccess',
                capabilityId: '@hxgn/shotspotter'
            }
        },{
            path: 'shotSpotterGatewayManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/shotspottergateway/admin/v1',
                adminId: '@hxgn/shotspottergateway/admin',
                adminTitle: 'shotspottergateway-admin.component.shotSpotterGatewayManager',
                claim: 'uiShotSpotterManagerAccess',
                capabilityId: '@hxgn/shotspottergateway'
            }
        },{
            path: 'videoManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1,OnboardingGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/videos/admin/v1',
                adminId: '@hxgn/videos/admin',
                adminTitle: 'video-videoManagement.component.videoManager',
                claim: 'uiVideoConfigurationAccess',
                capabilityId: '@hxgn/videos'
            }
        },{
            path: 'smartAdvisorManager',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/smartadvisoragents/admin/manager/v1',
                adminId: '@hxgn/smartadvisoragents/admin',
                adminTitle: 'smartadvisor-core.product.name',
                claim: 'apiWrite',
                capabilityId: '@hxgn/smartadvisoragents'
            }
        },{
            path: 'smartAdvisorPortal',
            component: AdminWrapperComponent,
            canActivate: [ClaimGuard$v1],
            canDeactivate: [],
            data: {
                adminComponent: '@hxgn/smartadvisoragents/portal/manager/v1',
                adminId: '@hxgn/smartadvisoragents/admin',
                adminTitle: 'smartadvisor-core.product.portal',
                claim: 'uiSystemSmartAdvisorAccess',
                capabilityId: '@hxgn/smartadvisoragents'
            }
        }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: [],
})
export class AdminRoutingModule { }
