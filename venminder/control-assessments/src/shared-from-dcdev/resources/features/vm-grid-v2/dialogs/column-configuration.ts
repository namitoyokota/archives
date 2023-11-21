import { PopupBase } from "../../../base-controls/popup-base";
import { orderBy } from "lodash"
import { IVmGridColumnWithView } from "../data/vm-data-managed";
import { IVmPopupViewModel } from "../../vm-popup/vm-popup-interfaces";

export class ColumnConfiguration extends PopupBase {
    columns: IVmGridColumnWithView[] = [];

    protected activate(model: IVmPopupViewModel) {
        this.model = model;
        this.model.OnSave = () => {
            this.updateSettings()
            this.model.OnClose({
                columns: this.columns,
                columnSettings: this.model.Data.columnSettings
            });
        };
    }

    attached() {
        super.attached();

        this.columns = orderBy<IVmGridColumnWithView>(Object.values(this.model.Data.columnSettings),
            ['ViewLocked'],
            ['desc'])
            .filter(c => !c.IsActionColumn)
            .map((column: IVmGridColumnWithView, index: number): IVmGridColumnWithView => {
                return {
                    ...column,
                    ...{
                        View: {
                            ...column.View,
                            ColumnPosition: index
                        }
                    }
                }
            });
    }

    updateSettings() {
        this.columns.forEach(column => {
            this.model.Data.columnSettings[column.View.ColumnId] = column;
        })
    }
}