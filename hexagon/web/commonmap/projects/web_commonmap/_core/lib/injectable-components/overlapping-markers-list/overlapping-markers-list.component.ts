import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import {
    LAYOUT_MANAGER_SETTINGS,
    Marker$v1,
    MarkerCommunicationSubs$v1,
    ClusterMarker$v1,
    ClusterMarkerCommunicationSubs$v1,
    Size$v1,
    PixelPoint$v1,
    MapCommunication$v1
} from '@galileo/web_commonmap/_common';
import { Subject } from 'rxjs';
import { trigger, transition, animate, state, style } from '@angular/animations';

/** Maximum number of located markers on a page */
const maxMarkersPerPage = 10;

/** Offsets to maintain from edge of the map when displaying the select list */
const mapEdgeBuffer = 20;


/** Size of padding around select list */
const listPadding = 7;

/** Height of flip button */
const flipButtonHeight = 32;

export interface OverlappingMarkersListSettings {
    overlappingMarkers: any;
    mapComm?: MapCommunication$v1;
    markerClicked$?: Subject<any>;
}

@Component({
    templateUrl: 'overlapping-markers-list.component.html',
    styleUrls: ['overlapping-markers-list.component.scss'],
    animations: [
        trigger('fadeout', [
            transition(':enter', [
                style({ opacity: '1' }),
                animate(200)
            ]),
            transition(':leave', [
                animate(200, style({ opacity: '0' }))
            ]),
            state('*', style({ opacity: '1' })),
        ])
    ]
})

// eslint-disable-next-line @angular-eslint/component-class-suffix
export class OverlappingMarkersListInjectableComponent implements OnInit, OnDestroy {

    /** Count of located map markers */
    childCount = 0;

    /** Flag to indicate the marker should have focus */

    isFocused = false;

    /** Markers for the current page of overlapping markers */
    curPageMarkers: any;

    /** Marker page start item number */
    markersStartItem = 1;

    /** Marker page end item number*/
    markersEndItem = 0;

    /** Height of list of markers */
    markersListHeight = 0;

    /** Width of the div that contains the list of markers */
    markersListPaneWidth = 0;

    /** Top of overlapping markers list.  This is offset from the top of the base marker. */
    markersListTopOffset = 0;

    /** Offset for the top of the base marker.  The is 1/2 the base marker height */
    baseMarkerTop = 0;

    /** Height of the div that is used for the horizontal connect line from the
     *  center of the base marker to the list vertical line
     */
    baseConnectLineDivHeight = 0;

    /** Width of the div that is used for the connect line from the
     *  center of the base marker to the list vertical line.  This will be 1/2 the base marker width + 15px;
     */
    baseConnectLineDivWidth = 0;

    /** Height of the top div used to create the vertical line and horizontal connect line to the marker in the list */
    topConnectLineHeight = 0;

    /** Height of the div for the  */
    bottomConnectLineHeight = 0;   // markerListItemHeight/2 - 2

    /** Where there are multiple pages, the last page may only have a few markers.  If the list of markers do not take
     *  up half the markers list height, the vertical line has to be extended down to the base marker connect line.  This
     *  will be height of the div that creates the extended vertical line */
    connectLineFillerHeight = 0;

    /** Flag to indicate if the filler connect line div should be displayed */
    showConnectLineFiller = false;

    /** Height of the bottom div on the last page when showing border */
    lastLineHeight = 21;

    /** Width for div to form horizontal connect line to list item */
    listItemConnectLineWidth = 0;

    /** Margin to move markers in order to make them touch the horizontal connect line  */
    listItemMargin = 0;

    /** Calculate the total width of the overlapping marker display to use for repositioning on the map */
    markersContainerWidth = 0;

    /** Cluster page size */
    markersPerPage = 0;

    /** Cluster current page */
    markersCurrentPage = 1;

    /** Cluster max page */
    markersMaxPage: number;

    /** Flag to show on left side instead of right */
    showLeft = false;

    /** The context id of the view using this component.  Needed for portal injection */
    contextId: string;

    /** Base marker that was clicked */
    baseMarker: any;

    /** Flip button top */
    flipBtnTop = 0;

    /** Flip button left */
    flipBtnLeft = 0;

    /** Height of the marker list item */
    markerListItemHeight = 0;

    /** Width of the marker list item */
    markerListItemWidth = 0;

    /** Max width of the list of markers that were found.  Use this to set the width of the display area */
    maxMarkerWidth = 0;

    /** Height of the footer pane with the page button on the select list */
    private footerPaneHeight = 30;

    private maxPixelPtY = 0;

    // The minimum Y pixel value that the base marker can be before we have to pan the map down so
    // the list will be on the screen.  The value is MapEdgeBuffer + marker list padding (7px) + height of base marker/2
    private minPixelPtY = 0;

    // Communication api to map
    private mapComm: MapCommunication$v1;

    // Map view window size
    private mapViewSize: Size$v1;
    private overlappingMarkers: any[] = [];
    private marker: Marker$v1;
    private baseMarkerSize: Size$v1;

    // Stubbed out subs
    private markerSubs: MarkerCommunicationSubs$v1;
    private clusterMarkerSubs: ClusterMarkerCommunicationSubs$v1;

    private compSettings: OverlappingMarkersListSettings;

    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private data: any) {
        this.marker = data;
        this.mapComm = this.marker.mapComm;
        this.compSettings = this.marker.markerSettings.properties;
        this.contextId = data.contextId;

        // Create noop subscriptions for these markers.  We just need them to display their UX
        // in the list.  They will not be active markers.
        this.markerSubs = new MarkerCommunicationSubs$v1();
        this.clusterMarkerSubs = new ClusterMarkerCommunicationSubs$v1();

        // Clone the actual markers found on the map.  Only need them to get the information to
        // inject the component icons
        this.overlappingMarkers = this.cloneMarkers(this.compSettings.overlappingMarkers);
        this.baseMarker = this.overlappingMarkers[0];
        if (this.baseMarker instanceof Marker$v1) {
            this.baseMarkerSize = this.baseMarker.markerSettings.iconDefinition2d.iconSize;
        } else {
            this.baseMarkerSize = this.baseMarker.clusterSettings.iconDefinition2d.iconSize;
        }
        this.mapViewSize = this.mapComm.mapViewSize;
    }

    ngOnInit() {

        this.childCount = this.overlappingMarkers.length;

        this.initStyleProps();


        // Calculate the initial offset of the top property of the div holding the expanded details
        // when the connect line is in the middle of the list

        this.markersListTopOffset = -((this.markersListHeight / 2) + listPadding - this.baseMarkerTop);
        this.baseConnectLineDivHeight = Math.abs(this.markersListTopOffset) + this.baseMarkerTop + 2;
        const maxYPixelPad = this.footerPaneHeight ? this.footerPaneHeight : flipButtonHeight;
        this.maxPixelPtY = this.mapViewSize.height - mapEdgeBuffer - listPadding - maxYPixelPad - this.markerListItemHeight / 2;

        this.curPageMarkers = [];
        this.markersCurrentPage = 1;
        this.markersMaxPage = Math.floor(this.childCount / this.markersPerPage);
        const lastPageCnt = this.childCount % this.markersPerPage;
        if (lastPageCnt > 0) {
            this.markersMaxPage++;
            const temp = Math.floor(this.markersPerPage / 2) - lastPageCnt;
            this.connectLineFillerHeight = temp * this.markerListItemHeight;
            if (this.markersPerPage % 2 === 1) {
                this.connectLineFillerHeight += this.markerListItemHeight / 2;
            }
        }

        this.markersStartItem = 1;
        if (this.childCount >= this.markersPerPage) {
            this.markersEndItem = this.markersPerPage;
        } else {
            this.markersEndItem = this.childCount;
        }

        this.getCurPageMarkers();

        this.fitToScreen();

        // this.listenToSelectionChangeEvent();
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
        // console.log('map markers marker destroyed');
    }

    private cloneMarkers(overlappingMarkers: any): any {
        const markers: any = [];

        for (const marker of overlappingMarkers) {
            if (marker instanceof Marker$v1) {
                const newMarker = new Marker$v1({
                    markerSettings: marker.markerSettings,
                    markerId: marker.markerId,
                    layerId: marker.layerId,
                    coordinate: marker.markerSettings.coordinate,
                    markerSubs: this.markerSubs,
                    mapComm: this.mapComm
                } as Marker$v1);

                markers.push(newMarker);
            } else {
                const newMarker = new ClusterMarker$v1({
                    childMarkers: marker.childMarkers,
                    clusterSettings: marker.clusterSettings,
                    markerId: marker.markerId,
                    layerId: marker.layerId,
                    markerSubs: this.clusterMarkerSubs,
                    mapComm: this.mapComm,
                    coordinate: marker.coordinate
                } as ClusterMarker$v1);

                markers.push(newMarker);
            }
        }

        return(markers);
    }

    private getCurPageMarkers() {
        this.curPageMarkers = this.overlappingMarkers.slice(this.markersStartItem - 1, this.markersEndItem);
    }

    private initStyleProps() {

        // Find the maximum height and width of all the markers.
        this.markerListItemHeight = 0;
        this.maxMarkerWidth = 0;
        let markerHeight = 0;
        let minMarkerWidth = 9999999;
        let height = 0;
        let width = 0;
        for (const marker of this.overlappingMarkers) {
            if (marker instanceof Marker$v1) {
                height = marker.markerSettings.iconDefinition2d.iconSize.height;
                width = marker.markerSettings.iconDefinition2d.iconSize.width;
            } else {
                height = marker.clusterSettings.iconDefinition2d.iconSize.height;
                width = marker.clusterSettings.iconDefinition2d.iconSize.width;
            }
            if (height > markerHeight) {
                markerHeight = height;
            }
            if (width > this.maxMarkerWidth) {
                this.maxMarkerWidth = width;
            }
            if (width < minMarkerWidth) {
                minMarkerWidth = width;
            }
    }

        // Add 5 pixel padding between the markers in the list.  Also allow for some overflow of the markers image
        this.markerListItemHeight += markerHeight + 5;
        this.markerListItemHeight = this.makeEven(this.markerListItemHeight);

        // Add 5 pixels to pad the display area of the marker in the list.
        this.markerListItemWidth = this.maxMarkerWidth + 5;
        this.markerListItemWidth = this.makeEven(this.markerListItemWidth);

        this.topConnectLineHeight = (this.markerListItemHeight / 2) + 2;

        // The width of the base connect line from the center of the base marker to the vertical line
        this.baseConnectLineDivWidth = Math.floor(this.maxMarkerWidth / 2) + 15;

        // Bottom connect line for the marker list height
        this.bottomConnectLineHeight = this.markerListItemHeight / 2;

        // Calculate margins in order to force markers to touch connect lines.  This will maintain at least a 20px connect line.
        // Some will be longer if the marker is smaller.
        // Base length of 20px + half the diff between the max and min marker widths + a 4px pad to make sure they touch
        this.listItemConnectLineWidth = 24 + (Math.floor((this.maxMarkerWidth - minMarkerWidth) / 2));
        // Shift the div back so it touches the connect line
        this.listItemMargin = -(Math.floor(((this.maxMarkerWidth - minMarkerWidth) / 2) + 1) + 8);

        // Calculate the width of the container that holds the list of markers.
        // This width is the connect line div width + +
        // the marker max width + 5px padding at end to allow for overflow of the markers
        this.markersListPaneWidth = this.maxMarkerWidth + this.listItemConnectLineWidth;

        // Calculate the total width of the overlapping marker display to use for repositioning on the map
        this.markersContainerWidth = this.markersListPaneWidth + this.listItemConnectLineWidth;

        // Marker list top offset
        this.baseMarkerTop = this.baseMarkerSize.height / 2;

        // Minimum pixel Y before we have to shift down
        // MapEdgeBuffer + marker list padding (7)  + markerListItemHeight/2
        this.minPixelPtY = mapEdgeBuffer + listPadding + this.baseMarkerTop + 4;

        // Calculate position of flip button
        this.flipBtnLeft = Math.floor((this.baseMarkerSize.width - 33) / 2);
        this.flipBtnTop = (this.baseMarkerSize.height + 4);

        const viewSize = this.mapComm.mapViewSize;

        this.markersPerPage =
            Math.floor((viewSize.height - this.footerPaneHeight - (listPadding * 2) - (mapEdgeBuffer *  2)) / this.markerListItemHeight);

            if (this.markersPerPage > maxMarkersPerPage) {
            this.markersPerPage = maxMarkersPerPage;
        }

        if (this.markersPerPage < this.childCount) {
            this.markersListHeight = this.markersPerPage * this.markerListItemHeight;
        } else {
            this.markersListHeight = this.childCount * this.markerListItemHeight;
        }

        if (this.childCount > this.markersPerPage) {
            this.markersListPaneWidth = 115;
        }

    }

    makeEven(value: number): number {
        if (value % 2 !== 0) {
            value += 1;
        }
        return(value);
    }

    /** Return the class for the last connect line */

    getLastLineClass(idx: number): string {

        let lastLineClass = '';
        if (this.markersMaxPage === 1) {
            if (idx === this.overlappingMarkers.length - 1) {
                lastLineClass = 'last';
            }
        } else {
            const rem = this.markersPerPage % 2;
            const temp = Math.floor(this.markersPerPage / 2);
            if (idx === this.curPageMarkers.length - 1) {
                if (this.markersCurrentPage !== this.markersMaxPage) {
                    if ((rem === 0 && idx >= temp) || (rem === 1 && idx > temp - 1)) {
                        lastLineClass = 'last';
                    }
                } else if (this.connectLineFillerHeight < 0) {
                    lastLineClass = 'last';
                }
            }
        }
        return (lastLineClass);
    }

    /** Return the height of the last connect line */
    getLastLineHeight(idx: number): number {

        let height = (this.markerListItemHeight / 2) - 2;
        if (idx === this.curPageMarkers.length - 1) {
            if (Math.abs(this.connectLineFillerHeight) >= 0 && Math.abs(this.connectLineFillerHeight) < this.bottomConnectLineHeight) {
                height += this.connectLineFillerHeight;
            }
        }
        return (height);
    }

    /** Calculate whether select list will fit on screen.  Shift or pan map if needed */

    private async fitToScreen() {

        const markersPixelPt = await this.mapComm.convertLatLonToPixelPoint(this.marker.markerSettings.coordinate);
        const panPt = new PixelPoint$v1(0, 0);

        // Check markers pt is too close to edge.  If so, pan to the min Y
        if (markersPixelPt.y < this.minPixelPtY) {
            panPt.y = markersPixelPt.y - this.minPixelPtY;
            markersPixelPt.y = this.minPixelPtY;
        } else if (markersPixelPt.y > this.maxPixelPtY) {
            panPt.y = markersPixelPt.y - this.maxPixelPtY;
            markersPixelPt.y = this.maxPixelPtY;
        }

        const widthToFit = Math.floor(this.markersContainerWidth + mapEdgeBuffer);
        if ((markersPixelPt.x + widthToFit) > this.mapViewSize.width) {
            if ((markersPixelPt.x - widthToFit) > 0) {
                this.showLeft = true;
            } else {
                // Will have to pan the map right.
                panPt.x = markersPixelPt.x + widthToFit - this.mapViewSize.width;
            }
        }

        // Look at top to see if we need and can shift connect line up or down

        const top = Math.floor(markersPixelPt.y + this.markersListTopOffset - this.baseMarkerTop);
        const bottom = Math.floor(markersPixelPt.y + this.markersListHeight / 2 + listPadding + this.footerPaneHeight);

        if (top < mapEdgeBuffer) {
            const shiftDown = mapEdgeBuffer - top;
            this.markersListTopOffset += (shiftDown);
            this.baseConnectLineDivHeight = Math.abs(this.markersListTopOffset) + this.baseMarkerTop + 2;
            this.connectLineFillerHeight -= shiftDown;
        } else if (bottom > this.mapViewSize.height - mapEdgeBuffer) {
            const shiftUp = bottom - (this.mapViewSize.height - mapEdgeBuffer);
            this.markersListTopOffset -= shiftUp;
            this.baseConnectLineDivHeight = Math.abs(this.markersListTopOffset) + this.baseMarkerTop + 2;
            this.connectLineFillerHeight += shiftUp;
        }

        if (panPt.x !== 0 || panPt.y !== 0) {
            this.mapComm.panMapByPixelPoint(panPt);
        }
    }

    // /**
    //  * Listen for selection change event
    //  */
    // private listenToSelectionChangeEvent() {
    //     this.actionStore.select$(this.contextId).pipe(
    //         takeUntil(this.destroy$),
    //         filter((data) => !!data)
    //     ).subscribe((data) => {
    //         if (this.mapComm.mapType === MapType$v1.Type3D) {
    //             this.marker.hidePopup();
    //         } else {
    //             this.marker.delete();
    //         }
    //     });
    // }

    /**
      * Handles the event when a marker on the list is clicked
      * @param marker - the marker that was clicked
      */

    markerClicked(event: any, marker: any) {
        this.stopPropagation(event);
        this.compSettings.markerClicked$.next(marker);
    }

    /**
      * Stop propagation of mouse events
      *
      * @param event mouse event
      */

     stopPropagation(event) {
         event.stopPropagation();
     }

    /**
     * Scroll up a page of data
     */

    scrollUp() {
        if (this.markersCurrentPage > 1) {
            this.markersCurrentPage--;
            this.showConnectLineFiller = false;
            this.markersStartItem -= this.markersPerPage;
            this.markersEndItem = this.markersStartItem + this.markersPerPage - 1;
            this.getCurPageMarkers();
        }

    }

    /**
     * Scroll down a page of data
    */

   scrollDown() {
        if (this.markersCurrentPage < this.markersMaxPage) {
            this.markersCurrentPage++;

            if (this.markersCurrentPage === this.markersMaxPage &&
                this.connectLineFillerHeight > 0) {
                this.showConnectLineFiller = true;
            }
            this.markersStartItem += this.markersPerPage;

            if (this.markersEndItem + this.markersPerPage > this.childCount) {
                this.markersEndItem = this.childCount;
            } else {
                this.markersEndItem = this.markersStartItem + this.markersPerPage - 1;
            }

            this.getCurPageMarkers();

        }
    }

    /** Toggle side to show markers list */
    toggleSide(event: any) {
        event.stopPropagation();
        this.showLeft = !this.showLeft;
    }

}
