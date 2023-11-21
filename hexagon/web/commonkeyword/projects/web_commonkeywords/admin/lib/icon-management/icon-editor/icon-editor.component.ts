import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CompositeIcon$v1, CompositeIconMember$v1 } from '@galileo/web_commonkeywords/_common';
import { Subscription } from 'rxjs';

import { IconManagementService } from '../icon-management.service';
import { IconEditorTranslationTokens } from './icon-editor.translation';
import { Size } from './size';

@Component({
    selector: 'hxgn-commonkeywords-icon-editor',
    templateUrl: 'icon-editor.component.html',
    styleUrls: ['icon-editor.component.scss']
})

export class IconEditorComponent implements OnInit, OnDestroy {

    /** The composite icon being edited */
    @Input() compositeIcon: CompositeIcon$v1;

    /** Events out whenever the icon changes */
    @Output() iconChange = new EventEmitter<CompositeIcon$v1>();

    /** Reference to the editor's outer pane */
    @ViewChild('editorPane', { static: true }) editorOuterPane: ElementRef;

    /** The size of the icon editor pane */
    iconPaneSize: number;

    /** The size of the editor's unscaled size */
    readonly baseSize: Size = {
        x: 394,
        y: 394
    };

    /** The starting size of the icon pane that is used to
     * calculate the relative scale
     */
    relativeSize: Size = {
        x: 394,
        y: 394
    };

    /** How much everything should be scaled compared to the current size */
    relativeScale: number;

    /** The different sizes to show preview for */
    previewSizes = [44, 34, 24];

    /** The index of the currently selected icon layer */
    selectedIconLayer: number;

    /** Expose IconEditorTranslationTokens to HTML */
    tokens: typeof IconEditorTranslationTokens = IconEditorTranslationTokens;

    resizeSubscription: Subscription;

    constructor(private iconSrv: IconManagementService) { }

    ngOnInit() {
        this.setIconEditorPaneSize();
    }

    ngOnDestroy() {
        if (this.resizeSubscription) {
            this.resizeSubscription.unsubscribe();
        }
    }

    /** Process updates from icon item */
    iconUpdated(icon: CompositeIconMember$v1, index: number) {
        // First the scale must be reset
        this.compositeIcon.iconStack[index] = this.scaleToBase(icon);

        this.resetDrawScale();
        this.iconChange.emit(this.compositeIcon);
    }

    /**
     * Returns the composite icon
     */
    getCompositeIcon() {
        return this.compositeIcon;
    }

    /**
     * Updates the icon stack
     * @param icon Composite icon that has been updated
     */
    iconStackUpdate(layers: CompositeIconMember$v1[]) {
        this.compositeIcon.iconStack = [].concat(layers);
        this.iconChange.emit(this.compositeIcon);
    }

    /** Sets the selected icon layer */
    setSelectedIconLayer(index: number) {
        if (this.selectedIconLayer === index || index === null) {
            this.selectedIconLayer = null;
            this.iconSrv.selectedLayerIndex = null;
            this.iconSrv.selectedPrimitiveIconId = null;
        } else {
            this.selectedIconLayer = index;
            this.iconSrv.selectedLayerIndex = index;
            this.iconSrv.selectedPrimitiveIconId = this.compositeIcon.iconStack[index].primitiveIconId;
        }
    }

    /** Process icon changes from the toolbar */
    toolBarChange(change: CompositeIconMember$v1) {
        this.compositeIcon.iconStack[this.iconSrv.selectedLayerIndex] = new CompositeIconMember$v1(change);
        this.compositeIcon = new CompositeIcon$v1(this.compositeIcon);

        this.iconChange.emit(this.compositeIcon);
    }

    /**
     * Scales the icons to be relative to the size of the editor pane
     */
    resetDrawScale() {
        this.relativeSize = {
            x: 394,
            y: 394
        };

        this.setIconEditorPaneSize();
    }

    /**
     * Deletes an icon from the icon stack
     * @param index Index of icon in stack to remove
     */
    iconDeleted(index: number) {
        this.selectedIconLayer = null;
        this.iconSrv.selectedLayerIndex = null;
        this.iconSrv.selectedPrimitiveIconId = null;
        this.compositeIcon.iconStack.splice(index, 1);
        this.iconChange.emit(this.compositeIcon);
    }

    private scaleToBase(icon: CompositeIconMember$v1): CompositeIconMember$v1 {
        const scaleFactor = this.baseSize.x / this.iconPaneSize;
        icon = new CompositeIconMember$v1(icon);

        icon.options.scaleSize = {
            x: icon.options.scaleSize.x * scaleFactor,
            y: icon.options.scaleSize.y * scaleFactor
        };

        icon.options.point = {
            x: icon.options.point.x * scaleFactor,
            y: icon.options.point.y * scaleFactor
        };
        return icon;
    }

    private setIconEditorPaneSize() {
        const offset = 30;
        const width = this.editorOuterPane.nativeElement.offsetWidth;
        const height = this.editorOuterPane.nativeElement.offsetHeight;

        if (width > height) {
            this.iconPaneSize = height - offset;
        } else {
            this.iconPaneSize = width - offset;
        }

        this.relativeScale = this.calculateScale();

        // Update base size
        this.relativeSize = {
            x: this.relativeSize.x * this.relativeScale,
            y: this.relativeSize.y * this.relativeScale
        };
    }

    private calculateScale(): number {
        return this.iconPaneSize / this.relativeSize.x;
    }

}
