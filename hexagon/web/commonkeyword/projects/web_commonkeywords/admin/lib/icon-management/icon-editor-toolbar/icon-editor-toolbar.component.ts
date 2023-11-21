import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CompositeIconMember$v1 } from '@galileo/web_commonkeywords/_common';

import { IconManagementService } from '../icon-management.service';
import { PrimitiveIconStoreService } from '../primitivie-icon-store.service';
import { TranslationTokens } from './icon-editor-toolbar.translation';

/* eslint-disable @angular-eslint/no-output-native */
@Component({
    selector: 'hxgn-commonkeywords-icon-editor-toolbar',
    templateUrl: 'icon-editor-toolbar.component.html',
    styleUrls: ['icon-editor-toolbar.component.scss']
})
export class IconEditorToolbarComponent {
    /** The icon being edited */
    @Input() compositeIcon: CompositeIconMember$v1;

    /** Event when changes to the icon has been made */
    @Output() change = new EventEmitter<CompositeIconMember$v1>();

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;


    constructor(private iconSrv: IconManagementService,
                private iconStore: PrimitiveIconStoreService) { }

    /**
     * Returns true if the icon support adding a stroke
     */
    supportsIconStroke() {
      if (!this.compositeIcon) {
        return true;
      }

      return !!this.iconStore.get(this.compositeIcon?.primitiveIconId)?.urlWithStroke;
    }

    /**
     * Returns true if the edit buttons should be disabled
     * */
    disabledTools(): boolean {
        return !this.iconSrv.selectedPrimitiveIconId;
    }

    /**
     * Toggles the stroke on and off
     */
    strokeToggle(change: MatSlideToggleChange) {

        if (this.compositeIcon) {
            this.compositeIcon.options.showStroke = change.checked;
            this.change.emit(this.compositeIcon);
        }
    }

    /**
     * Toggle flipping the icon horizontally
     */
    toggleFlipH() {
        if (this.compositeIcon) {
            this.compositeIcon.options.flipH = !this.compositeIcon.options.flipH;
            this.change.emit(this.compositeIcon);
        }
    }

    /**
     * Toggle flipping the icon vertically
     */
    toggleFlipV() {
        if (this.compositeIcon) {
            this.compositeIcon.options.flipV = !this.compositeIcon.options.flipV;
            this.change.emit(this.compositeIcon);
        }
    }

}
