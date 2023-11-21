import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Person$v1 } from '@galileo/web_common-libraries';
import { Colors } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { CommonidentityAdapterService$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { Shape$v1, ShapeFillType$v1, ShapeGraphicsSettings$v1 } from '@galileo/web_shapes/_common';
import { LicenseService } from '@galileo/web_shapes/_core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { ShapeListTranslatedTokens, ShapeListTranslationTokens } from './shape-list.translation';

@Component({
  selector: 'hxgn-shapes-list',
  templateUrl: 'shape-list.component.html',
  styleUrls: ['shape-list.component.scss']
})

export class ShapeListComponent implements OnInit, OnDestroy {

  /** List of shapes to show */
  @Input('shapes')
  set setShapes(shapes) {
    this.shapes.next(shapes);
  }

  /** List of shapes that are dirty */
  @Input() dirtyShapeIds: string[] = [];

  /** Id of the shape that is currently active in the list */
  @Input() activeShapeId: string = null;

  /** Event the active shape changed */
  @Output() activeShape = new EventEmitter<Shape$v1>();

  /** Event that the shape should be deleted */
  @Output() deletedShape = new EventEmitter<string>();

  /** Event the id of the shape to reset */
  @Output() resetShape = new EventEmitter<string>();

  /** The current search string */
  searchString = '';

  /** Flag that is true when there is a license for shapes */
  isLicensed$ = this.licenseSrv.isLicensed$;

  private shapes = new BehaviorSubject<Shape$v1[]>([]);

  /** String used to search over the list of channels */
  private searchString$ = new BehaviorSubject<string>('');

  /** Sorted list of shapes */
  private shapesList$ = this.shapes.asObservable().pipe(
    map(shapes => {
      return shapes.sort((shapeA, shapeB) => {
        if (shapeA?.name < shapeB?.name) {
          return -1
        } else if (shapeA?.name > shapeB?.name) {
          return 1;
        } else {
          return 0;
        }
      });
    })
  );

  /** List of shapes to show */
  shapes$ = combineLatest([
    this.shapesList$,
    this.searchString$.asObservable().pipe(
      map(str => {
        return str?.toLocaleLowerCase();
      })
    )
  ]).pipe(
    map(([shapeList, searchString]) => {
      let filterShapes: Shape$v1[] = [...shapeList];

      if (searchString) {
        filterShapes = filterShapes.filter(shape => {
          return shape.name.toLocaleLowerCase().includes(searchString);
        });
      }
      return filterShapes;
    })
  );


  /** Expose ShapeListTranslationTokens to HTML */
  tokens: typeof ShapeListTranslationTokens = ShapeListTranslationTokens;

  /** Translated tokens */
  tTokens: ShapeListTranslatedTokens = {
    search: '',
    copy: '',
    missingData: ''
  } as ShapeListTranslatedTokens;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private identityAdapter: CommonidentityAdapterService$v1,
    private licenseSrv: LicenseService
  ) { }

  /**
   * On init lifecycle hook
   */
  ngOnInit(): void {
    this.initLocalizationAsync();

    this.localizationAdapter.adapterEvents.languageChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((lang) => {
      this.initLocalizationAsync();
    });
  }

  /** On destroy life cycle hook */
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Select shape in the list
   */
  selectShape(shape: Shape$v1): void {
    if (shape.id !== this.activeShapeId) {
      this.activeShape.emit(new Shape$v1(shape));
    }
  }

  /**
   * Start the creation of a new shape
   */
  startNewShape(): void {
    this.identityAdapter.getUserInfoAsync().then(user => {

      this.activeShape.emit(new Shape$v1({
        shapeType: null,
        coordinates: [],
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
      } as Shape$v1));
    });


  }

  /**
   * Clone the selected shape
   */
  cloneShape(): void {
    const foundShape = this.shapes.getValue().find(s => s.id === this.activeShapeId);
    const cloneShape = new Shape$v1({
      ...foundShape,
      name: foundShape.name + this.tTokens?.copy,
      isManaged: false,
      id: null
    } as Shape$v1);
    this.activeShape.emit(cloneShape);
  }

  /**
   * Delete a shape
   * @param id Shape id
   */
  deleteShape(id: string): void {
    this.deletedShape.emit(id);
  }

  /**
   * Search the list of shapes
   */
  search(): void {
    this.searchString$.next(this.searchString);
  }

  /**
   * Clears the search text
   */
  clearSearch(): void {
    this.searchString = '';
    this.search();
  }

  /**
   * Returns true if shape is dirty
   * @param id Shape id
   */
  isDirty(id: string): boolean {
    return this.dirtyShapeIds.some(shapeId => shapeId === id);
  }

  /**
   * Tracks an items in a ngFor loop
   */
  shapeTrackBy(index: number, shape: Shape$v1) {
    return shape.id;
  }

  /**
   * Discard changes made to the current shape
   */
  reset(id: string): void {
    this.resetShape.emit(id);
  }

  /**
   * Set up routine for localization
   */
  private async initLocalizationAsync(): Promise<void> {
    const tokens: string[] = Object.keys(ShapeListTranslationTokens).map(k => ShapeListTranslationTokens[k]);
    await this.localizationAdapter.localizeStringsAsync(tokens);
    const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);

    if (!this.tTokens) {
      this.tTokens = {} as ShapeListTranslatedTokens;
    }

    this.tTokens.search = translatedTokens[ShapeListTranslationTokens.search];
    this.tTokens.copy = translatedTokens[ShapeListTranslationTokens.copy];
    this.tTokens.missingData = translatedTokens[ShapeListTranslationTokens.missingData];
  }
}
