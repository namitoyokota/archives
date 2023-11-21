import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
    CommonlocalizationAdapterModule,
    CommonlocalizationAdapterService$v1,
    TranslateModule as HxGNTranslateModule,
} from '@galileo/web_commonlocalization/adapter';
import { ModelViewerAdapterService$v1, ModelViewerModule, PanoramicViewerModule } from '@galileo/web_model-viewer/adapter';
import { CommonColorPickerModule } from '../common-color-picker/common-color-picker.module';
import { TranslationGroup } from '../translation-groups';
import { AttachmentTabComponent } from './attachment-tab/attachment-tab.component';
import { CommonMediaComponent } from './common-media.component';
import { CommonMediaService } from './common-media.service';
import { FullscreenModelViewerComponent } from './fullscreen-model-viewer/fullscreen-model-viewer.component';
import { FullscreenImageViewerComponent } from './image-attachment/fullscreen-image-viewer/fullscreen-image-viewer';
import { ImageAttachmentItemComponent } from './image-attachment/image-attachment-item/image-attachment-item.component';
import { ImageAttachmentComponent } from './image-attachment/image-attachment.component';
import { MediaCellComponent } from './media-grid/media-cell/media-cell.component';
import { MediaGridComponent } from './media-grid/media-grid.component';
import { OtherAttachmentComponent } from './other-attachment/other-attachment.component';
import {
    FullscreenVideoViewerComponent,
} from './video-clip-attachment/fullscreen-video-viewer/fullscreen-video-viewer.component';
import {
    VideoClipAttachmentItemComponent,
} from './video-clip-attachment/video-clip-attachment-item/video-clip-attachment-item.component';
import { VideoClipAttachmentComponent } from './video-clip-attachment/video-clip-attachment.component';
import { VideoClipPlayerDisplayComponent } from './video-clip-attachment/video-clip-player/video-clip-player-display.component';
import { VideoClipPlayerComponent } from './video-clip-attachment/video-clip-player/video-clip-player.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SanitizeUrlPipe } from './video-clip-attachment/sanitize-url.pipe';

@NgModule({
    imports: [
        CommonModule,
        CommonlocalizationAdapterModule,
        HxGNTranslateModule,
        ModelViewerModule,
        CommonColorPickerModule,
        PanoramicViewerModule,
        MatProgressSpinnerModule
    ],
    exports: [
        CommonMediaComponent,
        MediaGridComponent
    ],
    declarations: [
        CommonMediaComponent,
        AttachmentTabComponent,
        FullscreenImageViewerComponent,
        ImageAttachmentComponent,
        OtherAttachmentComponent,
        VideoClipPlayerComponent,
        VideoClipAttachmentComponent,
        MediaGridComponent,
        MediaCellComponent,
        VideoClipAttachmentItemComponent,
        ImageAttachmentItemComponent,
        FullscreenModelViewerComponent,
        FullscreenVideoViewerComponent,
        VideoClipPlayerDisplayComponent,
        SanitizeUrlPipe
    ],
    providers: [
        ModelViewerAdapterService$v1,
        CommonMediaService
    ],
})
export class CommonMediaModule {

    constructor(private localizationAdapter: CommonlocalizationAdapterService$v1) {
        this.localizationAdapter.localizeGroup([
            TranslationGroup.main
        ]);
    }
}
