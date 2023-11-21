import { IActionButtonParams } from '../../../../../../resources/features/vm-grid-v2/interfaces/vm-grid-interfaces';
import { ActionContext } from '../../gridColumnBase';
import { VMButtonSizes, VMButtonTypes } from '@venminder/vm-library';

export class ActionButton {
  /** Stores info for button properties. */
  button: IActionButtonParams = null;

  /** The context for where the button is located. */
  private context: ActionContext;

  /**
   * Active life cycle hook.
   */
  activate(context: ActionContext): void {
    this.context = context;
    this.button = context.Options;
    this.button.size = this.button.size ? this.button.size : VMButtonSizes.Small;
    this.button.type = this.button.type ? this.button.type : VMButtonTypes.Secondary;
  }

  /**
   * Handles button click and outputs the row where the button is located.
   */
  onClick(): void {
    this.context.OnChange(this.context.Row);
  }
}
