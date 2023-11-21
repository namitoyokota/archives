import { Component, Inject, OnInit } from '@angular/core';
import { LAYOUT_MANAGER_SETTINGS, Shape$v1 } from '@galileo/web_shapes/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ShapeStoreService } from '../../shape-store.service';

@Component({
    templateUrl: 'icon.component.html',
    styleUrls: ['icon.component.scss']
})
export class IconInjectableComponent implements OnInit {

    /** Shape data */
    shape$: Observable<Shape$v1>;

    constructor(
        @Inject(LAYOUT_MANAGER_SETTINGS) private shapeId: string,
        private shapeStore: ShapeStoreService
    ) { }

    /** On init lifecycle hook */
    ngOnInit() {
        this.shape$ = this.shapeStore.entity$.pipe(
            map(shapes => {
                return shapes.find(x => x.id === this.shapeId);
            })
        );
    }
}
