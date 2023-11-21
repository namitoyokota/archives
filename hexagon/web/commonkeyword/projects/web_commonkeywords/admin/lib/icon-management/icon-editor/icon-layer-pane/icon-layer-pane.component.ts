import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import { Utils } from '@galileo/web_common-libraries';
import { CompositeIconMember$v1, PrimitiveIcon$v2 } from '@galileo/web_commonkeywords/_common';

import { PrimitiveIconStoreService } from '../../primitivie-icon-store.service';
import { IconLayerPaneTranslationTokens } from './icon-layer-pane.translation';

@Component({
    selector: 'hxgn-commonkeywords-icon-layer-pane',
    templateUrl: 'icon-layer-pane.component.html',
    styleUrls: ['icon-layer-pane.component.scss']
})

export class IconLayerPaneComponent implements OnChanges {
    /** Composite icon to show in preview */
    @Input() iconLayers: CompositeIconMember$v1[];

    /** Index of the selected icon */
    @Input() selectedIconIndex: number = null;

    /** Event when a change to the composite icon has been made */
    @Output() iconUpdate = new EventEmitter<CompositeIconMember$v1[]>();

    /** Event when an icon layer has been deleted */
    @Output() iconDelete =  new EventEmitter<number>();

    /** Event when the selected icon changes */
    @Output() selectionChange = new EventEmitter<number>();

    /** List of primitive icons that makes up the composite icon */
    iconStack: PrimitiveIcon$v2[] = [];

    /** The index of the item that is being moved */
    movingIndex: number;

    /** Expose IconLayerPaneTranslationTokens to HTML */
    tokens: typeof IconLayerPaneTranslationTokens = IconLayerPaneTranslationTokens;

    /** Export url helper to html */
    UrlHelper: typeof UrlHelper = UrlHelper;

    @HostListener('document:keydown.control.delete', []) onDel() {
      event.stopPropagation();

      if (this.selectedIconIndex >= 0) {
        this.deleteLayer(this.iconStack.length - this.selectedIconIndex - 1);
      }
    }

    constructor(private primitiveIconStore: PrimitiveIconStoreService) { }


    ngOnChanges(changes: SimpleChanges): void {
        this.iconStack = this.getPrimitiveIcons().reverse();
    }

    /**
     * Deletes the layer at a given index
     * @param index The index of the layer to delete
     */
    deleteLayer(index: number, event?: MouseEvent) {
        if (event) {
          event.stopPropagation();
        }

        this.iconDelete.emit(this.iconStack.length - index - 1);
    }

    /**
     * Selected the layer at a given index
     * @param index The index of the layer to select
     */
    selectLayer(index: number) {
        // Since the icon stack is shown in reverse flip the array
        this.selectionChange.emit(this.iconStack.length - index - 1);
    }

    /**
     * Returns true if the item at the given index is selected
     * @param index Index of the item to check if its selected
     */
    isSelected(index: number): boolean {
        if (!this.selectedIconIndex && this.selectedIconIndex !== 0) {
            return false;
        }
        // Since the icon stack is shown in reverse flip the array
        return Math.abs(this.iconStack.length - this.selectedIconIndex - 1 ) === index;
    }

    /**
     * Method use for performance gains on the list of layers
     * @param index Index of item
     * @param item The time
     */
    trackByFn(index, item: PrimitiveIcon$v2) {
        return item?.id;
    }

    /**
     * Reorders the list of icons
     * @param event Angular drag drop event
     */
    reorderIcons(event: CdkDragDrop<PrimitiveIcon$v2[]>) {
        const selectedId = this.iconLayers[this.selectedIconIndex]?.primitiveIconId;

        const updatedIconLayers: CompositeIconMember$v1[] = Utils.deepCopy(this.iconLayers);
        moveItemInArray(updatedIconLayers.reverse(), this.movingIndex, event.currentIndex);

        // Update selected index if there is selection
        if (selectedId) {
          const index = updatedIconLayers.findIndex(icon => icon.primitiveIconId === selectedId);
          this.selectLayer(index);
        }

        updatedIconLayers.reverse();

        this.iconUpdate.emit(updatedIconLayers);
    }

    /**
     * Gets list of primitive icons for this composite icon
     */
    private getPrimitiveIcons(): PrimitiveIcon$v2[] {
        const icons: PrimitiveIcon$v2[] = [];
        this.iconLayers.forEach(item => {
            icons.push(this.primitiveIconStore.get(item.primitiveIconId));
        });

        return icons;
    }
}
