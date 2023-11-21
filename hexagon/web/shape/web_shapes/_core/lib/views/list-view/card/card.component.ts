import { Component, DoCheck, ElementRef, EventEmitter, Input, OnDestroy, Output, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CardExpansionState, CommonConfirmDialogComponent, Location$v1, PopoverPosition } from '@galileo/web_common-libraries';
import { CommonconversationsAdapterService$v1 } from '@galileo/web_commonconversations/adapter';
import { CommonlocalizationAdapterService$v1 } from '@galileo/web_commonlocalization/adapter';
import { capabilityId, RestrictIds$v1, Shape$v1, ShapeFilter$v1 } from '@galileo/web_shapes/_common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActionStoreService } from '../../../action-store.service';
import { CardTranslationTokens } from './card.translation';

@Component({
  selector: 'hxgn-shapes-card',
  templateUrl: 'card.component.html',
  styleUrls: ['card.component.scss']
})

export class CardComponent implements OnInit, OnDestroy, DoCheck {

  /** Shape for card */
  @Input('shape')
  set setShape(shape: Shape$v1) {
    this.shape = new Shape$v1(shape);
    this.setHeaderTitle();
  }

  /** A flag that is true when tenant info should be shown */
  @Input() showTenantInfo = false;

  /** The context id of the view using this component.  Needed for portal injection */
  @Input() contextId: string;

  /** Details are being shown when true */
  @Input() isExpanded = false;

  /** A flag that is true when the action panel should be shown */
  @Input() showActionPanel = false;

  /** A flag that is true if the card was auto closed */
  @Input() wasExpanded: boolean;

  /** Flag that is true when card is selected */
  @Input() isSelected = false;

  /** Id of the current tenant */
  @Input() currentTenantId: string;

  /** Flag that is true if the card can be expanded */
  @Input() enableCardExpansion = true;

  /** When true will show keywords if they are not redacted. */
  @Input() enableKeywords = false;

  /** A flag that is true when the shape is being used as a filter */
  @Input() isShapeFilter = false;

  /** Event that is fired when the state of the expansion pane changes */
  @Output() expansionChange = new EventEmitter<boolean>();

  /** Event when size of card changes */
  @Output() sizeChange = new EventEmitter<number>();

  /** Event if card is destroyed when expanded */
  @Output() expandedDestroy = new EventEmitter();

  /** Event that edit should start */
  @Output() startEdit = new EventEmitter<Shape$v1>();

  /** Event that a shape should be deleted */
  @Output() startDelete = new EventEmitter<string>();

  /** Shape for card */
  shape: Shape$v1;

  /** Expose CardTranslationTokens to HTML */
  tokens: typeof CardTranslationTokens = CardTranslationTokens;

  /** Size when expanded */
  expandSize = 0;

  /** Popover position. */
  popoverPosition: PopoverPosition = PopoverPosition.belowLeft;

  /** Header title to show on card */
  headerTitle: string;

  /** A flag that is true when actions can be performed */
  actionsEnabled$: Observable<boolean>;

  constructor(
    private elementRef: ElementRef,
    private actionSrv: ActionStoreService,
    private dialog: MatDialog,
    private localizationAdapter: CommonlocalizationAdapterService$v1,
    private conversationAdapter: CommonconversationsAdapterService$v1) { }

  /**
   * On init lifecycle hook
   */
  ngOnInit(): void {
    this.actionsEnabled$ = this.actionSrv.multiselect$(this.contextId).pipe(
      map(data => {
        if (data?.items?.length > 1 && data?.items?.some(item => item.entityId === this.shape.id)) {
          return false;
        } else {
          return true;
        }
      })
    );
  }

  /**
   * Check for size changes
   */
  ngDoCheck() {
    if (this.isExpanded) {
      const currentSize = this.elementRef.nativeElement.offsetHeight;
      if (currentSize !== this.expandSize) {
        this.expandSize = currentSize;
        this.sizeChange.emit(this.expandSize);
      }
    }
  }

  /**
   * On destroy life cycle hook
   */
  ngOnDestroy() {
    if (this.isExpanded) {
      this.expandedDestroy.emit();
    }
  }

  /**
   * Returns the state of the expansion pane
   */
  getExpansionState(): CardExpansionState {
    if (!this.enableCardExpansion) {
      return CardExpansionState.hidden;
    } else if (this.areDetailsRedacted()) {
      return CardExpansionState.locked;
    } else if (this.isExpanded) {
      return CardExpansionState.expanded;
    } else {
      return CardExpansionState.collapsed;
    }
  }

  /**
   * Toggle the state of the expansion panel
   */
  toggleExpansionPanel(state: CardExpansionState) {
    this.expansionChange.emit(state === CardExpansionState.expanded);
  }

  /**
   * Use this shape as a smart filter
   */
  useAsFilter(): void {
    const g = this.shape.toMapGeometry$v1(capabilityId);
    this.actionSrv.shapeFilter(this.contextId, {
      ...g,
      originId: this.contextId
    } as ShapeFilter$v1);
  }

  /**
   * Clears the active filter
   */
  clearFilter(): void {
    this.actionSrv.shapeFilter(this.contextId, {
      originId: this.contextId
    } as ShapeFilter$v1);
  }

  /**
   * Delete shape
   */
  deleteShape(): void {
    this.dialog.open(CommonConfirmDialogComponent, {
      data: {
        titleToken: this.tokens.deleteShape,
        msgToken: this.tokens.confirmDeleteShape
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.startDelete.emit(this.shape.id);
      }
    });
  }

  /**
     * Starts a channel
     */
  startChannel() {
    this.conversationAdapter.startNewChannel(
      capabilityId,
      this.shape.id,
      this.shape.name,
      new Location$v1({
        coordinates: this.shape.toMapGeometry$v1(capabilityId).centroid()
      } as Location$v1),
      this.shape.tenantId
    );
  }

  /**
     * Add to existing channels dialog
     */
  addToChannel() {
    this.conversationAdapter.addToChannel(
      capabilityId,
      this.shape.id,
      this.shape.tenantId
    );
  }

  // TODO - Use to set the center location of the channel later
  private getCenter(arr: Array<Array<number>>) {
    var x = arr.map(xy => xy[0]);
    var y = arr.map(xy => xy[1]);
    var cx = (Math.min(...x) + Math.max(...x)) / 2;
    var cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
  }

  /**
   * Returns true if all data in the detail area is redacted
   */
  private areDetailsRedacted(): boolean {
    if (!this.shape.isRedacted(RestrictIds$v1.filteringType)) {
      return false;
    }

    if (!this.shape.isRedacted(RestrictIds$v1.description)) {
      return false;
    }

    if (!this.shape.isRedacted(RestrictIds$v1.keywords)) {
      return false;
    }

    if (!this.shape.isRedacted(RestrictIds$v1.primaryContact)) {
      return false;
    }

    return true;
  }

  /**
     * Sets header title if incident is tombstoned
     */
  private setHeaderTitle(): void {
    if (this.shape.tombstoned) {
      if (!this.headerTitle) {
        this.localizationAdapter.getTranslationAsync(CardTranslationTokens.shapeClosed).then(text => {
          this.headerTitle = text;
        });
      }
    } else {
      this.headerTitle = null;
    }
  }
}
