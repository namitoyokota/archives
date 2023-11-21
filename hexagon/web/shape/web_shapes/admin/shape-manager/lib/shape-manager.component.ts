import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import {
  CommonConfirmDialogComponent,
  CommonErrorDialogComponent,
  DirtyComponent$v1,
  Guid,
} from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { Shape$v1, TranslationGroup } from '@galileo/web_shapes/_common';
import { CoreService, DataService, ShapeStoreService } from '@galileo/web_shapes/_core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { filter, first, map, takeUntil } from 'rxjs/operators';

import { ShapeManagerStoreService } from './shape-manager-store.service';
import { ShapeManagerTranslatedTokens, ShapeManagerTranslationTokens } from './shape-manager.translation';

@Component({
  templateUrl: 'shape-manager.component.html',
  styleUrls: ['shape-manager.component.scss']
})

export class ShapeManagerComponent implements OnInit, DirtyComponent$v1, OnDestroy {

  /** The current active tenant */
  private activeTenant = new BehaviorSubject<Tenant$v1>(null);

  /** The current active tenant */
  readonly activeTenant$ = this.activeTenant.asObservable();

  /** List of shapes to show */
  shapes$ = combineLatest([
    this.shapeManagerStore.entity$,
    this.activeTenant$
  ]).pipe(
    map(([shapes, activeTenant]) => {
      return shapes.filter(shape => shape.tenantId === activeTenant?.id);
    })
  );

  /** Id of the shape currently active to edit */
  private readonly activeShapeId = new BehaviorSubject<string>(null);

  /** The shape currently active to edit */
  activeShape$ = combineLatest([
    this.shapeManagerStore.entity$,
    this.activeShapeId.asObservable()
  ]).pipe(
    map(([shapes, activeId]) => {
      const foundShape = shapes.find(s => s.id === activeId);
      if (foundShape) {
        return new Shape$v1(foundShape);
      }

      return null;
    })
  )

  /** True if there is unsaved data */
  isDirty$ = this.shapeManagerStore.isDirty$;

  /** True if there are unsaved changes and they are valid */
  disabledSave$ = combineLatest([
    this.shapeManagerStore.updates$,
    this.shapeManagerStore.inserts$
  ]).pipe(
    map(([updates, inserts]) => {
      // Return true if the updates and inserts are valid
      const changes = [...updates, ...inserts];

      for (const change of changes) {
        if (!change.isValid()) {
          return true;
        }
      }

      return false;
    })
  );

  /** List of shape Ids that are dirty */
  isDirtyIds$ = combineLatest([
    this.shapeManagerStore.updates$,
    this.shapeManagerStore.inserts$
  ]).pipe(
    map(([updates, inserts]) => {
      // Return true if the updates and inserts are valid
      const changes = [...updates, ...inserts];
      return changes.map(shape => shape.id);
    })
  );

  /** A flag that is true if the active shape is dirty */
  isActiveShapeDirty$ = combineLatest([
    this.isDirtyIds$,
    this.activeShape$
  ]).pipe(
    map(([ids, shape]) => {
      return ids.some(id => id === shape?.id);
    })
  )

  /** Expose ShapeManagerTranslationTokens to HTML */
  tokens: typeof ShapeManagerTranslationTokens = ShapeManagerTranslationTokens;

  /** Translated tokens */
  tTokens: ShapeManagerTranslatedTokens = {
    smartShapes: ''
  } as ShapeManagerTranslatedTokens;

  /** Flag that is true when data is loading */
  isLoading = true;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private tenantAdapter: CommontenantAdapterService$v1,
    private identityAdapter: CommonidentityAdapterService$v1,
    private titleSrv: Title,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private coreSrv: CoreService,
    private shapeStore: ShapeStoreService,
    private shapeManagerStore: ShapeManagerStoreService,
    private dataSrv: DataService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {

    // Setup data for shape manager
    // Data needs to come from the core shape store after
    // the data is done loading in
    this.coreSrv.dataLoaded$.pipe(
      filter(isLoaded => !!isLoaded),
      first()
    ).subscribe(() => {
      this.isLoading = true;
      this.shapeStore.entity$.pipe(first()).subscribe(shapes => {
        this.shapeManagerStore.clear();
        this.shapeManagerStore.setSource(shapes);
        this.isLoading = false;

        this.cdr.markForCheck();
        this.cdr.detectChanges();
      });

    });

    this.intLocalization();
  }

  /**
   * On init lifecycle hook
   */
  async ngOnInit(): Promise<void> {
    const userInfo = await this.identityAdapter.getUserInfoAsync();

    const activeTenant = await this.tenantAdapter.getUserTenantsAsync().then(tenants => {
      return tenants.find(tenant => tenant.id === userInfo.activeTenant);
    });

    this.activeTenant.next(activeTenant);

    this.localizationAdapter.adapterEvents.languageChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.intLocalization();
    });
  }

  /** On destroy life cycle hook */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Start editing a shape
   */
  startEditShape(shape: Shape$v1): void {
    // If shape is new add it to the store
    if (!shape.id) {
      // Create a temp ID to track the new shape until its saved
      shape = new Shape$v1({ ...shape, id: Guid.NewGuid() } as Shape$v1);
      this.shapeManagerStore.upsert(shape);
    }

    this.activeShapeId.next(shape.id);
  }

  /**
   * Shape that has been updated
   * @param shape New state of the shape
   */
  shapeUpdated(shape: Shape$v1): void {
    this.shapeManagerStore.upsert(new Shape$v1(shape));

    // Make sure change detection runs right away
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  /**
   * Shape has been marked for deletion
   * @param id Shape id
   */
  shapeDeleted(id: string): void {
    this.shapeManagerStore.remove(id);

    if (this.activeShapeId.getValue() === id) {
      this.activeShapeId.next(null);
    }

    // Make sure change detection runs right away
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  /**
   * Save any unsaved changes
   */
  saveChangesAsync(): Promise<void> {
    return new Promise<void>(async resolve => {
      this.isLoading = true;
      // Save all the updates
      const updates = await this.shapeManagerStore.updates$.pipe(first()).toPromise();
      if (updates?.length) {
        // TODO - May need bulk REST API call for update
        for (const update of updates) {
          this.dataSrv.update$(update).toPromise()
            .then(response => {
              // Update the store
              this.shapeManagerStore.upsert(response);
              this.shapeManagerStore.commit([response.id]);
            })
            .catch(err => {
              this.dialog.open(CommonErrorDialogComponent, {
                data: {
                  message: JSON.parse(err?.errors[0])?.errors[0]
                }
              });
            });
        }
      }

      // Save all inserts
      const inserts = await this.shapeManagerStore.inserts$.pipe(first()).toPromise();
      if (inserts?.length) {
        // TODO - May need bulk REST API call for insert
        for (const insert of inserts) {
          const tempId = insert.id;

          this.dataSrv.create$({ ...insert, id: null } as Shape$v1).toPromise()
            .then(response => {
              if (tempId === this.activeShapeId.getValue()) {
                this.activeShapeId.next(response.id);
              }

              // Update the store
              this.shapeManagerStore.remove(tempId);
              this.shapeManagerStore.upsert(response);
              this.shapeManagerStore.commit([response.id, tempId]);
            })
            .catch(err => {
              this.dialog.open(CommonErrorDialogComponent, {
                data: {
                  message: JSON.parse(err?.errors[0])?.errors[0]
                }
              });
            });
        }
      }

      // Save all deletes
      const removes = await this.shapeManagerStore.removes$.pipe(first()).toPromise();
      if (removes?.length) {
        for (const remove of removes) {
          await this.dataSrv.delete$(remove.id);

          // Update store
          this.shapeManagerStore.commit([remove.id]);
        }
      }
      this.isLoading = false;
      resolve();
    });

  }

  /**
   * Discard some changes
   */
  async discardSomeChanges(shapeId: string): Promise<void> {
    this.shapeManagerStore.discardChanges(shapeId);

    // Check if the shape is still in the list
    const isFound = (await this.shapes$.pipe(first()).toPromise())?.some(shape => shape?.id === this.activeShapeId.getValue());
    if (!isFound) {
      this.activeShapeId.next(null);
    }
  }

  /**
   * Discard any unsaved changes
   */
  async discardChanges(): Promise<void> {
    const shapeCount = (await this.isDirtyIds$.pipe(first()).toPromise())?.length;
    this.dialog.open(CommonConfirmDialogComponent, {
      data: {
        titleToken: this.tokens.confirmDiscardingChanges,
        msgToken: this.tokens.discardShapeChanges,
        msgInterpolateParams: shapeCount > 1 ? [{
          '{{shapeCount}}': shapeCount.toString()
        }] : []
      }
    }).afterClosed().subscribe(async confirmed => {
      if (confirmed) {
        this.shapeManagerStore.discardChanges();

        // Check if the shape is still in the list
        const isFound = (await this.shapes$.pipe(first()).toPromise())?.some(shape => shape?.id === this.activeShapeId.getValue());
        if (!isFound) {
          this.activeShapeId.next(null);
        }

        // Make sure change detection runs right away
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Sets up all the needed localization
   */
  private async intLocalization(): Promise<void> {
    await this.localizationAdapter.localizeGroup([
      TranslationGroup.smartShapeManager,
      TranslationGroup.core
    ]);

    this.titleSrv.setTitle('HxGN Connect');
    await this.localizationAdapter.localizeStringAsync(ShapeManagerTranslationTokens.smartShapeManager);
    const title = await this.localizationAdapter.getTranslationAsync(ShapeManagerTranslationTokens.smartShapeManager);
    this.titleSrv.setTitle(`HxGN Connect - ${title}`);

    this.tTokens.smartShapes = await this.localizationAdapter.getTranslationAsync(ShapeManagerTranslationTokens.smartShapes);
    this.tTokens.discardShapeChanges = await this.localizationAdapter.getTranslationAsync(ShapeManagerTranslationTokens.discardShapeChanges);
    this.tTokens.deleteShape = await this.localizationAdapter.getTranslationAsync(ShapeManagerTranslationTokens.deleteShape);
    this.tTokens.confirmDeleteShape = await this.localizationAdapter.getTranslationAsync(ShapeManagerTranslationTokens.confirmDeleteShape);
  }
}
