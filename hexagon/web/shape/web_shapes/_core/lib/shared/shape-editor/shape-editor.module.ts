import { NgModule } from '@angular/core';
import { GraphicsEditorComponent } from './graphics-editor/graphics-editor.component';
import { ShapeEditorComponent } from './shape-editor.component';
import { CommonlocalizationAdapterModule, TranslateModule as HxGNTranslateModule, } from '@galileo/web_commonlocalization/adapter';
import { LineTypeModule$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { LineWeightModule$v1 } from '@galileo/web_common-libraries/graphical/line-weight';
import { ColorSelectorModule$v1 } from '@galileo/web_common-libraries/graphical/color-selector';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonExpansionPanelModule, CommonInputModule$v2 } from '@galileo/web_common-libraries';
import { TagInputModule } from 'ngx-chips';
import { UserSelectDropdownModule } from '@galileo/web_commonidentity/adapter';
import { CommonHyperlinksModule } from '@galileo/web_common-libraries/common-hyperlinks';
import { CommonfeatureflagsAdapterModule } from '@galileo/web_commonfeatureflags/adapter';


@NgModule({
  imports: [
    CommonModule,
    CommonlocalizationAdapterModule,
    HxGNTranslateModule,
    LineTypeModule$v1,
    LineWeightModule$v1,
    ColorSelectorModule$v1,
    FormsModule,
    CommonInputModule$v2,
    TagInputModule,
    UserSelectDropdownModule,
    CommonExpansionPanelModule,
    CommonHyperlinksModule,
    CommonfeatureflagsAdapterModule
  ],
  exports: [
    ShapeEditorComponent,
    GraphicsEditorComponent
  ],
  declarations: [
    ShapeEditorComponent,
    GraphicsEditorComponent
  ],
  providers: [],
})
export class ShapeEditorModule { }
