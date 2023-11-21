import { Injectable, Injector } from '@angular/core';
import { DataSelectionService$v1, EntityAssociatedData$v1 } from '@galileo/web_commonassociation/adapter';
import { capabilityId, Shape$v1, InjectableComponentNames } from '@galileo/web_shapes/_common';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ShapeStoreService } from './shape-store.service';

@Injectable()
export class DataAssociationSelectionService extends DataSelectionService$v1 {

  /** Id of the current capability */
  capabilityId = capabilityId;

  /** URL to the icon to show for the capability */
  readonly capabilityIconUrl = 'assets/shapes/images/channel-icon.svg';

  /** Token to use for the name of the capability */
  nameToken = 'shape-core.capability.nameSmartShapes';

  /** Name of component to inject into the selection list */
  dataAssociationItemComponentName = InjectableComponentNames.simpleCardComponent;

  constructor(
    injector: Injector,
    private store: ShapeStoreService
  ) {
    super(injector);
  }
  /**
   * Get a list of associated data ids that are to be shown in the selection list
   */
  getDataAssociationIDs$(searchString$: Observable<string>): Observable<EntityAssociatedData$v1[]> {
    return combineLatest([
      this.store.entity$,
      searchString$
    ]).pipe(map(([shapes, searchString]) => {
      const data: EntityAssociatedData$v1[] = [];

      // Filter items by search string
      if (searchString) {
        shapes = shapes.filter((shape: Shape$v1) => {
          return shape.name.toLocaleLowerCase().includes(searchString?.toLocaleLowerCase());
        });
      }

      // Build list of tenant ids
      let tenantIds: string[] = shapes.map(shape => shape.tenantId);
      tenantIds = [...new Set(tenantIds)];
      tenantIds.forEach((id: string) => {
        data.push(new EntityAssociatedData$v1({
          tenantId: id,
          entityIds: shapes.filter(shape => shape.tenantId === id).map(shape => shape.id)
        }));
      });

      return data;
    }));
  }
}

