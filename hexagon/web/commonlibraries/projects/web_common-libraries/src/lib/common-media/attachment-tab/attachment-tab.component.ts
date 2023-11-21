import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Media$v1 } from '@galileo/platform_common-libraries';

/**
 * Different attachment tab options
 */
export enum AttachmentTab {
    liveVideos = 'liveVideo',
    videoClips = 'videoClip',
    images = 'images',
    other = 'other'
}

@Component({
    selector: 'hxgn-common-media-attachment-tab',
    templateUrl: 'attachment-tab.component.html',
    styleUrls: ['attachment-tab.component.scss']
})
/**
 * Component that displayed the different attachment
 * tabs and allows navigation between them.
 */
export class AttachmentTabComponent implements OnChanges {

    /** Map of media objects to their attachment type */
    @Input() mediaList: Map<AttachmentTab, Media$v1[]>;

    /** Events that the selected tab has changed */
    @Output() selectionChange = new EventEmitter<AttachmentTab>();

    /** The currently selected attachment tab */
    selectedTab: AttachmentTab;

    /** Exposes AttachmentTab to the HTML */
    attachmentTab: typeof AttachmentTab = AttachmentTab;

    /** Order list of attachment tab. This is the
     * order the tabs  will be displayed in.
     */
    tabOrder: AttachmentTab[] = [
        AttachmentTab.videoClips,
        AttachmentTab.images,
        AttachmentTab.other
    ];

    constructor() { }

    /** OnInit */
    ngOnChanges(changes: SimpleChanges): void {
        if (!this.selectedTab) {
            this.setDefaultSelectedTab();
        }
    }

    /**
     * Selects a tab
     * @param tab The tab to select
     */
    selectTab(tab: AttachmentTab) {
        this.selectedTab = tab;
        this.selectionChange.emit(tab);
    }

    /**
     * Return the icon class for a given AttachmentTab
     * @param tab The attachment tab type to return an icon class for
     */
    getIconClass(tab: AttachmentTab): string {
        switch (tab) {
            case AttachmentTab.liveVideos:
                return 'live-video-icon';
            case AttachmentTab.videoClips:
                return 'video-clip-icon';
            case AttachmentTab.images:
                return 'image-icon';
            case AttachmentTab.other:
            default:
                return 'other-icon';
        }
    }

    /**
     * Sets the default selected tab to the first tab with attachments
     */
    private setDefaultSelectedTab() {
        this.selectedTab = null;

        for (const tab of this.tabOrder) {
            if (this.mediaList.get(tab).length) {
                this.selectedTab = tab;
                this.selectionChange.emit(tab);
                break;
            }
        }
    }
}
