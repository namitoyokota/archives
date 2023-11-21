import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CommonFaultPoliciesModule, CommonHttpClient, CommonWindowCommunicationService } from '@galileo/web_common-http';
import {
    CommonAddressModule,
    CommonCardModule,
    CommonColorPickerModule,
    CommonContactModule$v2,
    CommonCrossStreetModule,
    CommonDatepickerModule,
    CommonDescriptionModule,
    CommonDropdownModule$v2,
    CommonFilterModule,
    CommonFilterModule$v2,
    CommonInfiniteScrollPaneModule,
    CommonInputModule$v2,
    CommonKeywordsModule,
    CommonListStepsModule,
    CommonMediaModule,
    CommonPopoverModule,
    CommonTimepickerModule,
    CommonTooltipNameModule,
    FileListModule,
    FileUploadModule,
    AutomationTestingModule,
    PostStyleMenuModule
} from '@galileo/web_common-libraries';
import { CommonRemarksModule } from '@galileo/web_common-libraries/common-remarks';
import { CommonHyperlinksModule } from '@galileo/web_common-libraries/common-hyperlinks';
import { CommonPropertiesModule } from '@galileo/web_common-libraries/common-properties';
import { ColorSelectorModule$v1 } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineTypeModule$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { LineWeightModule$v1 } from '@galileo/web_common-libraries/graphical/line-weight';
import { CommonidentityCoreModule } from '@galileo/web_commonidentity/app/_core';
import { LayoutCompilerCoreModule } from '@galileo/web_commonlayoutmanager/_core';
import { CommonlocalizationCoreModule } from '@galileo/web_commonlocalization/_core';
import {
    CommonlocalizationAdapterModule,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { CommontenantCoreModule } from '@galileo/web_commontenant/app/_core';
import { TranslateModule } from '@ngx-translate/core';
import { TagInputModule } from 'ngx-chips';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { AppComponent } from './app.component';
import { ImporterService } from './import-modules/importer.service';

/*tslint:disable*/
const appRoutes: Routes = [
    { path: '', component: AppComponent }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),
        BrowserModule,
        CommonFaultPoliciesModule,
        HttpClientModule,
        BrowserAnimationsModule,
        LayoutCompilerCoreModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        TranslateModule.forRoot({}),
        CommonFilterModule,
        CommonFilterModule$v2,
        FileListModule,
        FileUploadModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSliderModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        CommonDatepickerModule,
        CommonTimepickerModule,
        CommonInputModule$v2,
        CommonDropdownModule$v2,
        CommonlocalizationCoreModule,
        CommonidentityCoreModule,
        CommontenantCoreModule,
        CommonCardModule,
        CommonCrossStreetModule,
        CommonAddressModule,
        CommonPropertiesModule,
        CommonMediaModule,
        CommonDescriptionModule,
        CommonRemarksModule,
        CommonKeywordsModule,
        CommonColorPickerModule,
        CommonListStepsModule,
        CommonContactModule$v2,
        CommonInfiniteScrollPaneModule,
        InfiniteScrollModule,
        CommonTooltipNameModule,
        CommonPopoverModule,
        OverlayModule,
        TagInputModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LineTypeModule$v1,
        LineWeightModule$v1,
        ColorSelectorModule$v1,
        CommonPropertiesModule,
        CommonHyperlinksModule,
        AutomationTestingModule,
        PostStyleMenuModule
    ],
    providers: [
        CommonHttpClient,
        HttpClient,
        CommonWindowCommunicationService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {

    constructor(private importer: ImporterService) { }
}
