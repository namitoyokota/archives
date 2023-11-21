import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonErrorDialogComponent, DescriptorList$v1, Person$v1 } from '@galileo/web_common-libraries';
import { Colors } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { CommonfeatureflagsAdapterService$v1 } from '@galileo/web_commonfeatureflags/adapter';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { LayoutCompilerAdapterService } from '@galileo/web_commonlayoutmanager/adapter';
import { FeatureFlags, Geometry$v1 } from '@galileo/web_commonmap/adapter';
import {
  capabilityId,
  CommonMailboxService,
  RestrictIds$v1,
  Shape$v1,
  ShapeChangeNotification$v1,
  ShapeChangeReason$v1,
  ShapeFillType$v1,
  ShapeFilter$v1,
  ShapeGraphicsSettings$v1,
  ShapeType,
} from '@galileo/web_shapes/_common';
import { BehaviorSubject, merge } from 'rxjs';
import { filter, first, shareReplay } from 'rxjs/operators';

import { ActionStoreService } from './action-store.service';
import { DataService } from './data.service';
import { DebounceDataService } from './debounce-data.service';
import { EventService } from './event.service';
import { NotificationService } from './notification.service';
import { ShapeStoreService } from './shape-store.service';
import { CreateEditComponent } from './shared/create-edit-dialog/create-edit-dialog.component';
import { TombstonedService } from './tombstoned.service';

@Injectable()
/**
 * Core processing of shapes. Listens to notifications, updates the
 * stores and triggers events.
 */
export class CoreService {

  /** Flag that is set to true when the initial load of data is complete */
  private dataLoaded = new BehaviorSubject<boolean>(false);

  dataLoaded$ = this.dataLoaded.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private mailbox: CommonMailboxService,
    private eventSrv: EventService,
    private actionSrv: ActionStoreService,
    private shapeStore: ShapeStoreService,
    private notificationSrv: NotificationService,
    private dataSrv: DataService,
    private layoutAdapter: LayoutCompilerAdapterService,
    private debounceData: DebounceDataService,
    private tombstonedSrv: TombstonedService,
    private dialog: MatDialog,
    private ffAdapter: CommonfeatureflagsAdapterService$v1,
    private identityAdapter: CommonidentityAdapterService$v1
  ) {
    this.initListeners();
    this.initPostOffice();
    this.layoutAdapter.coreIsLoadedAsync(capabilityId);
  }

  /**
   * Listen to all messages in the mailbox service
   */
  private initPostOffice(): void {
    this.mailbox.mailbox$v1.coreIsLoaded$.next(true);
  }

  /**
   * Listen for notifications and trigger events off of them
   */
  async initListeners() {
    this.listenConnectionEstablished();
    this.listenUpdateCreate();
    this.listenDelete();
    this.listenDataRequest();
    this.listenStartCreateShape();
    this.listenUseAsFilter();
  }

  /**
   * Listens to the connection established event on the notification service
   */
  private listenConnectionEstablished(): void {
    this.notificationSrv.connectionEstablished$.pipe(
      filter(connected => !!connected)
    ).subscribe(() => {
      this.dataLoaded.next(false);

      // Clear out shape store
      this.shapeStore.clear();

      // Get shape list
      this.dataSrv.get$().pipe(
        filter(shapes => !!shapes?.length)
      ).subscribe(
        // Process data as it streams in
        (shapes: Shape$v1[]) => {
          // Filter out Line shapes if feature flag is off
          const lineFF = this.ffAdapter.isActive(FeatureFlags.Line);
          if (!lineFF) {
            shapes = shapes.filter(shape => shape.shapeType !== ShapeType.line);
          }

          this.shapeStore.upsert(shapes);
        },
        // Error getting data
        (err) => {
          console.error('HxgnConnect:: Shapes: An unexpected error occurred getting shape data', err);
        },
        // On all data loading complete
        async () => {
          this.dataLoaded.next(true);
          await this.tombstonedSrv.reconcileLocksAsync();
          // Start process of any notifications in the queue
          this.shapeStore.entity$.pipe(
            first()
          ).subscribe(shapes => {
            this.notificationSrv.processNotificationQueue(shapes);
          });
        }
      );

    });
  }

  /**
   * Listen to request to load data from the rest API
   */
  private listenDataRequest(): void {
    this.debounceData.debounced$.subscribe(async (notifications: ShapeChangeNotification$v1[]) => {

      // Filter out dup or old notifications
      let cleanList: ShapeChangeNotification$v1[] = [];
      notifications.forEach(n => {
        const item = cleanList.find(i => i.id === n.id);
        if (!!item) {
          // Update
          cleanList = cleanList.map(i => {
            if (i.id === item.id) {
              i.systemCorrelationId = i.systemCorrelationId > item.systemCorrelationId ?
                i.systemCorrelationId : item.systemCorrelationId;
            }
            return i;
          });
        } else {
          cleanList = [...cleanList, n];
        }
      });

      // Create descriptors needed to get updated data
      const descriptorList: DescriptorList$v1[] = [];
      cleanList.forEach(n => {
        const found = this.shapeStore.snapshot(n.id);

        if (!found || (found && !this.isUpdateNotificationRedacted(n, found))) {
          descriptorList.push({
            id: n.id,
            tenantId: n.tenantId,
            systemCorrelationId: n.systemCorrelationId
          } as DescriptorList$v1);
        }
      });

      const shapes = await this.dataSrv.get$(descriptorList).toPromise();

      if (shapes) {
        this.shapeStore.upsert(shapes);
      }
    });
  }

  /**
   * Listens to shape creates and updates from the notification service
   */
  private listenUpdateCreate(): void {
    merge(
      this.notificationSrv.created$,
      this.notificationSrv.updated$
    ).subscribe(async (notification: ShapeChangeNotification$v1) => {

      if (this.isDataLoaded(notification)) {
        this.debounceData.debounce(notification);
      }
    });
  }

  /**
   * Listens to shape deletes
   */
  private listenDelete(): void {
    this.notificationSrv.deleted$.subscribe(async notification => {
      if (this.isDataLoaded(notification)) {
        // If locked then update
        if (this.tombstonedSrv.isLocked(notification.id)) {
          const entity: Shape$v1 = await this.dataSrv.get$([
            {
              id: notification.id,
              tenantId: notification.tenantId,
              systemCorrelationId: notification.systemCorrelationId
            } as DescriptorList$v1
          ]).toPromise().then(shapes => {
            if (shapes.length) {
              return shapes[0];
            } else {
              return null;
            }
          });
          // Its possible the backend did not tombstone.  If not, then check to see if item
          // is in the store and if so set the tombstone flag so that it will be removed when the lock is released
          if (entity) {
            this.shapeStore.upsert(entity);
          } else {
            const foundShape = this.shapeStore.snapshot(notification.id);
            if (foundShape) {
              foundShape.tombstoned = true;
              this.shapeStore.upsert(foundShape);
            }
          }
        } else {
          this.shapeStore.remove(notification.id);
        }
      }

    });
  }

  /**
   * Listens to request to use a geometry as a filter;
   */
  private listenUseAsFilter(): void {
    this.mailbox.mailbox$v1.useAsShapeFilter$.subscribe((mailBox) => {
      const [geometry, contextId] = mailBox.payload;

      if (!geometry || !contextId) {
        mailBox.response.error('Geometry and contextId cannot be null or undefined');
      } else {
        this.actionSrv.shapeFilter(contextId, {
          ...geometry,
          originId: contextId
        } as ShapeFilter$v1)

        mailBox.response.next();
      }
    });
  }

  /**
   * Listens to request to start create smart shape
   */
  private listenStartCreateShape(): void {
    this.mailbox.mailbox$v1.startCreateSmartShape$.subscribe(async (mailBox) => {
      const geometry = mailBox.payload;
      let shape: Shape$v1;

      if (geometry) {
        const user = await this.identityAdapter.getUserInfoAsync();
        shape = new Shape$v1({
          filteringType: null,
          description: null,
          keywords: [],
          properties: null,
          hyperlinks: [],
          shapeType: ShapeType.polygon,
          primaryContact: new Person$v1({
            firstName: user.givenName,
            lastName: user.familyName,
            title: user.title,
            email: user.email,
            phone: user.phone
          } as Person$v1),
          graphicsSettings: new ShapeGraphicsSettings$v1(
            {
              fillColor: Colors.blue + '3d',
              fillPattern: null,
              fillType: ShapeFillType$v1.solid,
              lineColor: Colors.blue,
              lineType: LineType$v1.solid,
              lineWeight: 3
            }
          )
        } as Shape$v1).fromGeometry$v1(geometry);
      }

      // Show dialog to create a smart shape
      this.dialog.open(CreateEditComponent, {
        height: '90%',
        width: '90%',
        data: shape,
        disableClose: true
      }).afterClosed().subscribe(shape => {
        if (shape) {
          this.dataSrv.create$(shape).toPromise()
            .then((newShape) => {
              mailBox.response.next(new Shape$v1(newShape));
            })
            .catch(err => {
              this.dialog.open(CommonErrorDialogComponent, {
                data: {
                  message: JSON.parse(err?.errors[0])?.errors[0]
                }
              }).afterClosed().subscribe(() => {
                mailBox.response.error(null);
              });
            });
        }
      });
    });
  }

  /**
   * Will queue the notification if the data is not loaded.
   * @param notification The notification that should be queued if data is not loaded
   */
  private isDataLoaded(notification: ShapeChangeNotification$v1): boolean {
    if (!this.dataLoaded.getValue()) {
      this.notificationSrv.addToNotificationQueue(notification);
      return false;
    }

    return true;
  }

  /**
     * Returns true if the notification is for a property that is redacted
     */
  private isUpdateNotificationRedacted(notification: ShapeChangeNotification$v1, shape: Shape$v1): boolean {
    switch (notification.reason) {
      case ShapeChangeReason$v1.filteringType:
        return shape.isRedacted(RestrictIds$v1.filteringType);
      case ShapeChangeReason$v1.description:
        return shape.isRedacted(RestrictIds$v1.description);
      case ShapeChangeReason$v1.keywords:
        return shape.isRedacted(RestrictIds$v1.keywords);
      case ShapeChangeReason$v1.primaryContact:
        return shape.isRedacted(RestrictIds$v1.properties);
      default:
        return false;
    }
  }
}
