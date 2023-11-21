import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Alarm$v1, LAYOUT_MANAGER_SETTINGS, RestrictIds$v1 } from '@galileo/web_alarms/_common';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import {
    DisplayPriority$v1,
    DisplayPriorityMessage$v1,
    MapCommunication$v1,
    Marker$v1,
    PixelPoint$v1,
    Size$v1,
} from '@galileo/web_commonmap/adapter';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ActionStoreService } from '../../action-store.service';
import { TombstonedService } from '../../tombstoned.service';

/** Maximum number of detail cards on a page */
const maxClusterPageSize = 10;

/** Size of the details card */
const cardSize = 42;

const bottomConnectLineHeight = 19;   // cardSize/2 - 2

/** Min pixel point values for a marker cluster before it has to be panned away from
 *  edge of map.
 */
const minPixelPtY = 49;  // MapEdgeBuffer + select list padding (7)  + CardSize/2 + border size/2 (1))

/** Offsets to maintain from edge of the map when displaying the select list */
const mapEdgeBuffer = 20;

/** Width of the select list div */
const listWidth = 349;

/** Initial offset of the top property of the select list.  This is half the map cluster marker size (34x34) */
const markerTopOffset = 20;

/** Offset when calculating the height of the div that creates the main connect line */
const connectLineHeightOffset = 20;

/** Size of padding around select list */
const listPadding = 7;

/** Height of flip button */
const flipButtonHeight = 32;

export interface ClusterMarkerDetailsSettings {
    id: string;
    clusteredAlarms: any;
    mapComm?: MapCommunication$v1;
    marker?: Marker$v1;
}

@Component({
    templateUrl: 'map-cluster-details.component.html',
    styleUrls: ['map-cluster-details.component.scss'],
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
export class MapClusterDetailsInjectableComponent implements OnInit, OnDestroy {

    /** Alarms that are contained in the cluster */
    clusteredAlarms: any = [];

    /** Count of children inside of the cluster marker */
    childCount = 0;

    /** Highest priority of all child markers */
    highestPriority = null;

    /** Flag to indicate the marker should have focus */
    isFocused = false;

    /** Cluster page array */
    clusterPageMarkers: any;

    /** Cluster page start item number */
    clusterStartItem = 1;

    /** Cluster page end item number */
    clusterEndItem = 0;

    /** Height of list of alarm cards */
    cardListHeight = 0;

    /** Top of select list */
    selectListTopOffset = 0;

    /** Height of the div that is used for the connect line */
    connectLineHeight = 0;

     /** Height of div to draw the filler connect line */
    connectLineFillerHeight = 0;

    /** Flag to indicate if the filler connect line div should be displayed */
    showConnectLineFiller = false;

    /** Height of the bottom div on the last page when showing border */
    lastLineHeight = 21;

    /** Cluster page size */
    clusterPageSize = maxClusterPageSize;

    /** Cluster current page */
    clusterCurrentPage = 1;

    /** Cluster max page */
    clusterMaxPage: number;

    /** Flag to show on left side instead of right */
    showLeft = false;

    /** The context id of the view using this component.  Needed for portal injection */
    contextId: string;

    /** Height of the footer pane with the page button on the select list */
    private footerPaneHeight = 30;

    private maxPixelPtY = 0;

    /** Communication api to map */
    private mapComm: MapCommunication$v1;

    /** Map view window size */
    private mapViewSize: Size$v1;
    private marker: Marker$v1;
    private compSettings: ClusterMarkerDetailsSettings;
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private actionStore: ActionStoreService,
        private tombstonedSvc: TombstonedService,
        private ffAdapter: CommonfeatureflagsAdapterService$v1,
        @Inject(LAYOUT_MANAGER_SETTINGS) private data: any
    ) {
        if (data instanceof Marker$v1) {
            this.marker = data;
            this.mapComm = this.marker.mapComm;
            this.compSettings = this.marker.markerSettings.properties;
        }
        this.contextId = data.contextId;
    }

    ngOnInit() {
        if (this.marker) {
            const ids = this.compSettings.clusteredAlarms.map((incident) => {
                return(incident.id);
            });
            this.tombstonedSvc.lockAsync(ids, this.marker.markerId, this.compSettings.clusteredAlarms[0].tenantId);
        }


        this.childCount = this.compSettings.clusteredAlarms.length;
        this.clusteredAlarms = this.compSettings.clusteredAlarms;
        this.setHighestPriority();

        this.clusteredAlarms.sort((a, b) => {
            return (a.title > b.title) ? 1 : -1;
        });

        this.mapViewSize = this.mapComm.mapViewSize;

        const viewSize = this.mapComm.mapViewSize;

        this.clusterPageSize = Math.floor((viewSize.height - this.footerPaneHeight - (listPadding * 2) - (mapEdgeBuffer *  2)) / cardSize);
        if (this.clusterPageSize > maxClusterPageSize) {
            this.clusterPageSize = maxClusterPageSize;
        }

        if (this.clusterPageSize <= this.childCount) {
            this.cardListHeight = this.clusterPageSize * cardSize;
        } else {
            this.cardListHeight = this.childCount * cardSize;
        }

        if (this.childCount <= this.clusterPageSize) {
            this.footerPaneHeight = 0;
        }

        // Calculate the initial offset of the top property of the div holding the expanded details
        // when the connect line is in the middle of the list

        this.selectListTopOffset = -((this.cardListHeight / 2) + listPadding - markerTopOffset);
        this.connectLineHeight = Math.abs(this.selectListTopOffset) + connectLineHeightOffset;
        const maxYPixelPad = this.footerPaneHeight ? this.footerPaneHeight : flipButtonHeight;
        this.maxPixelPtY = this.mapViewSize.height - mapEdgeBuffer - listPadding - maxYPixelPad - cardSize / 2;

        this.clusterPageMarkers = [];
        this.clusterCurrentPage = 1;
        this.clusterMaxPage = Math.floor(this.childCount / this.clusterPageSize);
        const lastPageCnt = this.childCount % this.clusterPageSize;
        if (lastPageCnt > 0) {
            this.clusterMaxPage++;
            const temp = Math.floor(this.clusterPageSize / 2) - lastPageCnt;
            this.connectLineFillerHeight = temp * cardSize;
            if (this.clusterPageSize % 2 === 1) {
                this.connectLineFillerHeight += cardSize / 2;
            }
        }

        this.clusterStartItem = 1;
        if (this.childCount >= this.clusterPageSize) {
            this.clusterEndItem = this.clusterPageSize;
        } else {
            this.clusterEndItem = this.childCount;
        }

        this.getClusterPageMarkers();

        this.mapComm.mapEvents.mapClicked$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.marker.delete();
        });

        this.mapComm.mapEvents.mapZoomChanged$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.marker.delete();
        });

        this.mapComm.mapEvents.mapResized$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.marker.delete();
        });

        this.mapComm.mapEvents.clusterMarkerExpanding$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.marker.delete();
        });

        this.mapComm.mapEvents.markerDisplayPriorityChanged$.pipe(takeUntil(this.destroy$))
            .subscribe((params: DisplayPriorityMessage$v1) => {
            if (params.displayPriority === DisplayPriority$v1.Focused) {
                this.marker.delete();
            }
        });

        this.fitToScreen();
        if (this.contextId) {
            this.listenToSelectionChangeEvent();
        }
    }

    ngOnDestroy() {
        if (this.marker) {
            this.tombstonedSvc.release(this.marker.markerId);
        }

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    private getClusterPageMarkers() {
        this.clusterPageMarkers = this.clusteredAlarms.slice(this.clusterStartItem - 1, this.clusterEndItem);
    }


    /** Return the class for the last connect line */

    getLastLineClass(idx: number): string {

        let lastLineClass = '';
        if (this.childCount <= this.clusterPageSize) {
            if (idx === this.clusterPageMarkers.length - 1) {
                lastLineClass = 'last';
            }
        } else {
            const rem = this.clusterPageSize % 2;
            const temp = Math.floor(this.clusterPageSize / 2);
            if (idx === this.clusterPageMarkers.length - 1) {
                if (this.clusterCurrentPage !== this.clusterMaxPage) {
                    if ((rem === 0 && idx >= temp) || (rem === 1 && idx > temp - 1)) {
                        lastLineClass = 'last';
                    }
                } else if (this.connectLineFillerHeight < -bottomConnectLineHeight) {
                    lastLineClass = 'last';
                }
            }
        }
        return (lastLineClass);
    }

    /** Return the height of the last connect line */

    getLastLineHeight(idx: number): number {

        let height = bottomConnectLineHeight;
        if (idx === this.clusterPageMarkers.length - 1) {
            if (Math.abs(this.connectLineFillerHeight) >= 0 && Math.abs(this.connectLineFillerHeight) < bottomConnectLineHeight) {
                height += this.connectLineFillerHeight;
            }
        }
        return (height);
    }

    /** Calculate whether select list will fit on screen.  Shift or pan map if needed */

    private async fitToScreen() {

        const clusterPixelPt = await this.mapComm.convertLatLonToPixelPoint(this.marker.markerSettings.coordinate);
        const panPt = new PixelPoint$v1(0, 0);

        // Check cluster pt is too close to edge.  If so, pan to the min Y
        if (clusterPixelPt.y < minPixelPtY) {
            panPt.y = clusterPixelPt.y - minPixelPtY;
            clusterPixelPt.y = minPixelPtY;
        } else if (clusterPixelPt.y > this.maxPixelPtY) {
            panPt.y = clusterPixelPt.y - this.maxPixelPtY;
            clusterPixelPt.y = this.maxPixelPtY;
        }

        const widthToFit = Math.floor(listWidth + mapEdgeBuffer);
        if ((clusterPixelPt.x + widthToFit) > this.mapViewSize.width) {
            if ((clusterPixelPt.x - widthToFit) > 0) {
                this.showLeft = true;
            } else {
                // Will have to pan the map right.
                panPt.x = clusterPixelPt.x + widthToFit - this.mapViewSize.width;
            }
        }

        // Look at top to see if we need and can shift connect line up or down

        const top = Math.floor(clusterPixelPt.y + this.selectListTopOffset - markerTopOffset - 1);
        const bottom = Math.floor(clusterPixelPt.y + this.cardListHeight / 2 + listPadding + this.footerPaneHeight);

        if (top < mapEdgeBuffer) {
            const shiftDown = mapEdgeBuffer - top;
            this.selectListTopOffset += (shiftDown);
            this.connectLineHeight = Math.abs(this.selectListTopOffset) + connectLineHeightOffset;
            this.connectLineFillerHeight -= shiftDown;
        } else if (bottom > this.mapViewSize.height - mapEdgeBuffer) {
            const shiftUp = bottom - (this.mapViewSize.height - mapEdgeBuffer);
            this.selectListTopOffset -= shiftUp;
            this.connectLineHeight = Math.abs(this.selectListTopOffset) + connectLineHeightOffset;
            this.connectLineFillerHeight += shiftUp;
        }

        if (panPt.x !== 0 || panPt.y !== 0) {
            this.mapComm.panMapByPixelPoint(panPt);
        }
    }

    /** Get the child alarms and find the highest priority */
    setHighestPriority() {

        for (const alarm of this.clusteredAlarms) {
            if (alarm) {
                if (!alarm.isRedacted(RestrictIds$v1.priority) && typeof (alarm.priority) !== 'undefined') {
                    if (this.highestPriority === null || this.highestPriority > alarm.priority) {
                        this.highestPriority = alarm.priority;
                    }
                }
            }
        }
    }

    /**
     * Listen for alarm selection change event
     */
    private listenToSelectionChangeEvent() {
        this.actionStore.multiselect$(this.contextId).pipe(
            takeUntil(this.destroy$),
            filter((data) => !!data)
        ).subscribe((data) => {
            for (const clusteredAlarm of this.clusteredAlarms) {
                if (data?.items?.some(item => item.entityId === clusteredAlarm.id)) {
                    this.marker.delete();
                }
            }
        });
    }

    /**
     * User clicks on cluster marker
     */
    clusterClicked(event: any) {
        event.stopPropagation();
        this.marker.delete();
    }

    /**
     * markerClicked
     * @param alarm - the alarm corresponding to the marker that was clicked
     */
    markerClicked(alarm: Alarm$v1) {
        if (this.contextId) {
            this.actionStore.multiselect(this.contextId, [alarm.id], false);
        }
    }

    /**
     * Alarm on the cluster list was cleared.
     */
    alarmCleared() {
        this.marker.delete();
    }

    /**
     * Stop propagation of mouse events
     */
    stopPropagation(event) {
        event.stopPropagation();
    }

    /**
     * Scroll up a page of data
     */
    scrollUp() {
        if (this.clusterCurrentPage > 1) {
            this.clusterCurrentPage--;
            this.showConnectLineFiller = false;
            this.clusterStartItem -= this.clusterPageSize;
            this.clusterEndItem = this.clusterStartItem + this.clusterPageSize - 1;
            this.getClusterPageMarkers();
        }
    }

    /**
     * Scroll down a page of data
     */
    scrollDown() {
        if (this.clusterCurrentPage < this.clusterMaxPage) {
            this.clusterCurrentPage++;

            if (this.clusterCurrentPage === this.clusterMaxPage &&
                this.connectLineFillerHeight > 0) {
                this.showConnectLineFiller = true;
            }
            this.clusterStartItem += this.clusterPageSize;

            if (this.clusterEndItem + this.clusterPageSize > this.childCount) {
                this.clusterEndItem = this.childCount;
            } else {
                this.clusterEndItem = this.clusterStartItem + this.clusterPageSize - 1;
            }

            this.getClusterPageMarkers();

        }
    }

    /** Toggle side to show cluster list */
    toggleSide(event: any) {
        event.stopPropagation();
        this.showLeft = !this.showLeft;
    }

}
