import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { PointSymbolType, VectorStyleProperties$v1 } from '@galileo/web_commonmap/_common';
import { CommonmapAdminService } from '../../admin.service';
import { PointStylesTranslationTokens } from './point-styles.translation';
import { ColorType$v1 } from '@galileo/web_common-libraries/graphical/color-selector';

@Component({
    selector: 'hxgn-commonmap-admin-point-styles',
    templateUrl: './point-styles.component.html',
    styleUrls: ['./point-styles.component.scss']
})
export class PointStylesComponent implements OnInit, OnChanges {
    @Input() vectorStyleProps: VectorStyleProperties$v1;

    @Output() propertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**  Expose translation tokens to html template */
    tokens: typeof PointStylesTranslationTokens = PointStylesTranslationTokens;

    defaultPointSyms = [
        {font: 'Wingdings', charCode: '\u006C'}, // filled circle
        {font: 'Wingdings', charCode: '\u00A2'}, // open circle
        {font: 'Wingdings', charCode: '\u00A3'}, // washer circle
        {font: 'Wingdings', charCode: '\u00A3'}, // circle with dot
        {font: '\"Wingdings 2\"', charCode: '\u0056'}, // circle with x
        {font: 'Wingdings', charCode: '\u006E'}, // filled box
        {font: 'Wingdings', charCode: '\u00A8'}, // open box
        {font: 'Wingdings', charCode: '\u0075'}, // filled diamond
        {font: 'Wingdings', charCode: '\u00AB'}, // star
        {font: 'Wingdings', charCode: '\u00B5'}, // star in circle
        {font: '\"Wingdings 2\"', charCode: '\u00D1'}, // X
        {font: 'Wingdings', charCode: '\u0051'}, // plane
        {font: 'Wingdings', charCode: '\u0055'}, // open cross
        {font: '\"Wingdings 2\"', charCode: '\u0086'}, // filled cross
        {font: 'Webdings', charCode: '\u0043'}, // city scape
        {font: 'Webdings', charCode: '\u0047'}, // bank
        {font: 'Webdings', charCode: '\u00AE'}, // Theater
        {font: 'Webdings', charCode: '\u00E3'}, // Bed
        {font: 'Webdings', charCode: '\u00E7'}, // Groceries
        {font: 'Webdings', charCode: '\u00EC'}, // College
        {font: 'Webdings', charCode: '\u0066'}, // firetruck
        {font: 'Webdings', charCode: '\u0068'}, // ambulance
        {font: 'Webdings', charCode: '\u0070'}, // police car
        {font: 'Webdings', charCode: '\u0076'} // bus
    ];

    symbolDef: any;
    symbolSize: number;
    symbolSizeStr: string;

    transStrings = {};

    colorType: typeof ColorType$v1 = ColorType$v1;

    private initialized = false;

    constructor() {
    }
    async ngOnInit() {
        if (this.vectorStyleProps) {

            this.symbolDef = this.defaultPointSyms[0];
            if (this.vectorStyleProps.pointSymbolType === PointSymbolType.SystemDefined) {
                const result = this.defaultPointSyms.find(item =>
                        item.charCode === this.vectorStyleProps.pointSymbolCharCode);
                if (result) {
                    this.symbolDef = result;
                }
            }

            this.symbolSize = this.vectorStyleProps.pointSymbolSize;
            this.symbolSizeStr = `${this.symbolSize}px`;
        }

        this.initialized = true;
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.vectorStyleProps && this.initialized) {
            this.symbolDef = this.defaultPointSyms[0];
            if (this.vectorStyleProps.pointSymbolType === PointSymbolType.SystemDefined) {
                const result = this.defaultPointSyms.find(item =>
                        item.charCode === this.vectorStyleProps.pointSymbolCharCode);
                if (result) {
                    this.symbolDef = result;
                }
            }
            this.symbolSize = this.vectorStyleProps.pointSymbolSize;
            this.symbolSizeStr = `${this.symbolSize}px`;
        }
    }

    firePropertyChanged(vectorStyleProps: VectorStyleProperties$v1) {
        this.propertyChanged.emit(vectorStyleProps);
    }

    setIsValid(valid: boolean) {
        this.isValid.emit(valid);
    }

    setSymbolDef(event: any) {
        this.symbolDef = event.value;
        this.vectorStyleProps.pointSymbolCharCode = event.value.charCode;
        this.vectorStyleProps.pointSymbolFont = event.value.font;
        this.firePropertyChanged(this.vectorStyleProps);
    }

    setSymbolSize(event: any) {
        this.symbolSize = event.target.value;
        this.symbolSizeStr = `${this.symbolSize}px`;
        this.vectorStyleProps.pointSymbolSize = event.target.value;
        this.firePropertyChanged(this.vectorStyleProps);
    }

    setSymbolColor(color: string) {
        this.vectorStyleProps.pointSymbolColor = color;
        this.firePropertyChanged(this.vectorStyleProps);
    }
}
