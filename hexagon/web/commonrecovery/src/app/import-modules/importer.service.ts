import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({ providedIn: 'root' })
export class ImporterService {
    constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonrecovery', this.importerCommonrecovery);
        modules.set('@hxgn/commonrecovery/admin/recoverymanagement', this.importerAdminCommonRecovery);
        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    private importerCommonrecovery() {
        return import('@galileo/web_commonrecovery/_core').then(m => m.CommonrecoveryCoreModule);
    }

    private importerAdminCommonRecovery() {
        return import('@galileo/web_commonrecovery/admin/recovery-management').then(m => m.RecoveryManagementModule);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }
}
