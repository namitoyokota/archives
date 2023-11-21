import { IActionContext, IFormatListValueConverter } from "../../../interfaces/vm-grid-interfaces";
import { VmGridListDisplayType } from "../../../enums/vm-grid-enums";

export class FormatList {
    context: IActionContext;
    value: Array<string> = [];

    delimitedText = '';
    maxDisplayLength = 0;

    activate(context: IActionContext) {
        this.context = context;
        this.value = this.context.Row[this.context.Column.ColumnName] || this.value;

        const converter = <IFormatListValueConverter>this.context.Column.ColumnValueConverter;
        this.maxDisplayLength = converter?.MaxItems || this.value.length;

        if (converter.DisplayType == VmGridListDisplayType.Delimited) {
            const delimiter = converter.ItemDelimiter ?? ', ';
            const suffix = (this.maxDisplayLength < this.value.length) ? '&hellip;' : '';

            this.delimitedText = this.value.slice(0, this.maxDisplayLength).join(delimiter) + suffix;
        }
    }

    formatListTooltip(value: string[]) {
        return value ? value.join(', ') : '';
    }

    disableListTooltip(value: string[], columnValueConverter: IFormatListValueConverter) {
        const maxItems = columnValueConverter ? columnValueConverter.MaxItems : -1;
        const valueLength = value ? value.length : 0;

        return maxItems > 0 ? maxItems >= valueLength : false;
    }
}