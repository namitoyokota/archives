import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
    constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonfeatureflags', this.commonfeatureflagsCoreModule);
        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    private commonfeatureflagsCoreModule() {
        return import('@galileo/web_commonfeatureflags/_core').then(m => m.CommonfeatureflagsCoreModule);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }
}
