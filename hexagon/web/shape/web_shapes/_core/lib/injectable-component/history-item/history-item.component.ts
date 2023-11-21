import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, Shape$v1, ShapeHistoryItemSettings$v1 } from '@galileo/web_shapes/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ShapeStoreService } from '../../shape-store.service';

@Component({
    template: `
        <hxgn-shapes-history-item [operations]="historyItemSettings.operations" [concise]="historyItemSettings.concise">
        </hxgn-shapes-history-item>
    `,
    styles: [
        `:host {
            display: flex;
            width: 100%;
            height: 100%;
        }`
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryItemInjectableComponent {

    /** Current shape */
    shape$: Observable<Shape$v1>;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) public historyItemSettings: ShapeHistoryItemSettings$v1,
                private store: ShapeStoreService) {
        this.shape$ = this.store.entity$.pipe(
            map(incidents => incidents.find(i => i.id === this.historyItemSettings.shapeId))
        );
    }
}
