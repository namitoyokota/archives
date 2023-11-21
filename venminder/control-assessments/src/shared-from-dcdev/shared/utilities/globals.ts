import { LogManager } from "aurelia-framework";
//@ts-ignore
import diacritic from 'diacritic';
import { IEquatable } from "../interfaces/equatable-interface";
import { DateTimeKind } from "./date-helpers";
import { NavigationInstruction } from "aurelia-router";
import { StandardParameterNames } from "../enums/standard-parameter-names";

export var AppLog = LogManager.getLogger('app');

export function startsWith(string: string, start: string): boolean {
    string = diacritic.clean(string).toLowerCase();
    start = diacritic.clean(start).toLowerCase()
    return string.startsWith(start);
};

export function contains(string: string, part: string): boolean {
    string = diacritic.clean(string).toLowerCase();
    part = diacritic.clean(part).toLowerCase()
    return string.indexOf(part) > -1;
};

export function isBoolean(arg): boolean {
    return typeof arg === 'boolean';
}

export function isNullOrEmpty(obj: any): boolean {
    return !obj;
}

export function isNullOrWhitespace(str: string): boolean {
    return isNullOrUndefined(str) || str.trim() == '';
}

export function isUndefined(obj: any): boolean {
    return obj == undefined;
}

export function isNullOrUndefined(obj: any): boolean {
    return obj == null || isUndefined(obj);
}

export function elementAtOrNull<T>(arry: Array<T>, idx: number = 0): T {
    return arry === null ? null : arry.length == 0 ? null : arry[0];
}

export function hasValue(obj: any): boolean {
    if (isNullOrUndefined(obj)) return false;
    return (typeof obj !== 'string' || obj.trim() !== "");
};

export function getTextFromHtml(html: string): string {
    return $('<span></span>').html(html).text();
}

export function hashCode(s: string): number {
    let result = 0;
    for (var i = 0; i < s.length; ++i) {
        result = 31 * result + s.charCodeAt(i);
        // Normalize to 4 byte range, 0 ... 2^32.
        result |= 0;
        if (result < 0) {
            result += 4294967296;
        }
    }
    return result;
};

export function stringsEqual(s1: string, s2: string, normalizeNullStrings: boolean = false, ignoreCase: boolean = false): boolean {
    if (ignoreCase) {
        s1 = isNullOrUndefined(s1) ? null : s1.toLowerCase();
        s2 = isNullOrUndefined(s2) ? null : s2.toLowerCase();
    }

    return normalizeNullStrings
        ? ((s1 || '') == (s2 || ''))
        : s1 == s2;
}

export function objectsEqual<T>(left: IEquatable<T>, right: IEquatable<T>, normalizeNullStrings: boolean): boolean;
export function objectsEqual(left: IEquatable<any>, right: IEquatable<any>, normalizeNullStrings: boolean = false): boolean {
    if ((left || null) === (right || null)) // normalizes undefined to null
        return true;
    if ((left || null) === null && (right || null) !== null)
        return false;
    if ((left || null) !== null && (right || null) === null)
        return false;
    return left.equals(right, normalizeNullStrings);
}

export function datesEqual(left: Date, right: Date, leftPropertyName: string = null, rightPropertyName: string = null) {
    if ((left || null) === (right || null)) // normalizes undefined to null
        return true;
    if ((left || null) === null && (right || null) !== null)
        return false;
    if ((left || null) !== null && (right || null) === null)
        return false;
    if (!left.getTime && !right.getTime)
        throw new Error("The dates to compare are not valid Date objects.")
    if (!left.getTime) {
        leftPropertyName = leftPropertyName || 'left';
        throw new Error(`The ${leftPropertyName} parameter not a valid Date object.`)
    }
    if (!right.getTime) {
        rightPropertyName = rightPropertyName || 'right';
        throw new Error(`The ${rightPropertyName} parameter is not a valid Date object.`)
    }
    return left.getTime() === right.getTime();
}

export function logEqualityFailure(memberName: string, left: any, right: any): false /* The only valid return value is false, so this is declared as false instead of boolean*/ {
    if (AppLog.isDebugEnabled()) {
        let leftValue = left == undefined
            ? 'undefined'
            : left == null
                ? 'null'
                : JSON.stringify(left);
        let rightValue = right == undefined
            ? 'undefined'
            : right == null
                ? 'null'
                : JSON.stringify(right);

        AppLog.debug(`EQUAlITY FAILURE\r\nMember Name: ${memberName}\r\nLeft: ${leftValue}\r\nRight: ${rightValue}`);
    }
    return false;
}

export function parseDate(obj: Date | string = null, propertyName: string = null, kind?: DateTimeKind): Date {
    if (!hasValue(obj))
        return null;
    if (typeof obj === 'string') {
        if (isNullOrUndefined(kind)) {
            return Date.prototype.createDate(obj);
        } else {
            return Date.prototype.createDate(obj, kind);
        }
    }
    if (Object.prototype.toString.call(obj) === '[object Date]') {
        if (isNullOrUndefined(obj.kind)) {
            if (isNullOrUndefined(kind)) {
                obj.specifyKind(DateTimeKind.Utc);
            } else {
                obj.specifyKind(kind);
            }
        }
        return obj;
    }
    propertyName = propertyName || 'obj';
    throw new Error(`${propertyName} must be Date like.`);
}

export function unique(): any {
    return this.reduce(function (previous: any, current: any, index: number, array: Array<any>) {
        previous[current.toString() + typeof (current)] = current;
        return array.length - 1 == index ? Object.keys(previous).reduce(function (prev, cur) {
            prev.push(previous[cur]);
            return prev;
        }, []) : previous;
    }, {});
};

export function toDisplayableString(list: string[]): string {
    if (list.length == 1)
        return list[0];
    if (list.length == 2)
        return list[0] + ' and ' + list[1];

    let result = '';
    list.forEach((pn, idx) => {
        if (idx > 0) {
            if (idx == list.length - 1)
                result = `${result}, and ${pn}`;
            else
                result = `${result}, ${pn}`;
        }
        else
            result = pn;
    });
    return result;
}

export function sortArrayByProperty(collection: any[], propertyName: string, isDescending: boolean = false) {
    collection.sort((left, right) => {
        let l = diacritic.clean(left[propertyName]).toLowerCase();
        let r = diacritic.clean(right[propertyName]).toLowerCase();
        let comparisonResult: number = 0;
        if (l < r) {
            comparisonResult = -1;
        }
        else if (l > r) {
            comparisonResult = 1;
        }
        return isDescending ? comparisonResult * -1 : comparisonResult;
    });
}

export function isGuid(obj: string): boolean {
    if (obj.substr(0, 23) == '00000000-0000-0000-0000')
        return true;

    let guidRegEx: RegExp = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return guidRegEx.test(obj);
}

export function isEmptyGuid(obj: string): boolean {
    return obj == EmptyGuid.empty;
}

export enum EmptyGuid {
    empty = '00000000-0000-0000-0000-000000000000'
}

export function isValidDomainName(name: string): boolean {
    name = name.trim();
    if (name.length < 4 || name.indexOf(' ') >= 0)
        return false;

    var dot = name.lastIndexOf(".");
    if (dot < 0)
        return false;

    var dname = name.substring(0, dot);
    var ext = name.substring(dot);

    if (ext.length < 2)
        return false;

    return true;
}

export function getDelimitedString(array: string[], delimiter: string) {
    let result = '';
    array.forEach((r, idx) => {
        let x = idx == 0 ? r : `, ${r}`;
        result = `${result}${x}`
    });
    return result;
}

export function isValidEmailFormat(value: string) {
    let re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i;
    return re.test(value);
}

export function isMaxDateTime(dateTime: Date | string) {
    return (new Date(dateTime)).getTime() === 253402318799999;
} 

export function getDateString(date: Date = new Date): string {    
    return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + 'T' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.' + date.getMilliseconds();

}

export function getParameterFromNavigationInstruction(instruction: NavigationInstruction, parameterName: StandardParameterNames|string) {
    if (isNullOrUndefined(instruction)) {
        return null;
    }

    if (!isNullOrUndefined(instruction.params)) {
        let paramValue = getValueForKeyFromAny(instruction.params, parameterName);
        if (hasValue(paramValue)) {
            return paramValue;
        }
    }

    if (!isNullOrUndefined(instruction.queryParams)) {
        let paramValue = getValueForKeyFromAny(instruction.queryParams, parameterName);
        if (hasValue(paramValue)) {
            return paramValue;
        }
    }

    if (!isNullOrUndefined(instruction.parentInstruction)) {
        return getParameterFromNavigationInstruction(instruction.parentInstruction, parameterName);
    }

    return null;
}

export function getClientIdFromCurrentNavigationInstruction(instruction: NavigationInstruction): string {
    let routeParams = instruction.fragment.split("/");
    for (let i = 0; i < routeParams.length; i++)
        if (routeParams[i] === "clients")
            return routeParams[i + 1];
    throw "clients path part not found";
}

export function getValueForKeyFromAny(obj: any, key: string, ignoreCase: boolean = true) {
    for (let param in obj) {
        if ((!obj.hasOwnProperty || obj.hasOwnProperty(param)) && stringsEqual(param, key, false, ignoreCase)) {
            return obj[param];
        }
    }
    return null;
}

export function getValueForKeyFromParams(parts: URLSearchParams, key: string, ignoreCase: boolean = true) {
    let result: string = null;
    parts.forEach((v, k) => {
        if (result == null && stringsEqual(k, key, false, ignoreCase)) {
            result = v;
        };
    });
    return result;
}

export function getKeyForKeyFromParams(parts: URLSearchParams, key: string, ignoreCase: boolean = true) {
    let result: string = null;
    parts.forEach((v, k) => {
        if (result == null && stringsEqual(k, key, false, ignoreCase)) {
            result = k;
        };
    });
    return result;
}

export function startPDFRender(timeout: number): Promise<boolean> {
    if ((<any>window).selectpdf && typeof ((<any>window).selectpdf) == "object") {
        AppLog.info("window.selectpdf == 'object'");
    }
    if ((<any>window).clakPdf && typeof ((<any>window).clakPdf) == "object") {
        AppLog.info("window.clakpdf == 'object'");
    }

    if ((<any>window).selectpdf && typeof ((<any>window).selectpdf) == "object") {
        return new Promise<boolean>(resolve => { 
            let outerElms = document.getElementsByClassName("_pendo-badge");
            for (let i = 0; i < outerElms.length; i++) {
                if (!outerElms[i].classList.contains("hide")) {
                    outerElms[i].classList.add("hide");
                }
            }

            window.setTimeout(() => {
                let innerElms = document.getElementsByClassName("_pendo-badge");
                for (let i = 0; i < innerElms.length; i++) {
                    if (!innerElms[i].classList.contains("hide")) {
                        innerElms[i].classList.add("hide");
                    }
                }

                (<any>window).selectpdf.start();
                resolve(true);
            }, timeout);
        });
    }

    return Promise.resolve(false);
}

export function stopPropogation(e: Event, preventDefault: boolean = false): boolean {
    if (e) {
        if (e.stopPropagation) e.stopPropagation();
        if (preventDefault) e.preventDefault();
    }
    return false;
}

export function friendlyJoin(array: string[], elementSeparator: string, finalSeparater: string): string {
    let friendlyString = "";
    if (array.length == 1) {
        friendlyString = array[0];
    } else if (array.length == 2) {
        friendlyString = `${array[0]} ${finalSeparater} ${array[1]}`;
    } else {
        array.forEach((value, index) => {
            if (index == array.length - 1) {
                friendlyString += `${finalSeparater}${value}`;
            } else {
                if (index == 0) {
                    friendlyString += `${value}`;
                } else {
                    friendlyString += `${elementSeparator}${value}`;
                }
            }
        });
    }
    return friendlyString
}

const wait = (timeToDelay) => new Promise((resolve) => setTimeout(resolve, timeToDelay));

export { wait }

const EMDASH_STRING: string = '—';
export { EMDASH_STRING }

export function isFirefox() {
    return (navigator.userAgent.indexOf("Firefox") != -1);
}

export function enumKeyToTitleCase(key: string): string {
    let parts = key.split('_');

    return parts.map((part) => {
        return part.charAt(0).toUpperCase() + part.substr(1).toLowerCase();
    }).join(' ');
}
