import moment from 'moment';

export class DateFormatValueConverter {
    private static dateFormat = 'M/D/YYYY h:mm:ss a';

    toView(value) {
        return moment(value).format(DateFormatValueConverter.dateFormat);
    }

    public static getFormated(value: Date) {
        return moment(value).format(DateFormatValueConverter.dateFormat);
    }
}