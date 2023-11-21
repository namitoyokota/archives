interface String {
    beginningWith(...parms: Array<string>): boolean;
    contains(...parms: Array<string>): boolean;
    endingWith(...parms: Array<string>): boolean;
    equals(...parms: Array<string>): boolean;
    format(...parms: Array<string>): string;
    hasValue(...parms: Array<string>): boolean;
}

interface Number {
    between(...parms: Array<number>): boolean;
    equals(...parms: Array<number>): boolean;
    greaterThan(...parms: Array<number>): boolean;
    greaterThanOrEquals(...parms: Array<number>): boolean;
    hasValue(...parms: Array<string>): boolean;
    lessThan(...parms: Array<number>): boolean;
    lessThanOrEquals(...parms: Array<number>): boolean;
}

interface Date {
    between(...parms: Array<Date>): boolean;
    equals(...parms: Array<Date>): boolean;
    greaterThan(...parms: Array<Date>): boolean;
    greaterThanOrEquals(...parms: Array<Date>): boolean;
    hasValue(...parms: Array<string>): boolean;
    lessThan(...parms: Array<Date>): boolean;
    lessThanOrEquals(...parms: Array<Date>): boolean;
}

interface Boolean {
    hasValue(...parms: Array<string>): boolean;
}

interface Array<T> {
    contains(...parms: Array<string>): boolean;
}

Boolean.prototype.hasValue = function (...parms: Array<string>) {
    return (parms.join('').indexOf(this) >= 0);
}

Array.prototype.contains = function (...parms: Array<string>) {
    return (this.join('').toLowerCase().indexOf(parms[0]) >= 0);
}

String.prototype.beginningWith = function (...parms: Array<string>) {
    return (this.toLowerCase().startsWith(parms[0]));
}

String.prototype.contains = function (...parms: Array<string>) {
    return (this.toLowerCase().indexOf(parms[0]) >= 0);
}

String.prototype.endingWith = function (...parms: Array<string>) {
    return (this.toLowerCase().endsWith(parms[0]));
}

String.prototype.equals = function (...parms: Array<string>) {
    return (this.toLowerCase() == parms[0]);
}

String.prototype.format = function (...parms: Array<string>) {
    let formattedString = this;

    for (const k in parms) {
        formattedString = formattedString.replace("{" + k + "}", parms[k]);
    }
    return formattedString;
}

String.prototype.hasValue = function (...parms: Array<string>) {
    let filterORValues: Array<string> = [];

    for (let i = 0, j = parms[0].length; i < j; i++) {
        filterORValues.push(`(this.toLowerCase().indexOf('${parms[0][i]}')>=0)`);
    }

    return eval(filterORValues.join(' || '));
}

Number.prototype.between = function (...parms: Array<number>) {
    return (this >= parms[0] && this <= parms[1]);
}

Number.prototype.equals = function (...parms: Array<number>) {
    return (this == parms[0]);
}

Number.prototype.greaterThan = function (...parms: Array<number>) {
    return (this > parms[0]);
}

Number.prototype.greaterThanOrEquals = function (...parms: Array<number>) {
    return (this >= parms[0]);
}

Number.prototype.hasValue = function (...parms: Array<string>) {
    return (this.toString().indexOf(parms[0]) >= 0);
}

Number.prototype.lessThan = function (...parms: Array<number>) {
    return (this < parms[0]);
}

Number.prototype.lessThanOrEquals = function (...parms: Array<number>) {
    return (this <= parms[0]);
}

Date.prototype.between = function (...parms: Array<Date>) {
    return ((new Date(this)) >= parms[0] && this <= parms[1]);
}

Date.prototype.equals = function (...parms: Array<Date>) {
    return ((new Date(this)) == parms[0]);
}

Date.prototype.greaterThan = function (...parms: Array<Date>) {
    return ((new Date(this)) > parms[0]);
}

Date.prototype.greaterThanOrEquals = function (...parms: Array<Date>) {
    return ((new Date(this)) >= parms[0]);
}

Date.prototype.hasValue = function (...parms: Array<string>) {
    return (this.toString().indexOf(parms[0]) >= 0);
}

Date.prototype.lessThan = function (...parms: Array<Date>) {
    return ((new Date(this)) < parms[0]);
}

Date.prototype.lessThanOrEquals = function (...parms: Array<Date>) {
    return ((new Date(this)) <= parms[0]);
}