import { ApplicationRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Guid, Person$v1 } from '@galileo/web_common-libraries';
import { Colors } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';
import { CommonidentityAdapterService$v1, UserInfo$v1 } from '@galileo/web_commonidentity/adapter';
import { CommontenantAdapterService$v1, Tenant$v1 } from '@galileo/web_commontenant/adapter';
import { Shape$v1, ShapeFillType$v1, ShapeGraphicsSettings$v1 } from '@galileo/web_shapes/_common';

import { CreateEditDialogTranslationTokens } from './create-edit-dialog.transltion';

@Component({
  templateUrl: 'create-edit-dialog.component.html',
  styleUrls: ['create-edit-dialog.component.scss']
})

export class CreateEditComponent implements OnInit {

  /** Shape to edit/ create */
  shape: Shape$v1;

  /** Source of truth */
  source: Shape$v1;

  /** The current active tenant */
  activeTenant: Tenant$v1;

  /** A flag that is true if UI is loading */
  isLoading = true;

  /** Expose CreateEditDialogTranslationTokens to HTML */
  tokens: typeof CreateEditDialogTranslationTokens = CreateEditDialogTranslationTokens;

  /** Current user */
  user: UserInfo$v1;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: Shape$v1,
    private tenantAdapter: CommontenantAdapterService$v1,
    private identityAdapter: CommonidentityAdapterService$v1,
    private applicationRef: ApplicationRef
  ) {
    this.shape = new Shape$v1();
  }

  /**
   * OnInit lifecycle hook
   */
  async ngOnInit() {
    this.user = await this.identityAdapter.getUserInfoAsync();

    this.activeTenant = await this.tenantAdapter.getUserTenantsAsync().then(tenants => {
      return tenants.find(tenant => tenant.id === this.user.activeTenant);
    });

  }

  /**
   * Map is ready
   */
  mapIsReady(): void {
    if (this.data) {
      this.shape = new Shape$v1(this.data);
    } else {
      this.shape = new Shape$v1({
        id: Guid.NewGuid(),
        shapeType: null,
        coordinates: [],
        primaryContact: new Person$v1({
          firstName: this.user.givenName,
          lastName: this.user.familyName,
          title: this.user.title,
          email: this.user.email,
          phone: this.user.phone
        }),
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
      } as Shape$v1);
    }

    this.source = new Shape$v1(this.shape);

    this.isLoading = false;

    // Fix map size
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * Shape that has been updated
   * @param shape New state of the shape
   */
  shapeUpdated(shape: Shape$v1): void {
    this.shape = new Shape$v1(shape);
  }

  /**
   * Returns true if shape is dirty
   */
  isDirty(): boolean {
    return !this.source.isEqual(this.shape);
  }

  /**
   * Trigger change detection.
   */
  detectChanges(): void {
    setTimeout(() => {
      this.applicationRef.tick();
    });
  }
}
