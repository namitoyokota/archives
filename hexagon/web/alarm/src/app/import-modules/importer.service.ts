import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
    constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/alarms', this.alarmsCoreModule);
        modules.set('@hxgn/assets', this.assetsCoreModule);
        modules.set('@hxgn/commonassociations', this.commonAssociationCoreModule);
        modules.set('@hxgn/commonconversations', this.commonconversationsCoreModule);
        modules.set('@hxgn/commonkeywords', this.commonkeywordsCoreModule);
        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
        modules.set('@hxgn/devices', this.devicesCoreModule);
        modules.set('@hxgn/commonnotifications', this.commonnotificationsCoreModule);
        modules.set('@hxgn/modelviewer', this.modelViewerCoreModule);
        modules.set('@hxgn/common', this.CommonCoreModule);
        modules.set('@hxgn/commonmap', this.CommonmapCoreModule);
        modules.set('@hxgn/shapes', this.importerShapesCoreModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    private alarmsCoreModule() {
        return import('@galileo/web_alarms/core').then(m => m.AlarmsCoreModule);
    }

    private assetsCoreModule() {
        return import('@galileo/web_assets/core').then(m => m.AssetsCoreModule);
    }

    private devicesCoreModule() {
        return import('@galileo/web_devices/core').then(m => m.DevicesCoreModule);
    }

    private commonAssociationCoreModule() {
        return import('@galileo/web_commonassociation/_core').then(m => m.CommonAssociationCoreModule);
    }

    private commonconversationsCoreModule() {
        return import('@galileo/web_commonconversations/_core').then(m => m.CommonconversationsCoreModule);
    }

    private commonkeywordsCoreModule() {
        return import('@galileo/web_commonkeywords/_core').then(m => m.CommonkeywordsCoreModule);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }

    private commonnotificationsCoreModule() {
        return import('@galileo/web_commonnotifications/_core').then(m => m.CommonnotificationsCoreModule);
    }

    private modelViewerCoreModule() {
        return import('@galileo/web_model-viewer/_core').then(m => m.ModelViewerCoreModule);
    }

    private CommonCoreModule() {
        return import('@galileo/web_common/_core').then(m => m.CommonCoreModule);
    }

    private CommonmapCoreModule() {
        return import('@galileo/web_commonmap/_core').then(m => m.CommonmapCoreModule);
    }

    private importerShapesCoreModule(): any {
        return import('@galileo/web_shapes/_core').then(m => m.ShapesCoreModule);
    }
}
