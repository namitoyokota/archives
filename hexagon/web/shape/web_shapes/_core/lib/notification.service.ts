import { Injectable } from '@angular/core';
import { CommonHttpClient, CommonHubManagerService, CommonNotificationHubService$v2, CommonWindowCommunicationService } from '@galileo/web_common-http';
import { capabilityId, Shape$v1, ShapeChangeNotification$v1, ShapeChangeReason$v1 } from '@galileo/web_shapes/_common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({providedIn: 'root'})
export class NotificationService extends CommonNotificationHubService$v2 {

  /** Bus for connection established event */
  private connectionEstablished: BehaviorSubject<boolean>;

  /** Bus for connection closed event*/
  private connectionClosed: Subject<void>;

  /** Shape deleted notification */
  private deleted: Subject<ShapeChangeNotification$v1>;

  /** Shape created notification */
  private created: Subject<ShapeChangeNotification$v1>;

  /** Shape updated notification */
  private updated: Subject<ShapeChangeNotification$v1>;

  /** Observable to the notification connection is established  */
  connectionEstablished$: Observable<boolean>;

  /** Observable to the notification connection is closed */
  connectionClosed$: Observable<void>;

  /** Shape has been deleted */
  deleted$: Observable<ShapeChangeNotification$v1>;

  /** New shape created created. */
  created$: Observable<ShapeChangeNotification$v1>;

  /** Shape has been updated updated */
  updated$: Observable<ShapeChangeNotification$v1>;

  /** Holds notifications that comes in while the initial data load is going on. */
  private notificationQueue: ShapeChangeNotification$v1[];

  constructor(
    commonWindowCommSrv: CommonWindowCommunicationService,
    httpSrv: CommonHttpClient,
    commonManager: CommonHubManagerService
  ) {
    super('api/shapes/hub/changeNotification/v1',
          false, capabilityId, commonWindowCommSrv, httpSrv, commonManager);
  }

  /**
   * On hub init lifecycle hook
   */
  onHubInit(): void {
    this.connectionEstablished = new BehaviorSubject(false);
    this.connectionClosed = new Subject<void>();
    this.deleted = new Subject<ShapeChangeNotification$v1>();
    this.created = new Subject<ShapeChangeNotification$v1>();
    this.updated = new Subject<ShapeChangeNotification$v1>();

    this.connectionEstablished$ = this.connectionEstablished.asObservable();
    this.connectionClosed$ = this.connectionClosed.asObservable();
    this.deleted$ = this.deleted.asObservable();
    this.created$ = this.created.asObservable();
    this.updated$ = this.updated.asObservable();

    this.notificationQueue = [];
  }

  /**
   * The event names the hub connects to
   * @returns List of event names
   */
  eventNames(): string[] {
    return ['changeNotification'];
  }

  /**
   * Fires when a notification event has occurred
   * @param eventName Name of event
   * @param notification Change notification
   */
  onEvent(eventName: string, notification: ShapeChangeNotification$v1) {
    if (eventName === 'changeNotification') {
      switch (notification.reason) {
        case ShapeChangeReason$v1.created:
          this.created.next(notification);
          break;
        case ShapeChangeReason$v1.deleted:
          this.deleted.next(notification);
          break;
        case ShapeChangeReason$v1.groupIds:
        case ShapeChangeReason$v1.name:
        case ShapeChangeReason$v1.description:
        case ShapeChangeReason$v1.primaryContact:
        case ShapeChangeReason$v1.radius:
        case ShapeChangeReason$v1.centerPoint:
        case ShapeChangeReason$v1.coordinates:
        case ShapeChangeReason$v1.graphicsSettings:
        case ShapeChangeReason$v1.filteringType:
        case ShapeChangeReason$v1.keywords:
        case ShapeChangeReason$v1.properties:
        case ShapeChangeReason$v1.hyperlink:
          this.updated.next(notification);
          break;
        default:
          console.error('Unknown shape change notification', notification);
      }
    } else {
      console.error('Unknown shape change notification', eventName, notification);
    }
  }

  /**
   * Connect established listener
   */
  onConnectionEstablished() {
    this.connectionEstablished.next(true);
  }

  /**
   * Connection closed listener
   */
  onConnectionClosed() {
    this.connectionClosed.next();
  }

  /**
   * Adds a notification to the notification queue
   * @param notification The notification to add to the queue
   */
  addToNotificationQueue(notification: ShapeChangeNotification$v1) {
    // Short circuit if the queue is empty
    if (!this.notificationQueue.length) {
        this.notificationQueue.push(notification);
        return;
    }

    // Check if there is a delete if there is throw out update
    const deleteNotification = this.notificationQueue
        .find(item => item.id === notification.id && item.reason === ShapeChangeReason$v1.deleted);

    if (deleteNotification) {
        return;
    }

    // If notifications is deleted purge all other notifications for this id
    if (notification.reason === ShapeChangeReason$v1.deleted) {
        this.notificationQueue = this.notificationQueue.filter(item => item.id !== notification.id);
    }

    // Make sure there that dup notifications are only added once
    const foundMatch = this.notificationQueue.find(item => item.id === notification.id && item.reason === notification.reason);
    if (foundMatch) {
        return;
    }

    const foundNotificationCreateIndex = this.notificationQueue.findIndex(item => item.id === notification.id);
    if (foundNotificationCreateIndex !== -1) {
        // Remove create
        this.notificationQueue.splice(foundNotificationCreateIndex, 1);
    }

    // Add to the queue
    this.notificationQueue.push(notification);
  }

  /**
   * Filters out dup notifications for a single shape.
   * Checks to make sure the notification type has not changed.
   * If an add notification comes in but it exists to the list then it should be changed to an update.
   */
  processNotificationQueue(shapes: Shape$v1[]) {
    while (this.notificationQueue.length) {
      const notification: ShapeChangeNotification$v1 = this.notificationQueue.shift();

      // Make sure the create is still needed
      if (notification.reason === ShapeChangeReason$v1.created &&
          shapes.find(item => item.id === notification.id)) {
          // This shape is already in the list, we already have the newest data
          continue;
      }

      // Fire the event
      switch (notification.reason) {
          case ShapeChangeReason$v1.created:
              this.created.next(notification);
              break;
          case ShapeChangeReason$v1.deleted:
              this.deleted.next(notification);
              break;
          default:
              this.updated.next(notification);
      }
     }
  }
}
