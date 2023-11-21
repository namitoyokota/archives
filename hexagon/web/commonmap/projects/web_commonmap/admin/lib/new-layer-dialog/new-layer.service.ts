import { Injectable } from '@angular/core';
import { NewLayerDialogComponent } from './new-layer-dialog.component';
import { MapLayer$v1 } from '@galileo/web_commonmap/_common';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class NewLayerService {

    constructor(public dialog: MatDialog) { }

    createNewLayer(): Promise<MapLayer$v1> {
        return new Promise<MapLayer$v1>(resolve => {
            const dialogRef = this.dialog.open(NewLayerDialogComponent, {
                disableClose: true
            });
            dialogRef.afterClosed().subscribe((mapLayer) => {
                resolve(mapLayer);
            });
        });
    }
}
