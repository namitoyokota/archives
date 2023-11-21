import { ISubtextConfig } from '../../../../../../resources/features/vm-grid-v2/interfaces/vm-grid-interfaces';
import { ActionContext } from '../../gridColumnBase';

export class SubtextColumn {
  /** Stores subtext properties for display in html. */
  subtextConfig: ISubtextConfig = null;

  constructor() {}

  /**
   * Active life cycle hook.
   */
  activate(context: ActionContext): void {
    this.subtextConfig = context.Row[context.Options.columnName];
  }
}
