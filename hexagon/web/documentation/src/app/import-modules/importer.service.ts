import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({
    providedIn: 'root'
})
export class ImporterService {

    constructor(
        private layoutCoreSrv: LayoutCompilerCoreService
    ) {
        this.defineModules();
    }

    private defineModules(): void {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
        modules.set('@hxgn/documentation', this.documentationCoreModule);
        modules.set('@hxgn/documentation/admin', this.documentationAdminModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    private commonlocalizationCoreModule(): Promise<any> {
      return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }

    private documentationCoreModule(): Promise<any> {
        return import('@galileo/web_documentation/_core').then(m => m.DocumentationCoreModule);
    }

    private documentationAdminModule(): Promise<any> {
      return import('@galileo/web_documentation/admin').then(m => m.ApiDocumentationModule);
    }
}
