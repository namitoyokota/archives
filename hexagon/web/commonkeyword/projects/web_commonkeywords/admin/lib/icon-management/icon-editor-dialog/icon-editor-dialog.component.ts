import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Utils } from '@galileo/web_common-libraries';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import {
  CompositeIcon$v1,
  CompositeIconMember$v1,
  CompositeIconOptions$v1,
  PrimitiveIcon$v2,
} from '@galileo/web_commonkeywords/_common';
import { from, fromEvent, of, Subscription, throwError } from 'rxjs';
import { catchError, first, flatMap, map } from 'rxjs/operators';

import { IconEditorComponent } from '../icon-editor/icon-editor.component';
import { IconLibraryComponent, IconListType } from '../icon-library/icon-library.component';
import { IconManagementService } from '../icon-management.service';
import { IconEditorDialogData } from './icon-editor-dialog-data';
import { TranslationTokens } from './icon-editor-dialog.translation';

export interface AddModifierTutorial {
  doNotShow: boolean;
}

@Component({
    templateUrl: 'icon-editor-dialog.component.html',
    styleUrls: ['icon-editor-dialog.component.scss']
})
export class IconEditorDialogComponent implements OnInit, AfterViewInit, OnDestroy {

    /** Key to the setting */
    readonly addModifierTutorialSettingsKey = '@hxgn-keywords-iconManager-modifierTutorial';

    /** Ref to icon editor */
    @ViewChild('iconEditor') iconEditor: IconEditorComponent;

    /** Ref to icon lib */
    @ViewChild('iconLib') iconLib: IconLibraryComponent;

    /** The composite icon being edited */
    compositeIcon: CompositeIcon$v1;

    /** Composite icon with unsaved changes */
    editedCompositeIcon: CompositeIcon$v1;

    /** The maximum number of layers that can be added to the icon*/
    maxLayers: number;

    /** Is true when there are unsaved changes */
    isDirty = false;

    /** Expose TranslationTokens to the HTML */
    tokens: typeof TranslationTokens = TranslationTokens;

    /** The capability to show icons for */
    selectedCapability: string;

    /** A flag that is true when the modifier tutorial is done */
    modifierTutorialDone = false;

    /** Flag that is true when the tutorial is loading */
    isLoadingTutorial = true;

    private userId: string;

    /** Returns the user's choice about seeing the tutorial */
    private modifierTutorialSettings$ = from(this.identityAdapter.getUserInfoAsync()).pipe(
      map((userInfo: UserInfo$v1) => {
        this.userId = userInfo.id;
        return  from(this.identityAdapter
          .getUserPersonalizationSettingsAsync<AddModifierTutorial>(userInfo.id, this.addModifierTutorialSettingsKey)).pipe(
            map(settings => {
              if (!settings) {
                throwError('Error');
              } else {
                return settings;
              }
            }),
            catchError( err => {
              return of({
                doNotShow: false
              } as AddModifierTutorial);
            })
          );
      }),
      flatMap(data => data)
    );

    private resizeSub: Subscription;

    constructor(
      private dialogRef: MatDialogRef<IconEditorDialogComponent>,
      private iconSrv: IconManagementService,
      @Inject(MAT_DIALOG_DATA) public data: IconEditorDialogData,
      private identityAdapter: CommonidentityAdapterService$v1,
      private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {

        if (this.data.iconType === IconListType.groupIcon) {
          this.modifierTutorialDone =  true;
          this.isLoadingTutorial = false;
        } else {
          this.modifierTutorialSettings$.pipe(first()).subscribe(settings => {
            this.modifierTutorialDone = settings?.doNotShow;
            this.isLoadingTutorial = false;

            // Wait for next angular tick
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
              this.setUpIconLib();
            });
          });
        }

        this.selectedCapability = this.iconSrv.selectedCapability;

        this.iconSrv.selectedLayerIndex = null;
        this.iconSrv.selectedPrimitiveIconId = null;

        if (this.data.compositeIcon) {
            this.compositeIcon = new CompositeIcon$v1(this.data.compositeIcon);
        } else {
            this.compositeIcon = new CompositeIcon$v1();
        }

        this.maxLayers = this.data.maxLayers;
        this.editedCompositeIcon = new CompositeIcon$v1(Utils.deepCopy(this.compositeIcon));

        this.resizeSub = fromEvent(window, 'resize').subscribe((event) => {
          this.editedCompositeIcon = new CompositeIcon$v1(Utils.deepCopy(this.editedCompositeIcon));
          this.iconEditor.resetDrawScale();
        });
    }

    ngOnDestroy() {
      if (this.resizeSub) {
        this.resizeSub.unsubscribe();
        this.resizeSub = null;
      }
    }

    ngAfterViewInit() {
      // Set some option
      this.setUpIconLib();
    }

    /** Sets up the icon lib */
    setUpIconLib() {
      if (this.iconLib) {
        if (this.data.iconType === IconListType.groupIcon) {
          this.iconLib.disableModifiers = true;
        } else {
          this.iconLib.setSelectedType(IconListType.modifierIcon);
        }
      }

      // Wait for next angular tick
      setTimeout(() => {
        this.editedCompositeIcon = new CompositeIcon$v1(Utils.deepCopy(this.compositeIcon));
        if (this.iconEditor) {
          this.iconEditor.resetDrawScale();
        }
      });
    }

    /**
     * Adds the primitive icon to the stack
     * @param icon The primitive icon to set as being used
     */
    setIcon(icon: PrimitiveIcon$v2) {
         if ( this.editedCompositeIcon.iconStack.length  < this.maxLayers) {
            // Add a new layer
            const startingPoint = {x: 30, y: 40};
            const scaleSize = {x: icon.baseWidth, y: icon.baseHeight};
            if (icon.isModifier) {
              // Put icon in the lower right corner
              startingPoint.x = 354 - icon.baseWidth;
              startingPoint.y = 354 - icon.baseHeight;
            }

            this.editedCompositeIcon.iconStack = [
              ...this.editedCompositeIcon.iconStack?.map(i => new CompositeIconMember$v1(i)),
              new CompositeIconMember$v1({
                primitiveIconId: icon.id,
                options: new CompositeIconOptions$v1({
                    scaleSize: scaleSize,
                    point: startingPoint,
                    showStroke: !!icon?.urlWithStroke
                })
              })
            ];

            this.editedCompositeIcon = new CompositeIcon$v1(this.editedCompositeIcon);
            this.isDirty = true;

            this.cdr.markForCheck();
            this.cdr.detectChanges();

            // Wait for next minor browser tick
            Promise.resolve().then(() => {
              this.iconEditor.setSelectedIconLayer(this.editedCompositeIcon.iconStack.length - 1);
            });
         }
    }

    /**
     * Enabled or disables the tutorial
     */
    disableTutorial(event: MatCheckboxChange) {
      this.identityAdapter.saveUserPersonalizationSettingsAsync<AddModifierTutorial>(
        this.userId,
        this.addModifierTutorialSettingsKey,
        {
          doNotShow: event.checked
        } as AddModifierTutorial);
    }

    /**
     * Close the dialog
     */
    close() {
        this.dialogRef.close(this.compositeIcon);
    }

    /**
     * Save the icon
     */
    saveIcon() {
        this.compositeIcon = new CompositeIcon$v1(Utils.deepCopy(this.editedCompositeIcon));
        this.isDirty = false;
        this.close();
    }

    /** Returns a list of primitive icons that are selected */
    selectedIcons() {
      return this.editedCompositeIcon.iconStack.map(icon => icon.primitiveIconId);
    }

    /**
     * Discard any unsaved changes
     */
    discard() {
        this.isDirty = false;
        this.editedCompositeIcon = new CompositeIcon$v1(Utils.deepCopy(this.compositeIcon));
        this.iconEditor.resetDrawScale();
    }

    /**
     * The tutorial has been completed
     */
    tutorialDone() {
      this.modifierTutorialDone = true;
      // wait for next angular tick
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        this.setUpIconLib();
      });
    }
}
