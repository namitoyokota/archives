import moment from "moment";
import numeral from 'numeral';
import { isNullOrUndefined, isNullOrWhitespace } from "../../../../shared/utilities/globals";
import {
    IBoolValueConverter, IDateValueConverter, IFormatTextValueConverter,
    INumberValueConverter
} from '../interfaces/vm-grid-interfaces';

export const booleanFormatting = {
    Format: (row, columnName, converter: IBoolValueConverter, ignoreSanitize: boolean = false) => {
        let value = row[columnName];

        if (value == undefined || value == null) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }

        if (converter) {
            value = (value) ? converter.TrueState : converter.FalseState;
        }

        return value.toString();
    }
};

export const dateFormatting = {
    Format: (row, columnName, converter: IDateValueConverter, ignoreSanitize: boolean = false) => {
        let value = row[columnName];

        if (!value) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }

        if (converter) {
            value = moment(value).format(converter.DateFormat);
        }

        return value.toString();
    }
};

export const linkTextFormatting = {
    Format: (row, columnName, converter: IFormatTextValueConverter, ignoreSanitize: boolean = false) => {
        const value = row[columnName];

        if (!value) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }
        else if (ignoreSanitize) {
            return value;
        }

        if (converter?.CheckColumnForTrueState) {
            const boolState = row[converter.CheckColumnForTrueState];

            if (!boolState) {
                return value;
            }
        }

        return `<a href="javascript:void(0)" class="action-element">${value}</a>`;
    }
};

export const literalFormatting = {
    Format: (row, columnName, converter: IFormatTextValueConverter, ignoreSanitize: boolean = false) => {
        let value = row[columnName];

        if (!value) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }

        if (converter && value == converter.ReplaceText) {
            value = converter.FormatTemplate.replace('{0}', converter.ReplaceText);
        }

        return value;
    }
};

export const numberFormatting = {
    Format: (row, columnName, converter: INumberValueConverter, ignoreSanitize: boolean = false) => {
        let value = row[columnName];

        if (value == undefined || value == null || (value == 0 && converter && converter.IgnoreFormatIfZero)) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }

        if (converter) {
            value = numeral(value).format(converter.NumberFormat);
        }

        return value.toString();
    }
};

export const addressFormatting = {
    Format: (row, columnName, converter: IFormatTextValueConverter, ignoreSanitize: boolean = false) => {
        const address = row[columnName];

        const br = (ignoreSanitize) ? ' ' : '<br />';
        const emdash = (ignoreSanitize) ? '' : '&mdash;';

        if (!!address) {
            let render = [
                address.address,
                address.address2,
                [address.city, address.state].filter(el => el && el.length).join(', ')
            ].filter(el => el && el.length).join(br);

            return (render.length) ? render : emdash;
        }
        else {
            return emdash;
        }
    }
};

export const addressDetailFormatting = {
    Format: (row, columnName, converter: IFormatTextValueConverter, ignoreSanitize: boolean = false) => {
        let value = (row.address) ? row.address[columnName] : '';

        if (!value) {
            return (ignoreSanitize) ? '' : '&mdash;';
        }

        return value;
    }
};

export const contactInfoFormatting = {
    Format: (row, columnName, converter: IFormatTextValueConverter, ignoreSanitize: boolean = false) => {
        let format = '';

        const br = (ignoreSanitize) ? '' : '<br />';
        const emdash = (ignoreSanitize) ? '' : '&mdash;';

        if (!isNullOrWhitespace(row.emailAddress))
            format += `${row.emailAddress} ${br}`;

        if (!isNullOrUndefined(row.phoneNumber)) {
            if (!isNullOrWhitespace(row.phoneNumber.areaCode))
                format += `(${row.phoneNumber.areaCode})`;
            if (!isNullOrWhitespace(row.phoneNumber.prefix))
                format += ` ${row.phoneNumber.prefix}`;
            if (!isNullOrWhitespace(row.phoneNumber.suffix))
                format += `-${row.phoneNumber.suffix}`;
            if (!isNullOrWhitespace(row.phoneNumber.extension))
                format += ` x${row.phoneNumber.extension}`;

            format += ` ${br}`;
        }

        if (!isNullOrWhitespace(row.jobDescription))
            format += `Job: ${row.jobDescription} ${br}`;

        format += (format.length) ? `${row.isSubscribed ? 'Subscribed' : 'Unsubscribed'}` : emdash;

        return format;
    }
};

export const mappedArrayFormatting = (columnName: string) => {
    return {
        Format: (row, columnName) => {
            const value = row[columnName];
            return (value && value.length) ? value.map(x => x[columnName]).join(', ') : '';
        }
    };
};


export const stringArrayFormatting = {
    Format: (row, columnName) => {
        const value = row[columnName];
        return (value && value.length) ? value.join(', ') : '';
    }
};

