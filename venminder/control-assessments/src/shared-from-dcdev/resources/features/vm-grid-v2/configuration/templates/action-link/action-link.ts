import { IActionContext } from "../../../interfaces/vm-grid-interfaces";

export class ActionLink {
    context;
    linkText = '';
    tooltip = '';
    canPerformAction = true;

    activate(context: IActionContext) {
        this.context = context;
        this.linkText = this.context.Row[this.context.Column.ColumnName];
        this.tooltip = this.context.OnChange?.tooltip;

        const actionableProperty = this.context.OnChange?.actionableProperty;

        if (actionableProperty) {
            this.canPerformAction = this.context.Row[actionableProperty];
        }
    }

    handleAction() {
        this.context.OnChange?.action(this.context.Row);
    }
}