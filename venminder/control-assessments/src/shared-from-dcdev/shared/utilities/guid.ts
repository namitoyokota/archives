// From Jeff Ward's Answer Here: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
class GuidHelper {
    private static decimalToHexLookupTable: string[] = null;
    private static hexToDecimalLookupTable: Map<string, number> = null;

    public static getDecimalToHexLookupTable(): string[] {
        if (GuidHelper.decimalToHexLookupTable == null) {
            GuidHelper.decimalToHexLookupTable = Array(256).fill(undefined).map((_, i) => (i < 16 ? '0' : '') + (i).toString(16));
        }
        return GuidHelper.decimalToHexLookupTable;
    }
    public static getHexToDecimalLookupTable(): Map<string, number> {
        if (GuidHelper.hexToDecimalLookupTable == null) {
            const lut = GuidHelper.getDecimalToHexLookupTable();
            GuidHelper.hexToDecimalLookupTable = new Map<string, number>();
            for (let i = 0; i < lut.length; i++) {
                GuidHelper.hexToDecimalLookupTable.set(lut[i], i);
            }
        }
        return GuidHelper.hexToDecimalLookupTable;
    }
    public static getRandomValuesFunc = window.crypto && window.crypto.getRandomValues ?
        () => {
            const dvals = new Uint32Array(4);
            window.crypto.getRandomValues(dvals);
            return {
                d0: dvals[0],
                d1: dvals[1],
                d2: dvals[2],
                d3: dvals[3],
            };
        } :
        () => ({
            d0: Math.random() * 0x100000000 >>> 0,
            d1: Math.random() * 0x100000000 >>> 0,
            d2: Math.random() * 0x100000000 >>> 0,
            d3: Math.random() * 0x100000000 >>> 0,
        });
}
export class Guid {
    private d0: number = 0;
    private d1: number = 0;
    private d2: number = 0;
    private d3: number = 0;

    constructor(d0: number /*| string*/ = 0, d1: number = 0, d2: number = 0, d3: number = 0) {
        //if (typeof d0 == "string") {
        //    this.parseFromString(d0);
        //}
        //else {
        this.d0 = d0;
        this.d1 = d1;
        this.d2 = d2;
        this.d3 = d3;
        //}
    }

    private parseFromString(str: string) {
        throw new Error("Not implemented");

        //let newString: string = "";
        //for (let i = 0; i < str.length; i++) {
        //    let charCode = str.charCodeAt(i);
        //    if (charCode >= 30 && charCode <= 39)
        //        newString += str[i];
        //}

        //if (newString.length != 32)
        //    throw new Error(`Not a valid Guid string: ${str}`);
    }

    public format(specifier: string = "D") {
        switch (specifier) {
            case "N":
                return this.formatDigitsOnly()
            case "D":
                return this.formatWithHyphens();
            case "B":
                return this.formatWithHyphensAndEnclosed('{', '}');
            case "P":
                return this.formatWithHyphensAndEnclosed('(', ')');
            default:
                throw new Error(`Unknown format specifier: ${specifier}.  Allowed values are "N", "D", "B", and "P".`);
        }
    }

    private formatDigitsOnly() {
        const lut = GuidHelper.getDecimalToHexLookupTable();
        return lut[this.d0 & 0xff] + lut[this.d0 >> 8 & 0xff] + lut[this.d0 >> 16 & 0xff] + lut[this.d0 >> 24 & 0xff] +
            lut[this.d1 & 0xff] + lut[this.d1 >> 8 & 0xff] + lut[this.d1 >> 16 & 0x0f | 0x40] + lut[this.d1 >> 24 & 0xff] +
            lut[this.d2 & 0x3f | 0x80] + lut[this.d2 >> 8 & 0xff] + lut[this.d2 >> 16 & 0xff] + lut[this.d2 >> 24 & 0xff] +
            lut[this.d3 & 0xff] + lut[this.d3 >> 8 & 0xff] + lut[this.d3 >> 16 & 0xff] + lut[this.d3 >> 24 & 0xff];
    }

    private formatWithHyphens() {
        const lut = GuidHelper.getDecimalToHexLookupTable();
        return lut[this.d0 & 0xff] + lut[this.d0 >> 8 & 0xff] + lut[this.d0 >> 16 & 0xff] + lut[this.d0 >> 24 & 0xff] + '-' +
            lut[this.d1 & 0xff] + lut[this.d1 >> 8 & 0xff] + '-' + lut[this.d1 >> 16 & 0x0f | 0x40] + lut[this.d1 >> 24 & 0xff] + '-' +
            lut[this.d2 & 0x3f | 0x80] + lut[this.d2 >> 8 & 0xff] + '-' + lut[this.d2 >> 16 & 0xff] + lut[this.d2 >> 24 & 0xff] +
            lut[this.d3 & 0xff] + lut[this.d3 >> 8 & 0xff] + lut[this.d3 >> 16 & 0xff] + lut[this.d3 >> 24 & 0xff];
    }

    private formatWithHyphensAndEnclosed(beginning: string, ending: string) {
        return `${beginning}${this.formatWithHyphens()}${ending}`;
    }

    public toString(): string {
        return this.format("D");
    }

    public static newGuid(): Guid {
        let vals = GuidHelper.getRandomValuesFunc();
        return new Guid(vals.d0, vals.d1, vals.d2, vals.d3);
    }

}