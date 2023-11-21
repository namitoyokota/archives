import moment from "moment";
export class DST {
    dates: any = null;
    standardTimeOffset: number;
    daylightTimeOffset: number;
    Date_getTimezoneOffset_Save: () => number;

    constructor() {
        let dates = {};
        dates[1980] = { begin: new Date('04/27/1980'), end: new Date('10/26/1980') };
        dates[1981] = { begin: new Date('04/26/1981'), end: new Date('10/25/1981') };
        dates[1982] = { begin: new Date('04/25/1982'), end: new Date('10/31/1982') };
        dates[1983] = { begin: new Date('04/24/1983'), end: new Date('10/30/1983') };
        dates[1984] = { begin: new Date('04/29/1984'), end: new Date('10/28/1984') };
        dates[1985] = { begin: new Date('04/28/1985'), end: new Date('10/27/1985') };
        dates[1986] = { begin: new Date('04/27/1986'), end: new Date('10/26/1986') };
        dates[1987] = { begin: new Date('04/05/1987'), end: new Date('10/25/1987') };
        dates[1988] = { begin: new Date('04/03/1988'), end: new Date('10/30/1988') };
        dates[1989] = { begin: new Date('04/02/1989'), end: new Date('10/29/1989') };
        dates[1990] = { begin: new Date('04/01/1990'), end: new Date('10/28/1990') };
        dates[1991] = { begin: new Date('04/07/1991'), end: new Date('10/27/1991') };
        dates[1992] = { begin: new Date('04/05/1992'), end: new Date('10/25/1992') };
        dates[1993] = { begin: new Date('04/04/1993'), end: new Date('10/31/1993') };
        dates[1994] = { begin: new Date('04/03/1994'), end: new Date('10/30/1994') };
        dates[1995] = { begin: new Date('04/02/1995'), end: new Date('10/29/1995') };
        dates[1996] = { begin: new Date('04/07/1996'), end: new Date('10/27/1996') };
        dates[1997] = { begin: new Date('04/06/1997'), end: new Date('10/26/1997') };
        dates[1998] = { begin: new Date('04/05/1998'), end: new Date('10/25/1998') };
        dates[1999] = { begin: new Date('04/04/1999'), end: new Date('10/31/1999') };
        dates[2000] = { begin: new Date('04/02/2000'), end: new Date('10/29/2000') };
        dates[2001] = { begin: new Date('04/01/2001'), end: new Date('10/28/2001') };
        dates[2002] = { begin: new Date('04/07/2002'), end: new Date('10/27/2002') };
        dates[2003] = { begin: new Date('04/06/2003'), end: new Date('10/26/2003') };
        dates[2004] = { begin: new Date('04/04/2004'), end: new Date('10/31/2004') };
        dates[2005] = { begin: new Date('04/03/2005'), end: new Date('10/30/2005') };
        dates[2006] = { begin: new Date('04/02/2006'), end: new Date('10/29/2006') };
        dates[2007] = { begin: new Date('03/11/2007'), end: new Date('11/04/2007') };
        dates[2008] = { begin: new Date('03/09/2008'), end: new Date('11/02/2008') };
        dates[2009] = { begin: new Date('03/08/2009'), end: new Date('11/01/2009') };
        dates[2010] = { begin: new Date('03/14/2010'), end: new Date('11/07/2010') };
        dates[2011] = { begin: new Date('03/13/2011'), end: new Date('11/06/2011') };
        dates[2012] = { begin: new Date('03/11/2012'), end: new Date('11/04/2012') };
        dates[2013] = { begin: new Date('03/10/2013'), end: new Date('11/03/2013') };
        dates[2014] = { begin: new Date('03/09/2014'), end: new Date('11/02/2014') };
        dates[2015] = { begin: new Date('03/08/2015'), end: new Date('11/01/2015') };
        dates[2016] = { begin: new Date('03/13/2016'), end: new Date('11/06/2016') };
        dates[2017] = { begin: new Date('03/12/2017'), end: new Date('11/05/2017') };
        dates[2018] = { begin: new Date('03/11/2018'), end: new Date('11/04/2018') };
        dates[2019] = { begin: new Date('03/10/2019'), end: new Date('11/03/2019') };
        dates[2020] = { begin: new Date('03/08/2020'), end: new Date('11/01/2020') };
        dates[2021] = { begin: new Date('03/14/2020'), end: new Date('11/07/2020') };
        dates[2022] = { begin: new Date('03/13/2020'), end: new Date('11/06/2020') };
        dates[2023] = { begin: new Date('03/12/2020'), end: new Date('11/05/2020') };
        dates[2024] = { begin: new Date('03/10/2020'), end: new Date('11/03/2020') };
        dates[2025] = { begin: new Date('03/09/2020'), end: new Date('11/02/2020') };
        // The beginning date is the last day of standard time and the end date is the inclusive last day, so add a day.
        for (let year in dates) {
            let d = dates[year].end;
            d.setDate(d.getDate() + 1);
        }
        this.dates = dates;
        // Known Standard Time Date
        this.standardTimeOffset = (new Date('01/01/2013')).getTimezoneOffset();
        // Known DST Date
        this.daylightTimeOffset = (new Date('06/01/2013')).getTimezoneOffset();
    };
    getTimezoneOffset(date): number {
        let lookup = this.dates[date.getFullYear()];
        if (lookup !== null && lookup !== undefined) {
            if (date > lookup.begin && date < lookup.end)
                return this.daylightTimeOffset;
            else
                return this.standardTimeOffset;
        }
        else {
            return null;
        }
    };
}

export enum DateTimeKind {
    Utc = 1,
    Local = 2
};

export function installDatePolyfills() {
    if (!Date.prototype.getTimezoneOffset_Save) {
        let dst = new DST();
        Date.prototype.getTimezoneOffset_Save = Date.prototype.getTimezoneOffset;
        Date.prototype.getTimezoneOffset = function () {
            let o = dst.getTimezoneOffset(this);
            if (o === null)
                o = Date.prototype.getTimezoneOffset_Save.call(this);
            return o;
        };
    }

    let Date_toString_Save: (format: string) => string = Date.prototype.toString;
    // For documentation on the format specifier visit: http://momentjs.com
    Date.prototype.toString = function (format: string = null): string {
        if (format === undefined || format === null)
            return Date_toString_Save.call(this);
        else
            return moment(this).format(format);
    };

    let Date_toJSON_Save = Date.prototype.toJSON;
    Date.prototype.toJSON = function () {
        if (this.kind === DateTimeKind.Local)
            return moment(this).format('YYYY-MM-DDTHH:mm:ss');
        else //if (this.kind === DateTimeKind.Utc)
            return Date_toJSON_Save.call(this);
        //else
            //throw new Error('The Date object being serialized must define a kind property equal to one of the Date.DateTimeKind enumeration values.');
    };

    Date.prototype.specifyKind = function (dateTimeKind: DateTimeKind) {
        if (dateTimeKind === DateTimeKind.Utc || dateTimeKind === DateTimeKind.Local)
            this.kind = dateTimeKind;
        else
            throw new Error('The dateTimeKind argument must be equal to one of the Date.DateTimeKind enumeration values.');
        return this;
    };

    Date.prototype.createDate = function (dateTimeString: string = null, dateTimeKind: DateTimeKind = null): Date {
        let ret: Date = null;
        if (dateTimeString !== null) {
            // Chrome parses date strings incorrectly.
            let m: moment.Moment = null;
            if (dateTimeString.length === 10) {
                let dateParts = typeof dateTimeString === 'string' ? dateTimeString.split('/') : null;
                if (Array.isArray(dateParts) && dateParts.length === 3 && dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
                    m = moment(dateTimeString, 'MM/DD/YYYY');
                } else {
                    m = moment(dateTimeString);
                }
            } else {
                m = moment(dateTimeString);
            }

            if (dateTimeString.length <= 8 && m.year() < 1970)
                m.year(m.year() + 100);
            if (m !== null && m.isValid()) {
                ret = m.toDate();
                let kind;
                if (dateTimeKind && (dateTimeKind === DateTimeKind.Utc || dateTimeKind === DateTimeKind.Local)) {
                    kind = dateTimeKind;
                } else {
                    let lastChar = dateTimeString[dateTimeString.length - 1];
                    if (lastChar === 'Z' || lastChar === 'z')
                        kind = DateTimeKind.Utc;
                    else
                        kind = DateTimeKind.Local;
                }
                ret.specifyKind(kind);
            } else
                throw new Error('The dateTimeString argument provided is not in a valid format.');
        } else if (dateTimeKind === DateTimeKind.Utc || dateTimeKind === DateTimeKind.Local) {
            ret = new Date();
            ret.specifyKind(dateTimeKind);
        } else {
            throw new Error('You must specify a valid dateTimeString argument and/or a valid dateTimeKind argument.');
        }
        return ret;
    };
    Date.prototype.addDays = function (days: number): Date {
        if (days === null || days === undefined)
            days = 0;
        return moment(this).add(days, 'd').toDate();
    };
    Date.prototype.subtractDays = function (days: number): Date {
        if (days === null || days === undefined)
            days = 0;
        days *= -1;
        return moment(this).add(days, 'd').toDate();
    };
    Date.prototype.addMonths = function (months: number): Date {
        if (months === null || months === undefined)
            months = 0;
        return moment(this).add(months, 'M').toDate();
    };
    Date.prototype.convertFromUTCtoLocal = function () {
        let timeZoneOffset = new Date().getTimezoneOffset();
        this.setMinutes(this.getMinutes() - timeZoneOffset);
    };
}