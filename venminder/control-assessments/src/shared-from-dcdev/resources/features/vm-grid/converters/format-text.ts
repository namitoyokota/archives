import { IFormatTextValueConverter } from "../interfaces/vm-grid-interfaces";

export class FormatTextValueConverter {
    toView(value: string, converter: IFormatTextValueConverter) {
        if (converter && (value && value == converter.ReplaceText)) {
            value = converter.FormatTemplate.replace('{0}', converter.ReplaceText);
        }
        return value;
    }
}