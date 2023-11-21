import { VmGridListDisplayType } from "../enums/vm-grid-enums";
import { IFormatListValueConverter } from "../interfaces/vm-grid-interfaces";
import DOMPurify from 'dompurify';

export class FormatListValueConverter {
    toView(value: Array<string>, converter: IFormatListValueConverter) {
        // other converters could potentially change the value to be a string
        // and strings can be treated as an array of characters
        if (typeof value !== 'string') {
            return this.formatList(value, converter);
        }
        else {
            return value;
        }
    }

    private formatList(value: Array<string>, converter: IFormatListValueConverter): string {
        let formattedValue = '';

        if (converter && value && value.length > 0) {
            const maxItems = converter.MaxItems && converter.MaxItems > 0 ? converter.MaxItems : value.length;

            switch (converter.DisplayType) {
                case VmGridListDisplayType.Delimited:
                    formattedValue = this.getDelimitedValue(value, converter, maxItems);
                    break;
                default:
                    formattedValue = this.getUnorderedList(value, converter, maxItems);
            }
        }

        return formattedValue;
    }

    private getDelimitedValue(value: Array<string>, converter: IFormatListValueConverter, maxItems: number): string {

        const delimiter = converter.ItemDelimiter ?? ', ';
        const valueString = value.slice(0, maxItems).join(delimiter);

        const suffix = value.length > maxItems ? '&hellip;' : '';

        return `${valueString}${suffix}`;
    }

    private getUnorderedList(value: Array<string>, converter: IFormatListValueConverter, maxItems: number): string {

        const ulElement = document.createElement('ul');
        ulElement.setAttribute('class', 'list-unstyled');

        value.slice(0, maxItems).forEach(item => {
            this.addLiToUlElement(item, ulElement);
        });

        // if we truncate the list, add ellipsis
        if (value.length > maxItems) {
            this.addLiToUlElement('&hellip;', ulElement);
        }

        return ulElement.outerHTML;
    }

    private addLiToUlElement(liText: string, ulElement: HTMLUListElement): void {
        const liElement = document.createElement('li');
        liElement.innerHTML = DOMPurify.sanitize(liText);

        ulElement.appendChild(liElement);
    }
}