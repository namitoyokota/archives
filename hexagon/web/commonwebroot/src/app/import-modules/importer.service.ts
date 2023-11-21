import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
    constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        
            modules.set('@hxgn/actionplans', this.ActionPlansCoreModule);
            modules.set('@hxgn/actionplans/manager', this.ActionPlansManagerModule);
            modules.set('@hxgn/alarms', this.AlarmsCoreModule);
            modules.set('@hxgn/assets', this.AssetsCoreModule);
            modules.set('@hxgn/common', this.CommonCoreModule);
            modules.set('@hxgn/commonassociations', this.CommonAssociationCoreModule);
            modules.set('@hxgn/commonconfiguration', this.CommonconfigurationCoreModule);
            modules.set('@hxgn/commonconfiguration/admin', this.SystemConfigurationModule);
            modules.set('@hxgn/commonconversations', this.CommonconversationsCoreModule);
            modules.set('@hxgn/commonconversations/acs', this.AcsModule);
            modules.set('@hxgn/commonconversations/chat/overlay-btn', this.ChatOverlayModule);
            modules.set('@hxgn/commonconversations/chat/btn', this.ChatBtnModule);
            modules.set('@hxgn/commonconversations/chat/full', this.FullChatModule);
            modules.set('@hxgn/commonfeatureflags', this.CommonfeatureflagsCoreModule);
            modules.set('@hxgn/commonidentity/admin/usermanagement', this.UserManagementModule);
            modules.set('@hxgn/commonidentity/admin/tokenmanagement', this.TokenManagementModule);
            modules.set('@hxgn/commonidentity/admin/providermanagement', this.ProviderManagementModule);
            modules.set('@hxgn/commonkeywords', this.CommonkeywordsCoreModule);
            modules.set('@hxgn/commonkeywords/admin', this.IconManagementModule);
            modules.set('@hxgn/commonlayoutmanager', this.CapabilityCoreModule);
            modules.set('@hxgn/commonlayoutmanager/admin/layoutbuilder', this.LayoutBuilderModule);
            modules.set('@hxgn/commonlicensing', this.CommonlicensingCoreModule);
            modules.set('@hxgn/commonlocalization/admin/terminologymanager', this.TerminologyManagerModule);
            modules.set('@hxgn/commonlogging', this.CommonLoggingCoreModule);
            modules.set('@hxgn/commonlogging/admin', this.EventLoggingModule);
            modules.set('@hxgn/commonmap', this.CommonmapCoreModule);
            modules.set('@hxgn/commonmap/admin', this.CommonmapAdminModule);
            modules.set('@hxgn/commonnotifications', this.CommonnotificationsCoreModule);
            modules.set('@hxgn/commonnotifications/admin/notificationmanager', this.NotificationManagerModule);
            modules.set('@hxgn/commonrecovery', this.CommonrecoveryCoreModule);
            modules.set('@hxgn/commonrecovery/admin/recoverymanagement', this.RecoveryManagementModule);
            modules.set('@hxgn/commontenant/admin/datasharing', this.CommontenantDataSharing$v2Module);
            modules.set('@hxgn/commontenant/admin/activitymonitoring', this.CommontenantActivityMonitoringModule);
            modules.set('@hxgn/commontenant/admin/tenantconfiguration', this.CommontenantConfigurationModule);
            modules.set('@hxgn/commontenant/admin/tenantmanagement', this.CommontenantManagementModule);
            modules.set('@hxgn/commontenant/admin/onboarding', this.OnboardingModule);
            modules.set('@hxgn/devices', this.DevicesCoreModule);
            modules.set('@hxgn/documentation', this.DocumentationCoreModule);
            modules.set('@hxgn/documentation/admin', this.ApiDocumentationModule);
            modules.set('@hxgn/eamgateway', this.EamgatewayCoreModule);
            modules.set('@hxgn/eamgateway/admin', this.EamGatewayModule);
            modules.set('@hxgn/elertsgateway', this.ElertsGatewayCoreModule);
            modules.set('@hxgn/elertsgateway/admin', this.ElertsGatewayModule);
            modules.set('@hxgn/feeds', this.FeedsCoreModule);
            modules.set('@hxgn/incidents', this.IncidentsCoreModule);
            modules.set('@hxgn/incidents/admin/prioritymanagement', this.PriorityManagementModule);
            modules.set('@hxgn/luciad', this.LuciadCoreLoaderModule);
            modules.set('@hxgn/luciad/subcore', this.LuciadCoreModule);
            modules.set('@hxgn/modelviewer', this.ModelViewerCoreModule);
            modules.set('@hxgn/oncallcloudgateway', this.OncallcloudgatewayCoreModule);
            modules.set('@hxgn/oncallcloudgateway/admin', this.OnCallGatewayModule);
            modules.set('@hxgn/persons', this.PersonsCoreModule);
            modules.set('@hxgn/rapidsosgateway', this.RapidsosGatewayCoreModule);
            modules.set('@hxgn/rapidsosgateway/admin', this.RapidsosGatewayModule);
            modules.set('@hxgn/shapes', this.ShapesCoreModule);
            modules.set('@hxgn/shapes/admin/shape-manager', this.ShapeManagerModule);
            modules.set('@hxgn/shotspotter', this.ShotSpotterCoreModule);
            modules.set('@hxgn/shotspotter/admin', this.ShotSpotterModule);
            modules.set('@hxgn/shotspottergateway', this.ShotSpotterGatewayCoreModule);
            modules.set('@hxgn/shotspottergateway/admin', this.ShotSpotterGatewayModule);
            modules.set('@hxgn/units', this.UnitsCoreModule);
            modules.set('@hxgn/videos', this.VideoCoreModule);
            modules.set('@hxgn/videos/admin', this.VideoAdminModule);
            modules.set('@hxgn/smartadvisoragents', this.SmartAdvisorCoreModule);
            modules.set('@hxgn/smartadvisoragents/admin', this.SmartAdvisorManagementModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    
            private ActionPlansCoreModule() {
                return import('@galileo/web_actionplans/_core').then(m => m.ActionPlansCoreModule);
            }
        
            private ActionPlansManagerModule() {
                return import('@galileo/web_actionplans/manager').then(m => m.ActionPlansManagerModule);
            }
        
            private AlarmsCoreModule() {
                return import('@galileo/web_alarms/core').then(m => m.AlarmsCoreModule);
            }
        
            private AssetsCoreModule() {
                return import('@galileo/web_assets/core').then(m => m.AssetsCoreModule);
            }
        
            private CommonCoreModule() {
                return import('@galileo/web_common/_core').then(m => m.CommonCoreModule);
            }
        
            private CommonAssociationCoreModule() {
                return import('@galileo/web_commonassociation/_core').then(m => m.CommonAssociationCoreModule);
            }
        
            private CommonconfigurationCoreModule() {
                return import('@galileo/web_commonconfiguration/_core').then(m => m.CommonconfigurationCoreModule);
            }
        
            private SystemConfigurationModule() {
                return import('@galileo/web_commonconfiguration/admin').then(m => m.SystemConfigurationModule);
            }
        
            private CommonconversationsCoreModule() {
                return import('@galileo/web_commonconversations/_core').then(m => m.CommonconversationsCoreModule);
            }
        
            private AcsModule() {
                return import('@galileo/web_commonconversations/acs').then(m => m.AcsModule);
            }
        
            private ChatOverlayModule() {
                return import('@galileo/web_commonconversations/chat/overlay-btn').then(m => m.ChatOverlayModule);
            }
        
            private ChatBtnModule() {
                return import('@galileo/web_commonconversations/chat/btn').then(m => m.ChatBtnModule);
            }
        
            private FullChatModule() {
                return import('@galileo/web_commonconversations/chat/full').then(m => m.FullChatModule);
            }
        
            private CommonfeatureflagsCoreModule() {
                return import('@galileo/web_commonfeatureflags/_core').then(m => m.CommonfeatureflagsCoreModule);
            }
        
            private UserManagementModule() {
                return import('@galileo/web_commonidentity/app/admin/user-management').then(m => m.UserManagementModule);
            }
        
            private TokenManagementModule() {
                return import('@galileo/web_commonidentity/app/admin/token-management').then(m => m.TokenManagementModule);
            }
        
            private ProviderManagementModule() {
                return import('@galileo/web_commonidentity/app/admin/provider-management').then(m => m.ProviderManagementModule);
            }
        
            private CommonkeywordsCoreModule() {
                return import('@galileo/web_commonkeywords/_core').then(m => m.CommonkeywordsCoreModule);
            }
        
            private IconManagementModule() {
                return import('@galileo/web_commonkeywords/admin').then(m => m.IconManagementModule);
            }
        
            private CapabilityCoreModule() {
                return import('@galileo/web_commonlayoutmanager/_core/capability').then(m => m.CapabilityCoreModule);
            }
        
            private LayoutBuilderModule() {
                return import('@galileo/web_commonlayoutmanager/admin').then(m => m.LayoutBuilderModule);
            }
        
            private CommonlicensingCoreModule() {
                return import('@galileo/web_commonlicensing/app/_core').then(m => m.CommonlicensingCoreModule);
            }
        
            private TerminologyManagerModule() {
                return import('@galileo/web_commonlocalization/admin/terminology-manager').then(m => m.TerminologyManagerModule);
            }
        
            private CommonLoggingCoreModule() {
                return import('@galileo/web_commonlogging/_core').then(m => m.CommonLoggingCoreModule);
            }
        
            private EventLoggingModule() {
                return import('@galileo/web_commonlogging/admin').then(m => m.EventLoggingModule);
            }
        
            private CommonmapCoreModule() {
                return import('@galileo/web_commonmap/_core').then(m => m.CommonmapCoreModule);
            }
        
            private CommonmapAdminModule() {
                return import('@galileo/web_commonmap/admin').then(m => m.CommonmapAdminModule);
            }
        
            private CommonnotificationsCoreModule() {
                return import('@galileo/web_commonnotifications/_core').then(m => m.CommonnotificationsCoreModule);
            }
        
            private NotificationManagerModule() {
                return import('@galileo/web_commonnotifications/admin').then(m => m.NotificationManagerModule);
            }
        
            private CommonrecoveryCoreModule() {
                return import('@galileo/web_commonrecovery/_core').then(m => m.CommonrecoveryCoreModule);
            }
        
            private RecoveryManagementModule() {
                return import('@galileo/web_commonrecovery/admin/recovery-management').then(m => m.RecoveryManagementModule);
            }
        
            private CommontenantDataSharing$v2Module() {
                return import('@galileo/web_commontenant/app/admin/data-sharing').then(m => m.CommontenantDataSharing$v2Module);
            }
        
            private CommontenantActivityMonitoringModule() {
                return import('@galileo/web_commontenant/app/admin/activity-monitoring').then(m => m.CommontenantActivityMonitoringModule);
            }
        
            private CommontenantConfigurationModule() {
                return import('@galileo/web_commontenant/app/admin/tenant-configuration').then(m => m.CommontenantConfigurationModule);
            }
        
            private CommontenantManagementModule() {
                return import('@galileo/web_commontenant/app/admin/tenant-management').then(m => m.CommontenantManagementModule);
            }
        
            private OnboardingModule() {
                return import('@galileo/web_commontenant/app/admin/onboarding').then(m => m.OnboardingModule);
            }
        
            private DevicesCoreModule() {
                return import('@galileo/web_devices/core').then(m => m.DevicesCoreModule);
            }
        
            private DocumentationCoreModule() {
                return import('@galileo/web_documentation/_core').then(m => m.DocumentationCoreModule);
            }
        
            private ApiDocumentationModule() {
                return import('@galileo/web_documentation/admin').then(m => m.ApiDocumentationModule);
            }
        
            private EamgatewayCoreModule() {
                return import('@galileo/web_eamgateway/_core').then(m => m.EamgatewayCoreModule);
            }
        
            private EamGatewayModule() {
                return import('@galileo/web_eamgateway/admin').then(m => m.EamGatewayModule);
            }
        
            private ElertsGatewayCoreModule() {
                return import('@galileo/web_elertsgateway/_core').then(m => m.ElertsGatewayCoreModule);
            }
        
            private ElertsGatewayModule() {
                return import('@galileo/web_elertsgateway/admin').then(m => m.ElertsGatewayModule);
            }
        
            private FeedsCoreModule() {
                return import('@galileo/web_feeds/_core').then(m => m.FeedsCoreModule);
            }
        
            private IncidentsCoreModule() {
                return import('@galileo/web_incidents/_core').then(m => m.IncidentsCoreModule);
            }
        
            private PriorityManagementModule() {
                return import('@galileo/web_incidents/admin/priority-management').then(m => m.PriorityManagementModule);
            }
        
            private LuciadCoreLoaderModule() {
                return import('@galileo/web_luciad/_core/loader').then(m => m.LuciadCoreLoaderModule);
            }
        
            private LuciadCoreModule() {
                return import('@galileo/web_luciad/_core').then(m => m.LuciadCoreModule);
            }
        
            private ModelViewerCoreModule() {
                return import('@galileo/web_model-viewer/_core').then(m => m.ModelViewerCoreModule);
            }
        
            private OncallcloudgatewayCoreModule() {
                return import('@galileo/web_oncallcloudgateway/_core').then(m => m.OncallcloudgatewayCoreModule);
            }
        
            private OnCallGatewayModule() {
                return import('@galileo/web_oncallcloudgateway/admin').then(m => m.OnCallGatewayModule);
            }
        
            private PersonsCoreModule() {
                return import('@galileo/web_person/_core').then(m => m.PersonsCoreModule);
            }
        
            private RapidsosGatewayCoreModule() {
                return import('@galileo/web_rapidsosgateway/_core').then(m => m.RapidsosGatewayCoreModule);
            }
        
            private RapidsosGatewayModule() {
                return import('@galileo/web_rapidsosgateway/admin').then(m => m.RapidsosGatewayModule);
            }
        
            private ShapesCoreModule() {
                return import('@galileo/web_shapes/_core').then(m => m.ShapesCoreModule);
            }
        
            private ShapeManagerModule() {
                return import('@galileo/web_shapes/admin/shape-manager').then(m => m.ShapeManagerModule);
            }
        
            private ShotSpotterCoreModule() {
                return import('@galileo/web_shotspotter/_core').then(m => m.ShotSpotterCoreModule);
            }
        
            private ShotSpotterModule() {
                return import('@galileo/web_shotspotter/admin').then(m => m.ShotSpotterModule);
            }
        
            private ShotSpotterGatewayCoreModule() {
                return import('@galileo/web_shotspottergateway/_core').then(m => m.ShotSpotterGatewayCoreModule);
            }
        
            private ShotSpotterGatewayModule() {
                return import('@galileo/web_shotspottergateway/admin').then(m => m.ShotSpotterGatewayModule);
            }
        
            private UnitsCoreModule() {
                return import('@galileo/web_units/_core').then(m => m.UnitsCoreModule);
            }
        
            private VideoCoreModule() {
                return import('@galileo/web_video/_core').then(m => m.VideoCoreModule);
            }
        
            private VideoAdminModule() {
                return import('@galileo/web_video/admin').then(m => m.VideoAdminModule);
            }
        
            private SmartAdvisorCoreModule() {
                return import('@smart-advisor/web_smart-advisor/_core').then(m => m.SmartAdvisorCoreModule);
            }
        
            private SmartAdvisorManagementModule() {
                return import('@smart-advisor/web_smart-advisor/admin').then(m => m.SmartAdvisorManagementModule);
            }
        
}
