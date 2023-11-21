import { Injectable } from '@angular/core';
import { LayoutCompilerCoreService } from '@galileo/web_commonlayoutmanager/_core';

import { capabilityId as commonLocalizationCapabilityId } from '@galileo/web_commonlocalization/adapter';
import { capabilityId as modelViewerCapabilityId } from '@galileo/web_model-viewer/adapter';

@Injectable({ providedIn: 'root' })
export class ImporterService {

    constructor(private layoutCompilerCore: LayoutCompilerCoreService) {
        const modules = new Map<string, () => Promise<any>>();

        modules.set(commonLocalizationCapabilityId, this.importerCommonLocalization);
        modules.set(modelViewerCapabilityId, this.importerModelViewer);
        this.layoutCompilerCore.setDefinedModules(modules);
    }

    private importerCommonLocalization() {
        return import('./commonlocalization-core-import.module').then(m => m.CommonlocalizationCoreImportModule);
    }

    private importerModelViewer() {
        return import('./model-viewer-core-import.module').then(m => m.ModelViewerCoreImportModule);
    }
}
