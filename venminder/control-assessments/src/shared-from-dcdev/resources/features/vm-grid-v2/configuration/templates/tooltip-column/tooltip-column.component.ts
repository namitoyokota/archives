import { VMTooltipPins, VMTooltipPositions } from '@venminder/vm-library';
import { ITooltipConfig } from '../../../interfaces/vm-grid-interfaces';
import { ActionContext } from '../../gridColumnBase';

export class TooltipColumn {
  /** Pin direction of tooltip. */
  pin: VMTooltipPins = VMTooltipPins.Left;

  /** Position of tooltip. */
  position: VMTooltipPositions = VMTooltipPositions.Bottom;

  /** Stores tooltip properties for tooltip display in html. */
  tooltip: ITooltipConfig = null;

  constructor() {}

  /**
   * Active life cycle hook.
   */
  activate(context: ActionContext): void {
    this.tooltip = context.Row[context.Options.columnName];

    if (context.Options.pin) {
      this.pin = context.Options.pin;
    }

    if (context.Options.position) {
      this.position = context.Options.position;
    }
  }

  /**
   * Captures the mouseover event.
   */
  doMouseOver(event) {
    const targetedTooltip: HTMLElement = document.getElementById(this.tooltip.tooltipId);

    const top = event.target.offsetTop;
    const left = event.target.offsetLeft;
    
    if (targetedTooltip) {
      targetedTooltip.style.setProperty('--tooltip-info-top', `${top}px`);
      targetedTooltip.style.setProperty('--tooltip-info-left', `${left}px`);
    }
  }
}
