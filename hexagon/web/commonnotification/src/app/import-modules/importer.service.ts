import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

@Injectable({providedIn: 'root'})
export class ImporterService {
    constructor(private layoutCoreSrv: LayoutCompilerCoreService) {
        this.defineModules();
    }

    private defineModules() {
        const modules = new Map<string, () => Promise<any>>();

        modules.set('@hxgn/commonnotifications', this.commonnotificationsCoreModule);
        modules.set('@hxgn/commonnotifications/admin/notificationmanager', this.commonnotificationsAdminModule);
        modules.set('@hxgn/commonlocalization', this.commonlocalizationCoreModule);
        modules.set('@hxgn/incidents', this.incidentsCoreModule);
        modules.set('@hxgn/commonconversations', this.commonconversationsCoreModule);

        this.layoutCoreSrv.setDefinedModules(modules);
    }

    private commonnotificationsCoreModule() {
        return import('@galileo/web_commonnotifications/_core').then(m => m.CommonnotificationsCoreModule);
    }

    private commonnotificationsAdminModule() {
        return import('@galileo/web_commonnotifications/admin').then(m => m.NotificationManagerModule);
    }

    private commonlocalizationCoreModule() {
        return import('@galileo/web_commonlocalization/_core').then(m => m.CommonlocalizationCoreModule);
    }

    private incidentsCoreModule() {
        return import('@galileo/web_incidents/_core').then(m => m.IncidentsCoreModule);
    }

    private commonconversationsCoreModule() {
        return import('@galileo/web_commonconversations/_core').then(m => m.CommonconversationsCoreModule);
    }
}
