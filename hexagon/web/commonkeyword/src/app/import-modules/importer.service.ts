import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
  constructor(private layoutCompilerCore: LayoutCompilerCoreService) {
    const modules = new Map<string, () => Promise<any>>();

    modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
    modules.set('@hxgn/commonkeywords', this.CommonkeywordsCoreModule);
    modules.set('@hxgn/commonkeywords/admin', this.IconManagementModule);

    this.layoutCompilerCore.setDefinedModules(modules);
  }

  private commonlocalizationCoreModule() {
    return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
  }

  private CommonkeywordsCoreModule() {
    return import('@galileo/web_commonkeywords/_core').then(m => m.CommonkeywordsCoreModule);
  }

  private IconManagementModule() {
    return import('@galileo/web_commonkeywords/admin').then(m => m.IconManagementModule);
  }
}
