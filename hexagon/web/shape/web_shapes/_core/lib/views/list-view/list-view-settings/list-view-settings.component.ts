import { Component, Inject, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LayoutManagerEditorSettings, ViewEditorSettings } from '@galileo/web_commonlayoutmanager/adapter';
import { LAYOUT_MANAGER_SETTINGS, ShapeListFilter$v1 } from '@galileo/web_shapes/_common';

import { SortOptions } from '../../../shared/sorting/sort-options';
import { ShapeListSettings } from '../list-view-settings';
import { ListViewSettingsTranslationTokens } from './list-view-settings.translation';

@Component({
  templateUrl: 'list-view-settings.component.html',
  styleUrls: ['list-view-settings.component.scss']
})

export class ListViewSettingsComponent extends LayoutManagerEditorSettings<ShapeListSettings> implements OnInit {

  /** Filter */
  filter = new ShapeListFilter$v1();

  /** Expose ListViewSettingsTranslationTokens to HTML */
  tokens: typeof ListViewSettingsTranslationTokens = ListViewSettingsTranslationTokens;

  constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public editorSettings: ViewEditorSettings<ShapeListSettings>) {
    super(editorSettings);
  }

  /**
   * On init lifecycle hook
   */
  ngOnInit() {
    if (!this.settings.filter) {
      this.settings.filter = new ShapeListFilter$v1();
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
  setActiveFilter(filter: ShapeListFilter$v1) {
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
     * Event that is called when the toggle vale of enable keywords changes.
     * @param event Angular material change event obj
     */
  toggleKeywords(event: MatSlideToggleChange): void {
    this.settings.enableKeywords = event.checked;
    this.emitUpdate();
  }
}
