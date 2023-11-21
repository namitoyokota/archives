import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import {
  CommonErrorDialogModule,
  CommonInputModule$v2,
  CommonPopoverModule,
  CommonTabsModule,
  TooltipModule,
} from '@galileo/web_common-libraries';
import {
  LayoutCompilerAdapterService,
  LayoutManagerFeatureModule$v2,
  MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommonMailboxService, InjectableComponentNames, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_shapes/_common';
import { MapPreviewModule, ShapeEditorModule, ShapeIconModule, ShapesCoreModule } from '@galileo/web_shapes/_core';

import { ShapeListComponent } from './shape-list/shape-list.component';
import { ShapeManagerStoreService } from './shape-manager-store.service';
import { ShapeManagerComponent } from './shape-manager.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    ShapesCoreModule,
    TooltipModule,
    CommonInputModule$v2,
    CommonPopoverModule,
    OverlayModule,
    ShapeIconModule,
    CommonTabsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ShapeEditorModule,
    MapPreviewModule,
    CommonErrorDialogModule
  ],
  exports: [],
  declarations: [
    ShapeManagerComponent,
    ShapeListComponent
  ],
  providers: [
    ShapeManagerStoreService
  ],
})
export class ShapeManagerModule extends LayoutManagerFeatureModule$v2 {

  constructor(
    protected layoutCompiler: LayoutCompilerAdapterService,
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected injector: Injector,
    protected mailbox: CommonMailboxService
  ) {
    super(layoutCompiler, componentFactoryResolver,
      injector, mailbox as MailBoxService,
      `@hxgn/shapes/admin/shape-manager`, LAYOUT_MANAGER_SETTINGS
    );

    this.layoutCompiler.coreIsLoadedAsync(`@hxgn/shapes/admin/shape-manager`);
  }

  /**
  * Given a string component name should return the component type.
  */
  getComponentType(componentName: string): any {
    switch (componentName) {
      case InjectableComponentNames.adminShapeManager:
        return ShapeManagerComponent;
      default:
        console.error(`HxGN Connect:: admin/shape-manager :: Cannot find component for ${componentName}`);
        return null;
    }
  }
}
