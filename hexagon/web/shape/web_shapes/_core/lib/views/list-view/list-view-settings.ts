import { ViewSettings$v1 } from '@galileo/web_commonlayoutmanager/adapter';
import { ShapeListFilter$v1 } from '@galileo/web_shapes/_common';

import { SortOptions } from '../../shared/sorting/sort-options';

export interface ShapeListSettings extends ViewSettings$v1 {
  /** The options used to sort the list */
  sortBy?: SortOptions;

  /** The default filter to apply to the list */
  filter?: ShapeListFilter$v1;

  /** When true the UI will show card details expansion icon */
  enableCardExpansion: boolean;

  /** True when keywords are enabled */
  enableKeywords: boolean;
}
