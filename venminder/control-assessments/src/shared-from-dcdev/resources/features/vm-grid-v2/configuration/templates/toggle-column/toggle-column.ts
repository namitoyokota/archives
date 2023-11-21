import { bindable, computedFrom } from "aurelia-framework";
import type { IActionContext } from "shared-from-dcdev/resources/features/vm-grid-v2/interfaces/vm-grid-interfaces";

export class ToggleColumn {
    toggleValue: boolean;
    context;

    activate(context: IActionContext) {
        this.toggleValue = context.Row[context.Column.ColumnName];
        this.context = context;
    }
    handleChange(event) {
        this.context.OnChange({
            row: this.context.Row,
            column: this.context.Column.ColumnName,
            value: this.toggleValue
        })
    }
}
