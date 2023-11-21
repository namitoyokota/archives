import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({ providedIn: 'root' })
export class ImporterService {
    constructor(private layoutCompilerCore: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
        modules.set('@hxgn/commonmap', this.commonmapCoreModule);
        modules.set('@hxgn/commonmap/admin', this.commonmapAdminModule);
        modules.set('@hxgn/common', this.commonCoreModule);
        modules.set('@hxgn/commonkeywords', this.commonkeywordsCoreModule);
        modules.set('@hxgn/commonlicensing', this.commonlicensingCoreModule);
        modules.set('@hxgn/commonconversations', this.commonconversationsCoreModule);
        modules.set('@hxgn/commonconfiguration', this.commonconfigurationCoreModule);
        modules.set('@hxgn/commonlicensing', this.commonlicensingCoreModule);
        modules.set('@hxgn/commonassociations', this.commonAssociationCoreModule);
        modules.set('@hxgn/commonlogging', this.importerCommonLogging);
        modules.set('@hxgn/incidents', this.incidentsCoreModule);
        modules.set('@hxgn/units', this.unitsCoreModule);
        modules.set('@hxgn/commonassociations', this.commonAssociationCoreModule);
        modules.set('@hxgn/assets', this.assetsCoreModule);
        modules.set('@hxgn/devices', this.devicesCoreModule);
        modules.set('@hxgn/alarms', this.alarmsCoreModule);
        modules.set('@hxgn/videos', this.videoCoreModule);
        modules.set('@hxgn/luciad', this.luciadCoreLoaderModule);
        modules.set('@hxgn/luciad/subcore', this.luciadCoreModule);
        modules.set('@hxgn/commonfeatureflags', this.commonfeatureflagsCoreModule);
        modules.set('@hxgn/shapes', this.shapesCoreModule);

        this.layoutCompilerCore.setDefinedModules(modules);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }

    private commonmapCoreModule() {
        return import('@galileo/web_commonmap/_core').then(m => m.CommonmapCoreModule);
    }

    private commonmapAdminModule() {
        return import('@galileo/web_commonmap/admin').then(m => m.CommonmapAdminModule);
    }

    private commonCoreModule() {
        return import('@galileo/web_common/_core').then(m => m.CommonCoreModule);
    }

    private commonkeywordsCoreModule() {
        return import('@galileo/web_commonkeywords/_core').then(m => m.CommonkeywordsCoreModule);
    }

    private commonlicensingCoreModule() {
        return import('@galileo/web_commonlicensing/app/_core').then(m => m.CommonlicensingCoreModule);
    }

    private importerCommonLogging() {
        return import('@galileo/web_commonlogging/_core').then(m => m.CommonLoggingCoreModule);
    }

    private incidentsCoreModule() {
        return import('@galileo/web_incidents/_core').then(m => m.IncidentsCoreModule);
    }

    private unitsCoreModule() {
        return import('@galileo/web_units/_core').then(m => m.UnitsCoreModule);
    }

    private videoCoreModule() {
        return import('@galileo/web_video/_core').then(m => m.VideoCoreModule);
    }

    private commonAssociationCoreModule() {
        return import('@galileo/web_commonassociation/_core').then(m => m.CommonAssociationCoreModule);
    }

    private assetsCoreModule() {
        return import('@galileo/web_assets/core').then(m => m.AssetsCoreModule);
    }

    private devicesCoreModule() {
        return import('@galileo/web_devices/core').then(m => m.DevicesCoreModule);
    }

    private alarmsCoreModule() {
        return import('@galileo/web_alarms/core').then(m => m.AlarmsCoreModule);
    }

    private luciadCoreModule() {
        return import('@galileo/web_luciad/_core').then(m => m.LuciadCoreModule);
    }

    private luciadCoreLoaderModule() {
        return import('@galileo/web_luciad/_core/loader').then(m => m.LuciadCoreLoaderModule);
    }

    private commonfeatureflagsCoreModule() {
        return import('@galileo/web_commonfeatureflags/_core').then(m => m.CommonfeatureflagsCoreModule);
    }

    private commonconversationsCoreModule() {
        return import('@galileo/web_commonconversations/_core').then(m => m.CommonconversationsCoreModule);
    }

    private commonconfigurationCoreModule() {
        return import('@galileo/web_commonconfiguration/_core').then(m => m.CommonconfigurationCoreModule);
    }
    private shapesCoreModule() {
        return import('@galileo/web_shapes/_core').then(m => m.ShapesCoreModule);
    }
}
