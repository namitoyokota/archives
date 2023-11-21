import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ChangeOperator$v1,
  ChangeRecord$v1,
  Descriptor$v1,
  EntityHistoryStoreService$v1,
} from '@galileo/web_common-libraries';
import { Shape$v1 } from '@galileo/web_shapes/_common';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { DataService } from '../../../data.service';
import { EventService } from '../../../event.service';
import { ShapeStoreService } from '../../../shape-store.service';
import { HistoryDialogComponent, HistoryDialogData } from './history-dialog/history-dialog.component';
import { TranslationTokens } from './history.translation';

@Component({
    selector: 'hxgn-shapes-history',
    templateUrl: 'history.component.html',
    styleUrls: ['history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {

    /** The shape data for this component */
    @Input() shape: Shape$v1;

    /** The context id of the view using this component (for portal injection) */
    @Input() contextId: string;

    /** History objects associated with this shape */
    shapeHistory: ChangeRecord$v1[] = [];

    /** Tracks shapes loading status */
    shapesLoading = true;

    /** Tracks asset associations loading status */
    assetAssociationsLoading = true;

    /** Tracks device associations loading status */
    deviceAssociationsLoading = true;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** Expose change operator to html */
    changeOperator: typeof ChangeOperator$v1 = ChangeOperator$v1;

    /** Expose translation tokens to html */
    tokens: typeof TranslationTokens = TranslationTokens;

    /**  Observable for component destroyed */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private shapeStore: ShapeStoreService,
        private dataSrv: DataService,
        private dialog: MatDialog,
        private eventSrv: EventService,
        private historySrv: EntityHistoryStoreService$v1
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {

        // Set up history listener
        if (this.historySrv.get$(this.shape.id, this.contextId) === null) {
            await this.requestHistoryAsync(2);
            this.setupHistoryListener();
        } else {
            this.setupHistoryListener();
        }

        // Subscription to get history data
        this.shapeStore.upserted$.pipe(
            takeUntil(this.destroy$),
            filter(changes => !!changes?.updates?.length),
            map(changes => changes?.updates?.find(c => c.id === this.shape.id)),
            filter(shape => !!shape)
        ).subscribe(async (shape: Shape$v1) => {
            if (shape?.id === this.shape.id) {
                await this.requestHistoryAsync(2);
            }
        });

        // Add triggers to refresh time pipe
        this.eventSrv.minuteTick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });
    }

    /** On destory lifecycle hook */
    ngOnDestroy() {
        this.historySrv.remove(this.shape.id, this.contextId);
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Opens history dialog */
    openHistoryDialog() {
        this.dialog.open(HistoryDialogComponent, {
            height: '600px',
            width: '500px',
            data: {
                contextId: this.contextId,
                shapeId: this.shape?.id
            } as HistoryDialogData
        });
    }

    /** Gets a specified amount of history items */
    private async requestHistoryAsync(pageSize: number): Promise<void> {
        const descriptor = new Descriptor$v1({
            id: this.shape.id,
            pageSize: pageSize
        });

        const history: ChangeRecord$v1[] = await this.dataSrv.timeline$(
            [descriptor],
            this.shape.tenantId
        ).toPromise().then((group: Map<string, ChangeRecord$v1[]>) => {
            return group.get(descriptor.id);
        });

        this.historySrv.concatenate(this.shape.id, history, this.contextId);
    }

    /** Sets up listener for history */
    private setupHistoryListener(): void {
        this.historySrv.get$(this.shape.id, this.contextId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((history: ChangeRecord$v1[]) => {
                this.shapeHistory = this.sortHistory(history).slice(0, 2);
            });

        this.shapesLoading = false;
    }

    /** Sorts history by date */
    private sortHistory(history: ChangeRecord$v1[]): ChangeRecord$v1[] {
        return history.sort((a, b) => {
            return b.timestampDate.getTime() - a.timestampDate.getTime();
        });
    }
}
