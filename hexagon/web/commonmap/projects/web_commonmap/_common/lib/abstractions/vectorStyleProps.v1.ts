import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';

/** Point symbol type */
export enum PointSymbolType {
    SystemDefined = 'SystemDefined',
    Image = 'Image'
}

/** Properties needed for the style of a geometry displayed on the map */
export class VectorStyleProperties$v1 {

    /** Line width */
    lineWidth?: number;

    /** Line Color
     * 
     * The value defines both color and optionally opacity.  The color can be defined as a 6 character hexadecimal number
     * that assumes an opacity of 100% or an 8 character hexadecimal number where the last 2 characters represent
     * the percent opacity. 
     */
    lineColor?: string;

    /** Line Pattern */
    linePattern?: LineType$v1;

    /** Line Opacity */
    lineOpacity?: number;

    /** Flag to indicate fill */
    fill?: boolean;

    /** Fill color */
    fillColor?: string;

    /** Fill Opacity */
    fillOpacity?: number;

    /** Point symbol type */
    pointSymbolType?: PointSymbolType;

    /** Char code for symbol */
    pointSymbolCharCode?: string;

    /** Font */
    pointSymbolFont?: string;

    /** Point symbol font size */
    pointSymbolSize?: number;

    /** Point symbol color */
    pointSymbolColor?: string;

    /** Point symbol opacity */
    pointSymbolOpacity?: number;

    constructor(params = {} as VectorStyleProperties$v1) {
        const {
            lineWidth = 2,
            lineColor = '#0C5F98',
            linePattern = LineType$v1.solid,
            lineOpacity = 1,
            fill = true,
            fillColor = '#2C7FB8',
            fillOpacity = .15,
            pointSymbolType = PointSymbolType.SystemDefined,
            pointSymbolCharCode = '\u00AB',
            pointSymbolFont = 'Wingdings',
            pointSymbolSize = 20,
            pointSymbolColor = '#f67a29',
            pointSymbolOpacity = 1
        } = params;

        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.linePattern = linePattern;
        this.lineOpacity = lineOpacity;
        this.fill = fill;
        this.fillColor = fillColor;
        this.fillOpacity = fillOpacity;
        this.pointSymbolType = pointSymbolType;
        this.pointSymbolCharCode = pointSymbolCharCode;
        this.pointSymbolFont = pointSymbolFont;
        this.pointSymbolSize = pointSymbolSize;
        this.pointSymbolColor = pointSymbolColor;
        this.pointSymbolOpacity = pointSymbolOpacity;
    }

    clone?() {
        return (new VectorStyleProperties$v1(this));
    }

    encode?() {
        this.lineColor = encodeURIComponent(this.lineColor);
        this.fillColor = encodeURIComponent(this.fillColor);
        this.pointSymbolCharCode = encodeURIComponent(this.pointSymbolCharCode);
        this.pointSymbolFont = encodeURIComponent(this.pointSymbolFont);
        this.pointSymbolColor = encodeURIComponent(this.pointSymbolColor);
    }

    decode?() {
        this.lineColor = decodeURIComponent(this.lineColor);
        this.fillColor = decodeURIComponent(this.fillColor);
        this.pointSymbolCharCode = decodeURIComponent(this.pointSymbolCharCode);
        this.pointSymbolFont = decodeURIComponent(this.pointSymbolFont);
        this.pointSymbolColor = decodeURIComponent(this.pointSymbolColor);
    }
}
