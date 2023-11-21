import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({ providedIn: 'root' })
export class ImporterService {
  constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
    this.defineModules();
  }

  /**
   * Define modules
   */
  private defineModules(): void {
    const modules = new Map<string, () => Promise<any>>();

    modules.set('@hxgn/shapes', this.importerShapesCoreModule);
    modules.set('@hxgn/commonmap', this.commonmapCoreModule);
    modules.set('@hxgn/alarms', this.alarmsCoreModule);
    modules.set('@hxgn/assets', this.assetsCoreModule);
    modules.set('@hxgn/devices', this.devicesCoreModule);
    modules.set('@hxgn/incidents', this.incidentsCoreModule);
    modules.set('@hxgn/units', this.unitsCoreModule);
    modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
    modules.set('@hxgn/commonfeatureflags', this.commonfeatureflagsCoreModule);
    modules.set('@hxgn/commonnotifications', this.commonnotificationsCoreModule);
    modules.set('@hxgn/shapes/admin/shape-manager', this.shapeManagerModule);
    modules.set('@hxgn/common', this.CommonCoreModule);
    modules.set('@hxgn/commonconversations', this.CommonconversationsCoreModule);
    modules.set('@hxgn/commonlicensing', this.commonlicensingCoreModule);
    modules.set('@hxgn/commonassociations', this.commonAssociationCoreModule);

    this.layoutCoreSrv.setDefinedModules(modules);
  }

  private importerShapesCoreModule() {
    return import('@galileo/web_shapes/_core').then(m => m.ShapesCoreModule);
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

  private incidentsCoreModule() {
    return import('@galileo/web_incidents/_core').then(m => m.IncidentsCoreModule);
  }

  private unitsCoreModule() {
    return import('@galileo/web_units/_core').then(m => m.UnitsCoreModule);
  }

  private commonlocalizationCoreModule() {
    return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
  }

  private commonfeatureflagsCoreModule() {
    return import('@galileo/web_commonfeatureflags/_core').then(m => m.CommonfeatureflagsCoreModule);
  }

  private commonnotificationsCoreModule() {
    return import('@galileo/web_commonnotifications/_core').then(m => m.CommonnotificationsCoreModule);
  }

  private shapeManagerModule() {
    return import('@galileo/web_shapes/admin/shape-manager').then(m => m.ShapeManagerModule);
  }

  private commonmapCoreModule() {
    return import('@galileo/web_commonmap/_core').then(m => m.CommonmapCoreModule);
  }

  private CommonCoreModule() {
    return import('@galileo/web_common/_core').then(m => m.CommonCoreModule);
  }

  private CommonconversationsCoreModule() {
    return import('@galileo/web_commonconversations/_core').then(m => m.CommonconversationsCoreModule);
  }

  private commonlicensingCoreModule() {
    return import('@galileo/web_commonlicensing/app/_core').then(m => m.CommonlicensingCoreModule);
  }

  private commonAssociationCoreModule() {
    return import('@galileo/web_commonassociation/_core').then(m => m.CommonAssociationCoreModule);
  }
}
