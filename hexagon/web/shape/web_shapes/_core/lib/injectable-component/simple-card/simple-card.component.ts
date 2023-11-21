import { Component, Inject } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, RestrictIds$v1, Shape$v1 } from '@galileo/web_shapes/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ShapeStoreService } from '../../shape-store.service';

@Component({
    templateUrl: 'simple-card.component.html',
    styleUrls: ['simple-card.component.scss']
})
export class SimpleCardInjectableComponent {

    /** Sahpe data */
    shape$: Observable<Shape$v1> = this.shapeStore.entity$.pipe(
        map((shapes: Shape$v1[]) => {
            return shapes.find(x => x.id === this.id);
        })
    );

    /** Expose restrict ids to HTML */
    restrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

    constructor(@Inject(LAYOUT_MANAGER_SETTINGS) private id: string,
                private shapeStore: ShapeStoreService) { }
}
