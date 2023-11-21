import { Injectable } from '@angular/core';
import { StatefulStoreService } from '@galileo/web_common-libraries';
import { Shape$v1 } from '@galileo/web_shapes/_common';

/**
 * Store for all the shapes in the system
 */
@Injectable()
export class ShapeManagerStoreService extends StatefulStoreService<Shape$v1> {
  constructor() {
    super('id', Shape$v1);
  }

  /**
   * Returns true if the two given entities are equal
   */
  protected isEqual(source: Shape$v1, entity: Shape$v1): boolean {
    const strA = JSON.stringify(source);
    const strB = JSON.stringify(entity);

    return strA === strB;
  }
}
