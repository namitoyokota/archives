import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AlarmWithShapeAssociation$v1,
  AssetWithShapeAssociation$v1,
  CapabilityAssociationData$v1,
  DeviceWithShapeAssociation$v1,
  IncidentWithShapeAssociation$v1,
  ShapeWithManyAdapterService$v1,
  ShapeWithUnitAssociation$v1
} from '@galileo/web_commonassociation/adapter';
import { CommontenantAdapterService$v1 } from '@galileo/web_commontenant/adapter';
import { capabilityId, CapabilitySetting$v1, FeatureFlags } from '@galileo/web_shapes/_common';
import { RestrictIds$v1, Shape$v1 } from '@galileo/web_shapes/_common';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { TranslationTokens } from './detail-pane.translation';

enum RelatedCapabilityIds {
  alarms = '@hxgn/alarms',
  assets = '@hxgn/assets',
  devices = '@hxgn/devices',
  incidents = '@hxgn/incidents',
  units = '@hxgn/units'
}

@Component({
  selector: 'hxgn-shapes-detail-pane',
  templateUrl: 'detail-pane.component.html',
  styleUrls: ['detail-pane.component.scss']
})

export class DetailPaneComponent implements OnInit, OnDestroy {

  /** Shape to show details for */
  @Input() shape: Shape$v1;

  /** When true will show keywords if they are not redacted */
  @Input() enableKeywords = false;

  /** The context id of the view using this component (for portal injection) */
  @Input() contextId: string;

  /** List of translation token for properties that have been redacted */
  redactedPropertyTokens: string[] = [];

  /** List of linked data with shape */
  linkedDataList: CapabilityAssociationData$v1[] = [];

  /** Map of capability id to injectable component name */
  componentNameMap = new Map<string, string>();

  /** Expose DetailPaneTranslationTokens to HTML */
  tokens: typeof TranslationTokens = TranslationTokens;

  /** Expose restrict ids to HTML */
  RestrictIds: typeof RestrictIds$v1 = RestrictIds$v1;

  /** Expose Feature Flags to HTML */
  FeatureFlags: typeof FeatureFlags = FeatureFlags;

  /** Used for destroying subscriptions */
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private tenantAdapter: CommontenantAdapterService$v1,
    private shapeWithManySrv: ShapeWithManyAdapterService$v1
  ) { }

  /** On init lifecycle */
  async ngOnInit() {
    this.setRedactionTokens();
    await this.getInjectableNames();
    this.listenToAssociations();
  }

  /** On destroy lifecycle hook */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Set list of tokens that are redacted */
  private setRedactionTokens() {
    if (this.shape.isRedacted(RestrictIds$v1.description)) {
      this.redactedPropertyTokens.push(this.tokens.description);
    }

    if (this.shape.isRedacted(RestrictIds$v1.filteringType)) {
      this.redactedPropertyTokens.push(this.tokens.type);
    }

    if (this.shape.isRedacted(RestrictIds$v1.keywords)) {
      this.redactedPropertyTokens.push(this.tokens.keywords);
    }

    if (this.shape.isRedacted(RestrictIds$v1.primaryContact)) {
      this.redactedPropertyTokens.push(this.tokens.primaryContact);
    }
  }

  /** Sets injectable component names from capability manifests */
  private async getInjectableNames() {
    const manifests = await this.tenantAdapter.getCapabilityListAsync(capabilityId);

    manifests.forEach(async manifest => {
      const settings = manifest.compatible.find(c => c.capabilityId === capabilityId)?.options as CapabilitySetting$v1;
      this.componentNameMap.set(manifest.id, settings.linkedDataComponentName);
    });
  }

  /** Listens to association change */
  private async listenToAssociations() {
    const associations$ = await this.shapeWithManySrv.getAssociationsAsync(this.shape.id);

    associations$.pipe(
      takeUntil(this.destroy$),
      filter(item => !!item)
    ).subscribe(associations => {
      this.linkedDataList = [];

      associations.forEach(association => {
        const linkedData = new CapabilityAssociationData$v1();

        if (association instanceof AlarmWithShapeAssociation$v1) {
          linkedData.capabilityId = RelatedCapabilityIds.alarms;
          linkedData.id = association.alarmId;
        } else if (association instanceof AssetWithShapeAssociation$v1) {
          linkedData.capabilityId = RelatedCapabilityIds.assets;
          linkedData.id = association.assetId;
        } else if (association instanceof DeviceWithShapeAssociation$v1) {
          linkedData.capabilityId = RelatedCapabilityIds.devices;
          linkedData.id = association.deviceId;
        } else if (association instanceof IncidentWithShapeAssociation$v1) {
          linkedData.capabilityId = RelatedCapabilityIds.incidents;
          linkedData.id = association.incidentId;
        } else if (association instanceof ShapeWithUnitAssociation$v1) {
          linkedData.capabilityId = RelatedCapabilityIds.units;
          linkedData.id = association.unitId;
        }

        this.linkedDataList.push(linkedData);
      });
    });
  }
}
