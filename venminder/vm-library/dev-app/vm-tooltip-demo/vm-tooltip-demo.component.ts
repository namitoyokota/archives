import { VMTooltipPins, VMTooltipPositions } from 'resources';

export class VMTooltipDemoComponent {
    tooltipText = 'This is a demo tooltip.';
    readonly vmTooltipPins: typeof VMTooltipPins = VMTooltipPins;
    readonly vmTooltipPositions: typeof VMTooltipPositions = VMTooltipPositions;

    constructor() {}
}
