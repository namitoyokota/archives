import { Injectable } from '@angular/core';
import { StoreService } from '@galileo/web_common-libraries';
import { Shape$v1 } from '@galileo/web_shapes/_common';

/**
 * Store for all the shapes in the system
 */
@Injectable({
  providedIn: 'root'
})
export class ShapeStoreService extends StoreService<Shape$v1> {
  constructor() {
    super('id', Shape$v1);
  }
}
