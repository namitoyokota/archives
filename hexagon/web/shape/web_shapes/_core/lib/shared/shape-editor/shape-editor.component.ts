import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Hyperlink$v1, Keycodes$v1, Person$v1 } from '@galileo/web_common-libraries';
import { UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { FeatureFlags, Shape$v1, ShapeGraphicsSettings$v1, ShapeType } from '@galileo/web_shapes/_common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ShapeEditorTranslatedTokens, ShapeEditorTranslationTokens } from './shape-editor.translation';

@Component({
  selector: 'hxgn-shapes-editor',
  templateUrl: 'shape-editor.component.html',
  styleUrls: ['shape-editor.component.scss']
})

export class ShapeEditorComponent implements OnInit, OnDestroy {

  /** The shape to be edited */
  @Input('shape')
  set setShape(shape: Shape$v1) {
    if (shape) {
      this.shape = new Shape$v1(shape);

      if (this.shape.primaryContact) {
        this.primaryContactUser = new UserInfo$v1({
          familyName: shape.primaryContact.lastName,
          givenName: shape.primaryContact.firstName,
          email: shape.primaryContact.email,
          phone: shape.primaryContact.phone,
          title: shape.primaryContact.title
        } as UserInfo$v1);
      } else if (!this.shape.primaryContact) {
        this.primaryContactUser = null;
      }

    } else {
      this.shape = null;
      this.primaryContactUser = null;
    }
  }

  /** Flag that is true if there are unsaved changes */
  @Input() isDirty = true;

  /** A flag that is true if the editor is read only */
  @Input() readOnly = false;

  /** The shape to be edited */
  shape: Shape$v1 = null;

  /** Event when a shape has been updated */
  @Output() shapeUpdated = new EventEmitter<Shape$v1>();

  /** Event the id of the shape to reset */
  @Output() resetShape = new EventEmitter<string>();

  /** Export ShapeEditorTranslationTokens to HTML */
  tokens: typeof ShapeEditorTranslationTokens = ShapeEditorTranslationTokens;

  /** Use comma as split keywords */
  readonly keycodes = [Keycodes$v1.comma];

  /** Translated tokens */
  tTokens: ShapeEditorTranslatedTokens = {
    enterKeywords: ''
  } as ShapeEditorTranslatedTokens;

  /** Primary contact user */
  primaryContactUser: UserInfo$v1 = new UserInfo$v1();

  /** Expose shape type to HTML */
  shapeType: typeof ShapeType = ShapeType;

  /** Expose Feature Flags to HTML */
  FeatureFlags: typeof FeatureFlags = FeatureFlags;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private localizationAdapter: CommonlocalizationAdapterService$v1
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
   * Shape has been changed
   */
  shapeChanged(): void {
    this.shapeUpdated.emit(new Shape$v1({
      ...this.shape,
      name: this.shape.name?.trim(),
      filteringType: this.shape.filteringType?.trim(),
      description: this.shape.description?.trim()
    } as Shape$v1));
  }

  /**
   * Shape graphics has changed
   */
  graphicsChanged(graphics: ShapeGraphicsSettings$v1): void {
    this.shape.graphicsSettings = graphics;
    this.shapeUpdated.emit(new Shape$v1(this.shape));
  }

  /**
   * Adds keywords to shape
   * @param keywords
   */
  addKeywords(keywords: string | string[]): void {
    if (!Array.isArray(keywords)) {
      keywords = [keywords];
    }
    const updatedKeywords = [...new Set(this.shape.keywords.concat(keywords))];
    this.shapeUpdated.emit(new Shape$v1({ ...this.shape, keywords: updatedKeywords } as Shape$v1));
  }

  /**
   * Removes the given keywords for the shape
   * @param keyword Keyword to remove
   */
  removeKeyword(keyword: string) {
    const updatedKeywords = this.shape.keywords.filter(k => {
      return k !== keyword;
    });

    this.shapeUpdated.emit(new Shape$v1({ ...this.shape, keywords: updatedKeywords } as Shape$v1));
  }

  /**
   * Checks if the given string is valid
   * @param val String to validate
   */
  validate(val: string): boolean {
    return val?.trim().length > 0;
  }

  /**
   * Hyperlinks change
   */
  hyperLinksChanged(links: Hyperlink$v1[]): void {
    this.shapeUpdated.emit(new Shape$v1({ ...this.shape, hyperlinks: links } as Shape$v1));

  }

  /**
   * Sets primary contact
   */
  setPrimaryContact(user: UserInfo$v1) {
    let primaryContact: Person$v1 = null;
    if (user) {
      primaryContact = new Person$v1({
        firstName: user.givenName,
        lastName: user.familyName,
        title: user.title,
        email: user.email,
        phone: user.phone
      });
    }

    this.shapeUpdated.emit(new Shape$v1({
      ...this.shape,
      primaryContact: primaryContact
    } as Shape$v1));
  }

  /**
   * Discard changes made to the current shape
   */
  reset(): void {
    this.resetShape.emit(this.shape.id);
  }

  /**
  * Set up routine for localization
  */
  private async initLocalizationAsync(): Promise<void> {
    const tokens: string[] = Object.keys(ShapeEditorTranslationTokens).map(k => ShapeEditorTranslationTokens[k]);
    const translatedTokens = await this.localizationAdapter.getTranslationAsync(tokens);

    this.tTokens.enterKeywords = translatedTokens[ShapeEditorTranslationTokens.enterKeywords];
  }
}
