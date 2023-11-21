import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  ChangeOperator$v1,
  ChangeRecord$v1,
  Descriptor$v1,
  EntityHistoryStoreService$v1,
} from '@galileo/web_common-libraries';
import { Shape$v1 } from '@galileo/web_shapes/_common';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { DataService } from '../../../../data.service';
import { EventService } from '../../../../event.service';
import { ShapeStoreService } from '../../../../shape-store.service';
import { TranslationTokens } from './history-dialog.translation';

export interface HistoryDialogData {
    /** Id of incident */
    shapeId: string;

    /** Context id to use for history service */
    contextId: string;
}

@Component({
    templateUrl: 'history-dialog.component.html',
    styleUrls: ['history-dialog.component.scss']
})
export class HistoryDialogComponent implements OnInit, OnDestroy {

    /** The shape to show history for */
    shape: Shape$v1;

    /** History objects associated with this shape. */
    shapeHistory: ChangeRecord$v1[] = [];

    /** Tracks shapes loading status */
    shapesLoading = true;

    /** Flag used to disable load of infinite scroll once last element has been loaded. */
    disableLoad = false;

    /** Flag used to refresh the time since pipe */
    refreshToggle = true;

    /** The min height an item can be. */
    readonly itemMinHeight = 49;

    /** Page size to request timeline */
    readonly pageSize = 100;

    /** Expose translation tokens to html. */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** History store for this shape */
    private shapeHistoryStore: ChangeRecord$v1[] = [];

    /** Context id to use for history service */
    private contextId: string;

    /**  Observable for component destroyed */
    private destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: HistoryDialogData,
        private shapeStore: ShapeStoreService,
        private dataSrv: DataService,
        private dialogRef: MatDialogRef<HistoryDialogComponent>,
        private eventSrv: EventService,
        private historySrv: EntityHistoryStoreService$v1
    ) { }

    /** On init lifecycle hook */
    async ngOnInit() {
        this.shape = this.shapeStore.snapshot(this.data.shapeId);
        this.contextId = this.data.contextId + '-dialog';

        // Set up listener to history store
        this.historySrv.get$(this.shape.id, this.contextId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((shapeHistory: ChangeRecord$v1[]) => {
                this.shapeHistoryStore = this.sortHistory(shapeHistory);
                this.shapeHistory = this.shapeHistoryStore.slice(0, this.shapeHistory.length + 1);
            });

        /** Used to trigger timestamp pipe refresh */
        this.eventSrv.minuteTick$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.refreshToggle = !this.refreshToggle;
        });

        // Keep shape up to date
        this.shapeStore.entity$.pipe(
            takeUntil(this.destroy$),
            map((shapes: Shape$v1[]) => {
                return shapes.find(x => x.id === this.data.shapeId);
            })
        ).subscribe((shape: Shape$v1) => {
            this.shape = new Shape$v1(shape);
        });

        await this.getShapeHistoryAsync();
        this.shapeHistory = this.shapeHistoryStore.slice(0, 10);
    }

    /** On destroy lifecycle hook */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** Closes nested view. */
    close(): void {
        this.dialogRef.close();
    }

    /** Gets next page of shape history */
    async getShapeHistoryPageAsync(pageSize: number): Promise<void> {
        if (!this.shapesLoading) {
            this.checkLoadingDone();

            if (!this.disableLoad) {
                this.shapeHistory = this.shapeHistoryStore.slice(0, this.shapeHistory.length + pageSize);
                this.checkLoadingDone();
            }
        }
    }

    /** Check if history is finished loading */
    private checkLoadingDone() {
        const lastElement = this.shapeHistory[this.shapeHistory.length - 1];
        if (lastElement.operations.some(x => x.operator === ChangeOperator$v1.addition)) {
            this.disableLoad = true;
        }
    }

    /** Gets a specified amount of history items */
    private async getShapeHistoryAsync(): Promise<void> {
        const descriptor = new Descriptor$v1({
            id: this.shape.id,
            pageSize: this.pageSize
        });

        const shapeHistory: ChangeRecord$v1[] = await this.dataSrv.timeline$(
            [descriptor], 
            this.shape.tenantId
        ).toPromise().then(group => {
            return group.get(descriptor.id);
        });

        this.historySrv.concatenate(this.shape.id, shapeHistory, this.contextId);
        this.shapesLoading = false;
    }

    /** Sorts history by date */
    private sortHistory(history: ChangeRecord$v1[]): ChangeRecord$v1[] {
        return history.sort((a, b) => {
            return b.timestampDate.getTime() - a.timestampDate.getTime();
        });
    }
}
