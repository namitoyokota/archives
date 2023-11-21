import { Component, Inject, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { AlarmFilter$v1, LAYOUT_MANAGER_SETTINGS } from '@galileo/web_alarms/_common';
import { LayoutManagerEditorSettings, ViewEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';

import { SortOptions } from '../../../shared/sorting/sort-options';
import { AlarmListSettings } from '../alarm-list-view-settings';
import { TranslationTokens } from './alarm-list-view-settings.translation';

@Component({
    templateUrl: './alarm-list-view-settings.component.html',
    styleUrls: ['./alarm-list-view-settings.component.scss']
})
export class AlarmListViewSettingsComponent extends LayoutManagerEditorSettings<AlarmListSettings> implements OnInit {

    /** Filter */
    filter = new AlarmFilter$v1();

    /** Expose tokens to HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public editorSettings: ViewEditorSettings<AlarmListSettings>) {
        super(editorSettings);
    }

    ngOnInit() {
        if (!this.settings.filter) {
            this.settings.filter = new AlarmFilter$v1();
        }
    }

    /**
     * Sets the selected sort option when dropdown value changes.
     */
    setSortOption(sortOption: SortOptions): void {
        this.settings.sortBy = sortOption;
        this.emitUpdate();
    }

    /**
     * Sets the active filter
     * @param filter Updated filter
     */
    setActiveFilter(filter: AlarmFilter$v1) {
        this.settings.filter = filter;
        this.emitUpdate();
    }

    /**
     * Event that is called when the toggle value of enable card expansion changes.
     * @param event Angular material change event obj
     */
    toggleCardExpansion(event: MatSlideToggleChange): void {
        this.settings.enableCardExpansion = event.checked;
        this.emitUpdate();
    }

    /**
     * Event that is called when the toggle vale of enable remarks changes.
     * @param event Angular material change event obj
     */
    toggleRemarks(event: MatSlideToggleChange): void {
        this.settings.enableRemarks = event.checked;
        this.emitUpdate();
    }

    /**
     * Event that is called when the toggle vale of enable media changes.
     * @param event Angular material change event obj
     */
    toggleMedia(event: MatSlideToggleChange): void {
        this.settings.enableMedia = event.checked;
        this.emitUpdate();
    }

    /**
     * Event that is called when the toggle vale of enable keywords changes.
     * @param event Angular material change event obj
     */
    toggleKeywords(event: MatSlideToggleChange): void {
        this.settings.enableKeywords = event.checked;
        this.emitUpdate();
    }
}
