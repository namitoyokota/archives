import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

/**
 * Used to store entity data. This store can track changes in state.
 * This should be used if changes to an items in the store can be changed by the UI.
 */
export abstract class StatefulStore$v1<T> {
  /** The source of truth. */
  private source = new BehaviorSubject<T[]>([]);

  /** Entity list */
  private entity = new BehaviorSubject<T[]>([]);

  /** Entity list. Is the current state. */
  readonly entity$ = this.entity
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  /** List of entities that have been updated */
  readonly updates$: Observable<T[]> = combineLatest([
    this.source.asObservable(),
    this.entity$,
  ]).pipe(
    map(([source, changes]) => {
      // Look for updates
      // Compare entity that is in the source to changes
      let updates: T[] = [];
      updates = changes.filter((u) => {
        const sourceItem = source.find(
          (s) => s[this.sourceKey] === u[this.sourceKey]
        );
        if (sourceItem) {
          return !this.isEqual(sourceItem, u);
        } else {
          return false;
        }
      });

      return updates;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** List of entities that have been added to the store */
  readonly inserts$: Observable<T[]> = combineLatest([
    this.source.asObservable(),
    this.entity$,
  ]).pipe(
    map(([source, changes]) => {
      // Return any entity that is not in the source
      let inserts: T[] = [];
      inserts = changes.filter((entity) => {
        // Return true if the entity is not in the source
        return !source.some(
          (i) => i[this.sourceKey] === entity[this.sourceKey]
        );
      });

      return inserts;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Entities that have been removed */
  readonly removes$: Observable<T[]> = combineLatest([
    this.source.asObservable(),
    this.entity$,
  ]).pipe(
    map(([source, changes]) => {
      // Return any entity that is in the source but not in changes
      let deletes: T[] = [];
      deletes = source.filter((entity) => {
        // Return true if the entity is no longer in source
        return !changes.some(
          (c) => c[this.sourceKey] === entity[this.sourceKey]
        );
      });

      return deletes;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /** Is true when there are unsaved changes */
  isDirty$ = combineLatest([this.updates$, this.inserts$, this.removes$]).pipe(
    map(([updates, inserts, deletes]) => {
      return !!updates?.length || !!inserts?.length || !!deletes?.length;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private sourceKey: string;
  private factory: new (arg: T) => T;

  constructor(sourceKey: string, sourceType: new (arg: T) => T) {
    this.sourceKey = sourceKey;
    this.factory = sourceType;
  }

  /**
   * Returns true if the two items passed in are equal
   * @param source The source item to compare
   * @param entity The item being compared to the source
   */
  protected abstract isEqual(source: T, entity: T): boolean;

  /**
   * Sets the source's value. This should always match the database. The values changed
   * will be synced to be a copy of the source.
   * @param entities The sharing criteria to set as the source
   */
  setSource(entities: T[]): void {
    // Set the source value
    this.source.next(entities.map((entity) => new this.factory(entity)));

    // Set the value changes value
    this.entity.next(entities.map((entity) => new this.factory(entity)));
  }

  /**
   * Commit given changes to source. For the given ids it takes the values found in values changes and
   * sets it on the source. If ids are not found in the values changed list then they will be removed from the source.
   */
  commit(ids: string[]): void {
    // Get list of items to upsert into the source
    const upsertList = this.entity
      .getValue()
      .filter((item) => !!ids.find((id) => id === item[this.sourceKey]));
    if (upsertList?.length) {
      this.upsertSource(upsertList);
    }

    // Deal with items that have been removed from value changes
    const currentIds = this.entity
      .getValue()
      .map((item) => item[this.sourceKey]);
    const removeList = ids.filter(
      (id) => !currentIds.some((cId) => cId === id)
    );

    if (removeList?.length) {
      this.removeSource(removeList);
    }
  }

  /**
   * Returns entity by id. This data is a snapshot in time and won't be updated
   * @param id Entity id
   */
  snapshot(id: string) {
    return this.entity.getValue().find((i) => i[this.sourceKey] === id);
  }

  /**
   * Discard any changes made to the store. Resets the values changes to
   * be the same as the source.
   */
  discardChanges(ids: string | string[] = null): void {
    if (ids) {
      if (!Array.isArray(ids)) {
        ids = [ids];
      }

      ids.forEach((id) => {
        const source = this.source
          .getValue()
          .find((item) => item[this.sourceKey] === id);

        // Delete if not in source
        if (!source) {
          this.remove(id);
        } else {
          this.upsert(new this.factory(source));
        }
      });
    } else {
      const source = this.source
        .getValue()
        .map((entity) => new this.factory(entity));
      this.entity.next(source);
    }
  }

  /**
   * Clears the store source and entity
   */
  clear(): void {
    this.source.next([]);
    this.entity.next([]);
  }

  /**
   * Updates an entity in the store. If the entity is not in the store
   * it will be added. This will not update the source, but will update the working value
   * of the entity.
   * @param entity The updated entity
   */
  upsert(entities: T | T[]): void {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }

    entities.forEach((entity) => {
      const found = this.entity
        .getValue()
        .some((i) => i[this.sourceKey] === entity[this.sourceKey]);
      if (!found) {
        // Insert
        this.entity.next([...this.entity.getValue(), new this.factory(entity)]);
      } else {
        // Update
        this.entity.next(
          this.entity.getValue().map((i) => {
            if (i[this.sourceKey] === entity[this.sourceKey]) {
              i = new this.factory(entity);
            }
            return i;
          })
        );
      }
    });
  }

  /**
   * Removes an unit from the store
   * @param id Unit id of the item to remove
   */
  remove(ids: string | string[]): void {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    this.entity.next(
      this.entity.getValue().filter((item) => {
        return !ids.includes(item[this.sourceKey]);
      })
    );
  }

  /**
   * Upserts data into the source. This should only be used if the source of truth has changed. It
   * will attempt to update the current value of the entity that has changed if that entity is
   * not dirty
   * @param entities THe updated entities
   */
  private upsertSource(source: T | T[]): void {
    if (!Array.isArray(source)) {
      source = [source];
    }

    source.forEach((entity) => {
      const found = this.source
        .getValue()
        .find((item) => item[this.sourceKey] === entity[this.sourceKey]);
      if (!found) {
        // Insert
        this.source.next([...this.source.getValue(), new this.factory(entity)]);
      } else {
        // Update
        this.source.next(
          this.source.getValue().map((item) => {
            if (item[this.sourceKey] === entity[this.sourceKey]) {
              item = new this.factory(entity);
            }
            return item;
          })
        );
      }
    });
  }

  /**
   * Removes and entity for the source. This will attempt to update the current value
   * of the entity that has ben removed if the entity is not dirty
   * @param id Entity id
   */
  private removeSource(ids: string | string[]): void {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }

    this.source.next(
      this.entity.getValue().filter((item) => {
        return !ids.includes(item[this.sourceKey]);
      })
    );
  }
}
