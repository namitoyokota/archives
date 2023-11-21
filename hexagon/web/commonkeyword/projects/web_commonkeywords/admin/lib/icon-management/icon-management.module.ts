import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ComponentFactoryResolver, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {
  CommonChipModule,
  CommonConfirmDialogModule,
  CommonDropdownModule$v2,
  CommonInputModule$v2,
  CommonPopoverModule,
  CommonTabsModule,
  CommonUnsavedChangesDialogModule,
  FileUploadModule,
} from '@galileo/web_common-libraries';
import { CommonidentityAdapterModule } from '@galileo/web_commonidentity/adapter';
import {
  CommonkeywordsMailboxService,
  InjectableComponentNames,
  LAYOUT_MANAGER_SETTINGS,
} from '@galileo/web_commonkeywords/_common';
import { DataService } from '@galileo/web_commonkeywords/_core';
import {
  LayoutCompilerAdapterService,
  LayoutManagerFeatureModule$v2,
  MailBoxService,
} from '@galileo/web_commonlayoutmanager/adapter';
import {
  CommonlocalizationAdapterModule,
  TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { TagInputModule } from 'ngx-chips';

import { CdkVirtualScrollViewportPatchDirective } from '../cdk-virtual-scoll-viewport-patch.directive';
import { AddDefaultIconComponent } from './add-default-icon/add-default-icon.component';
import { AddIconRulesetComponent } from './add-icon-ruleset/add-icon-ruleset.component';
import { DisplayNameComponent } from './add-icon-ruleset/display-name/display-name.component';
import { IconRuleEditorComponent } from './add-icon-ruleset/icon-rule-editor/icon-rule-editor.component';
import { RuleDetailsComponent } from './add-icon-ruleset/rule-grid/rule-details/rule-details.component';
import { RuleGridIconComponent } from './add-icon-ruleset/rule-grid/rule-grid-icon/rule-grid-icon.component';
import { RuleGridComponent } from './add-icon-ruleset/rule-grid/rule-grid.component';
import { RuleMenuComponent } from './add-icon-ruleset/rule-grid/rule-menu/rule-menu.component';
import { SimilarMatchesComponent } from './add-icon-ruleset/similar-matches/similar-matches.component';
import { CompositeIconService } from './composite-icon.service';
import { CompositeIconComponent } from './composite-icon/composite-icon.component';
import { AddNewGroupComponent } from './group-list-pane/add-new-group/add-new-group.component';
import { GroupItemComponent } from './group-list-pane/group-item/group-item.component';
import { GroupListPaneComponent } from './group-list-pane/group-list-pane.component';
import { GroupListComponent } from './group-list-pane/group-list/group-list.component';
import { IconEditorDialogComponent } from './icon-editor-dialog/icon-editor-dialog.component';
import { IconEditorToolbarComponent } from './icon-editor-toolbar/icon-editor-toolbar.component';
import { IconEditorComponent } from './icon-editor/icon-editor.component';
import { IconItemComponent } from './icon-editor/icon-item/icon-item.component';
import { IconLayerPaneComponent } from './icon-editor/icon-layer-pane/icon-layer-pane.component';
import { IconPreviewPaneComponent } from './icon-editor/icon-preview-pane/icon-preview-pane.component';
import { IconCardComponent } from './icon-library/icon-card/icon-card.component';
import { IconLibraryComponent } from './icon-library/icon-library.component';
import { IconManagementComponent } from './icon-management.component';
import { IconManagementService } from './icon-management.service';
import { KeywordRulesetStoreService } from './keyword-ruleset-store.service';
import { PrimitiveIconStoreService } from './primitivie-icon-store.service';
import { UploadIconDialogComponent } from './upload-icon-dialog/upload-icon-dialog.component';

@NgModule({
	imports: [
		CommonInputModule$v2,
		CommonModule,
		CommonDropdownModule$v2,
		CommonChipModule,
		FormsModule,
		MatTabsModule,
		MatDialogModule,
		MatSnackBarModule,
		CommonTabsModule,
		CommonlocalizationAdapterModule,
		HxGNTranslateModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatCheckboxModule,
		DragDropModule,
		MatSlideToggleModule,
		CommonConfirmDialogModule,
		ScrollingModule,
		CommonidentityAdapterModule,
		CommonUnsavedChangesDialogModule,
		CommonPopoverModule,
		OverlayModule,
		FileUploadModule,
		TagInputModule
	],
	exports: [IconManagementComponent],
	declarations: [
		IconManagementComponent,
		CompositeIconComponent,
		GroupListComponent,
		IconLibraryComponent,
		IconCardComponent,
		AddIconRulesetComponent,
		DisplayNameComponent,
		SimilarMatchesComponent,
		IconEditorDialogComponent,
		IconEditorComponent,
		IconEditorToolbarComponent,
		IconItemComponent,
		AddDefaultIconComponent,
		IconRuleEditorComponent,
		IconPreviewPaneComponent,
		IconLayerPaneComponent,
		CdkVirtualScrollViewportPatchDirective,
		GroupListPaneComponent,
		GroupItemComponent,
		AddNewGroupComponent,
		RuleGridComponent,
		RuleGridIconComponent,
		RuleDetailsComponent,
		RuleMenuComponent,
		UploadIconDialogComponent
	],
	providers: [
		IconManagementService,
		CompositeIconService,
		PrimitiveIconStoreService,
		KeywordRulesetStoreService,
		DataService
	]
})
export class IconManagementModule extends LayoutManagerFeatureModule$v2 {
	constructor(
		protected layoutCompiler: LayoutCompilerAdapterService,
		protected componentFactoryResolver: ComponentFactoryResolver,
		protected injector: Injector,
		protected mailbox: CommonkeywordsMailboxService
	) {
		super(layoutCompiler, componentFactoryResolver,
			injector, mailbox as MailBoxService,
			`@hxgn/commonkeywords/admin`, LAYOUT_MANAGER_SETTINGS
		);

		this.layoutCompiler.coreIsLoadedAsync(`@hxgn/commonkeywords/admin`);
	}

	/**
	 * Given a string component name should return the component type.
	 */
	getComponentType(componentName: string): any {
		switch (componentName) {
			case InjectableComponentNames.IconManagerComponent:
				return IconManagementComponent;
			default:
				console.error(`HxGN Connect:: common keywords admin :: Cannot find component for ${componentName}`);
				return null;
		}
	}
}
