import { PopupBase } from "../../../base-controls/popup-base";
import { orderBy } from "lodash"
import { IVmGridColumnWithView } from "../data/vm-data-managed";
import type { IPopupViewModel } from "../../../../shared/components/popups/interfaces/popup-interfaces";

export class ColumnConfiguration extends PopupBase {
    columns: IVmGridColumnWithView[] = [];
    protected activate(model: IPopupViewModel) {
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
        super.attached()
        this.columns = orderBy<IVmGridColumnWithView>(Object.values(this.model.Data.columnSettings),
            ['ViewLocked', 'View.ColumnPosition', 'ColumnHeaderText'],
            ['desc', 'asc', 'asc'])
            .map((column: IVmGridColumnWithView, index: number): IVmGridColumnWithView => {
                return  {
                    ...column,
                    ...{
                        View: {
                            ...column.View,
                            ColumnPosition: index
                        }
                    }
                }
            })
    }
    updateSettings() {
        this.columns.forEach(column => {
            this.model.Data.columnSettings[column.View.ColumnId] = column
        })
    }


}