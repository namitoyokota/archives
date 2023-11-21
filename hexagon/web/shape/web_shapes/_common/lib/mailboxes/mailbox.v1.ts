import { MailBox } from '@galileo/web_commonlayoutmanager/adapter';
import { Geometry$v1 } from '@galileo/web_commonmap/adapter';
import { BehaviorSubject, Subject } from 'rxjs';

import { ShapeFilter$v1 } from '../abstractions/shape-filter.v1';
import { Shape$v1 } from '../abstractions/shape.v1';

/**
 * Version 1 of the methods used by the adapter and the core to communicate.
 */
export class Mailbox$v1 {

  /** Event that a geometry should be used as a shape filter */
  useAsShapeFilter$ = new Subject<MailBox<[Geometry$v1, string], void>>();

  /** Event that the create smart shape UI should start */
  startCreateSmartShape$ = new Subject<MailBox<Geometry$v1, Shape$v1>>();

  /** Event that a call to listen to shape filter has been made */
  onShapeFilterAction$ = new Subject<MailBox<string, BehaviorSubject<ShapeFilter$v1>>>();

  /** Flag that is true when the core is loaded */
  coreIsLoaded$ = new BehaviorSubject<boolean>(false);
}
