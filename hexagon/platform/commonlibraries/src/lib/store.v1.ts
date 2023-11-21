import { BehaviorSubject, Observable, Subject } from 'rxjs';

/**
 * Is the upsert an update and an insert
 */
export enum UpsertType {
  inserts = 'inserts',
  updates = 'updates',
}

/**
 * Used to store entity data. This store does not track edit state.
 * This store is a good option if the data will only be changed by the calls to a
 * data service and not through the UI. If state is needed, for undo, see StatefulStore.
 */
export class Store$v1<T> {
  /** Bus for entity list */
  protected entity = new BehaviorSubject<T[]>([]);

  /** Bus for deleted event */
  private removed = new Subject<string>();

  /** Bus for upserts */
  private upserted = new Subject<Record<UpsertType, T[]>>();

  /** Observable that emits when an upsert happens */
  readonly upserted$: Observable<Record<UpsertType, T[]>> =
    this.upserted.asObservable();

  /** Observable that emits when the list  changes */
  readonly entity$ = this.entity.asObservable();

  /** Event that is raised when an entity is removed */
  readonly removed$: Observable<string> = this.removed.asObservable();

  private sourceKey: string;
  private factory: new (arg: T) => T;

  constructor(sourceKey: string, sourceType: new (arg: T) => T) {
    this.sourceKey = sourceKey;
    this.factory = sourceType;
  }

  /**
   * Returns entity by id. This data is a snapshot in time and won't be updated
   * @param id Entity id
   */
  snapshot(id: string) {
    return this.entity.getValue().find((i) => i[this.sourceKey] === id);
  }

  /**
   * Clears the store
   */
  clear(): void {
    this.entity.next([]);
  }

  /**
   * Updates an entity in the store. If the entity is not in the store
   * it will be added.
   * @param entity The updated entity
   */
  upsert(entities: T | T[]): void {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }

    // List of inserts
    let inserts: T[] = [];
    let updates: T[] = [];

    let list = this.entity.getValue();
    for (const entity of entities) {
      const found = !!list.find(
        (i) => i[this.sourceKey] === entity[this.sourceKey]
      );

      if (!found) {
        list = [...list, new this.factory(entity)];
        inserts = [...inserts, new this.factory(entity)];
      } else {
        list = list.map((item) => {
          if (item[this.sourceKey] === entity[this.sourceKey]) {
            // Looks to see if there is already an update and if so just update it
            const foundUpdate = updates.find(
              (u) => u[this.sourceKey] === item[this.sourceKey]
            );
            if (!foundUpdate) {
              updates = [...updates, new this.factory(entity)];
            } else {
              updates = updates.map((u) => {
                if (u[this.sourceKey] === item[this.sourceKey]) {
                  u = new this.factory(entity);
                }

                return u;
              });
            }

            return new this.factory(entity);
          }
          return item;
        });
      }
    }

    // Update store
    this.entity.next([...list]);

    // Fire any updates or inserts
    if (inserts.length || updates.length) {
      const record = {} as Record<UpsertType, T[]>;
      record.inserts = inserts;
      record.updates = updates;

      this.upserted.next(record);
    }
  }

  /**
   * Removes an unit from the store
   * @param id Unit id of the item to remove
   */
  remove(id: string): void {
    this.entity.next(
      this.entity.getValue().filter((item) => {
        return item[this.sourceKey] !== id;
      })
    );

    this.removed.next(id);
  }
}
