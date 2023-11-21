import { CdkDragEnd, CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { UrlHelper } from '@galileo/web_common-http';
import { CompositeIconMember$v1, CompositeIconOptions$v1 } from '@galileo/web_commonkeywords/_common';

import { PrimitiveIconStoreService } from '../../primitivie-icon-store.service';
import { Size } from '../size';

enum ResizeHandle {
    e, w, n, s
}

@Component({
    selector: 'hxgn-commonkeywords-icon-item',
    templateUrl: 'icon-item.component.html',
    styleUrls: ['icon-item.component.scss']
})

export class IconItemComponent implements OnChanges {
    /** The size of the icon editor pane */
    @Input() iconPaneSize: number;

    /** How much the icon should be scaled in comparison to the icon pane */
    @Input() relativeScale: number;

    /** Flag that holds if the icon is selected for editing */
    @Input() isSelected = false;

    /** The composite that is being edited */
    @Input() compositeIcon: CompositeIconMember$v1;

    /** Event that is fired when selection changes */
    @Output() layerClick = new EventEmitter();

    /** Event that an update to the icon has been made.
     * Note: All of the values are relative to the the current pane size
     */
    @Output() update = new EventEmitter<CompositeIconMember$v1>();

    /** Event that the icon has been deleted */
    @Output() delete = new EventEmitter();

    /** The current location of the icon */
    iconPos: Size;

    /** The size the icon should be displayed as */
    iconSize: Size;

    /** Where the icon should first be drawn */
    startPos: Size;

    /** Used to reset the drag element after resize */
    toggle = true;

    /** The resize handle that is currently selected */
    selectedResizeHandle: ResizeHandle;

    /** Expose ResizeHandle to the HTML */
    resizeHandle: typeof ResizeHandle = ResizeHandle;

    /** The url to the image to display */
    iconUrl: string;

    /** If true will prevent the client event from being emitted */
    preventClick = false;

    /** Export url helper to html */
    UrlHelper: typeof UrlHelper = UrlHelper;

    private readonly minSize = {
        x: 50,
        y: 50
    } as Size;

    constructor(
        private primitiveIconStore: PrimitiveIconStoreService
    ) { }

    ngOnChanges(changes: any): void {
        if (changes.hasOwnProperty('isSelected') && this.iconUrl) {
            return;
        }

        if (!this.iconUrl) {
            if (this.compositeIcon.options.showStroke) {
                this.iconUrl = this.primitiveIconStore.get(this.compositeIcon.primitiveIconId)?.urlWithStroke;
            } else {
                this.iconUrl = this.primitiveIconStore.get(this.compositeIcon.primitiveIconId)?.url;
            }

            this.iconPos = this.compositeIcon.options.point;
            this.iconSize = this.compositeIcon.options.scaleSize;
        }

        // Scale the icon size and pos
        this.iconSize = {
            x: this.iconSize.x * this.relativeScale,
            y: this.iconSize.y * this.relativeScale
        };

        this.iconPos = this.getScaledPos();
        this.resetBoundingBox();
    }

    /**
     * Method that is called when drag ends. Sets the current icon position.
     * @param event Angular Cdk drag end object
     */
    onDragEnd(event: CdkDragEnd) {
        this.iconPos = {
            x: event.source.getFreeDragPosition().x,
            y: event.source.getFreeDragPosition().y
        };
        this.startPos = null;
        this.iconUpdated();
    }

    /**
     * Method that is called when drag starts.
     * @param event Angular Cdk drag start object
     */
    onDragStart(event: CdkDragStart) {
        if (!this.isSelected) {
            this.isSelected = true;
            this.layerClick.emit();
        }

        this.preventClick = true;
    }

    /**
     * Starts the icon resizing process
     * @param event Mouse event
     * @param handle The resize handle that is going to be used
     */
    onStartIconResize(event: MouseEvent, handle: ResizeHandle) {
        this.startPos = {
            x: event.clientX,
            y: event.clientY
        };

        this.selectedResizeHandle = handle;
    }

    /** Event that the layer has been clicked */
    onLayerClick() {
        event.stopPropagation();
        if (!this.preventClick) {
            this.layerClick.emit();
        } else {
            this.preventClick = false;
        }
    }

    /**
     * Method that is called when icon resize is done
     */
    onEndIconResize(event: MouseEvent) {
        if (this.startPos) {
            this.startPos = null;
            this.resetBoundingBox();

            this.startPos = null;
            this.iconUpdated();
        }
    }

    /**
     * Calls the correct resize method based on selected resize handle
     * @param event Mouse event
     */
    onIconResize(event: MouseEvent) {
        if (this.startPos) {
            switch (this.selectedResizeHandle) {
                case ResizeHandle.w:
                    this.resizeWestHandle(event);
                    break;
                case ResizeHandle.e:
                    this.resizeEastHandle(event);
                    break;
                case ResizeHandle.n:
                    this.resizeNorthHandle(event);
                    break;
                case ResizeHandle.s:
                    this.resizeSouthHandle(event);
                    break;
            }
        }
    }

    /**
     * Event an update to the icon has been made
     */
    iconUpdated() {
        const icon = new CompositeIconMember$v1({
            primitiveIconId: this.compositeIcon.primitiveIconId,
            options: new CompositeIconOptions$v1({
                scaleSize: this.iconSize,
                point: this.iconPos,
                showStroke: this.compositeIcon.options.showStroke,
                flipH: this.compositeIcon.options.flipH,
                flipV: this.compositeIcon.options.flipV
            })
        });

        this.update.emit(icon);
    }

    /**
     * Causes the bounding box for the icon to be reset
     */
    private resetBoundingBox() {
        this.toggle = false;
        this.toggle = true;
    }

    /**
     * Returns the scaled size position of the icon
     */
    private getScaledPos(): Size {
        return {
            x: this.iconPos.x * this.relativeScale,
            y: this.iconPos.y * this.relativeScale
        };
    }

    /**
     * Returns true if the size is below the min
     * @param size The size to check
     */
    private isBelowMinSize(size: Size): boolean {
        return (size.y < this.minSize.y || size.x < this.minSize.x);
    }

    /**
     * Method used to resize icon when west handle is active
     * @param event Mouse event
     */
    private resizeWestHandle(event: MouseEvent) {
        if (this.startPos) {
            const offSet = {
                x: event.clientX - this.startPos.x,
                y: event.clientY - this.startPos.y
            };

            const aspect = this.iconSize.x / this.iconSize.y;
            const newSize = {
                x: this.iconSize.x + (offSet.x * -1) * aspect,
                y: this.iconSize.y + (offSet.x * -1 )
            };

            // Make sure the new size is not too small
            if (this.isBelowMinSize(newSize)) {
                return;
            }

            // Make sure the new size is not bigger then container
            if (newSize.y + (offSet.x * -1) + this.iconPos.y + 4 > this.iconPaneSize) {
                return;
            }

            if (newSize.x + offSet.x + this.iconPos.x + 4 > this.iconPaneSize) {
                return;
            }

            if (this.iconPos.x + offSet.x < -4) {
                return;
            }

            this.iconSize = newSize;

            this.iconPos = { x: (this.iconPos.x + offSet.x), y: this.iconPos.y};

            this.startPos.x += offSet.x;
            this.startPos.y += offSet.y;
        }
    }

    /**
     * Method used to resize icon when east handle is active
     * @param event Mouse event
     */
    private resizeEastHandle(event: MouseEvent) {
        if (this.startPos) {
            const offSet = {
                x: event.clientX - this.startPos.x,
                y: event.clientY - this.startPos.y
            };

            const aspect = this.iconSize.y / this.iconSize.x;
            const newSize = {
                x: this.iconSize.x + offSet.x,
                y: this.iconSize.y + offSet.x * aspect
            };

            // Make sure the new size is not too small
            if (this.isBelowMinSize(newSize)) {
                return;
            }

            // Make sure the new size is not bigger then container
            if (newSize.x + offSet.x + this.iconPos.x + 4 > this.iconPaneSize) {
                return;
            }

            if (newSize.y + offSet.x + this.iconPos.y + 4 > this.iconPaneSize) {
                return;
            }

            this.iconSize = newSize;

            this.startPos.x += offSet.x;
            this.startPos.y += offSet.y;
        }
    }

    /**
     * Method used to resize icon when north handle is active
     * @param event Mouse event
     */
    private resizeNorthHandle(event: MouseEvent) {
        if (this.startPos) {
            const offSet = {
                x: event.clientX - this.startPos.x,
                y: event.clientY - this.startPos.y
            };

            const aspect = this.iconSize.x / this.iconSize.y;
            const newSize = {
                x: this.iconSize.x + (offSet.y * -1) * aspect,
                y: this.iconSize.y + (offSet.y * -1 )
            };

            // Make sure the new size is not too small
            if (this.isBelowMinSize(newSize)) {
                return;
            }

            // Make sure the new size is not bigger then container
            if (newSize.x + offSet.x + this.iconPos.x + 4 > this.iconPaneSize) {
                return;
            }

            if (this.iconPos.y + offSet.y < -4) {
                return;
            }

            this.iconSize = newSize;
            this.iconPos = { x: this.iconPos.x, y: (this.iconPos.y + offSet.y)};

            this.startPos.x += offSet.x;
            this.startPos.y += offSet.y;
        }
    }

    /**
     * Method used to resize icon when south handle is active
     * @param event Mouse event
     */
    private resizeSouthHandle(event: MouseEvent) {
        if (this.startPos) {
            const offSet = {
                x: event.clientX - this.startPos.x,
                y: event.clientY - this.startPos.y
            };

            const aspect = this.iconSize.x / this.iconSize.y;
            const newSize = {
                x: this.iconSize.x + offSet.y * aspect,
                y: this.iconSize.y + offSet.y
            };

            // Make sure the new size is not too small
            if (this.isBelowMinSize(newSize)) {
                return;
            }

            // Make sure the new size is not bigger then container
            if (newSize.x + offSet.x + this.iconPos.x + 4 > this.iconPaneSize) {
                return;
            }

            if (newSize.y + offSet.x + this.iconPos.y + 4 > this.iconPaneSize) {
                return;
            }

            this.iconSize = newSize;
            this.startPos.x += offSet.x;
            this.startPos.y += offSet.y;
        }
    }
}
