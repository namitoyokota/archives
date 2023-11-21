import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { VectorStyleProperties$v1 } from '@galileo/web_commonmap/_common';
import { LinearAreaStylesTranslationTokens } from './linear-area-styles.translation';
import { ColorType$v1 } from '@galileo/web_common-libraries/graphical/color-selector';
import { LineType$v1 } from '@galileo/web_common-libraries/graphical/line-type';

@Component({
    selector: 'hxgn-commonmap-admin-linear-area-styles',
    templateUrl: './linear-area-styles.component.html',
    styleUrls: ['./linear-area-styles.component.scss']
})
export class LinearAreaStylesComponent implements OnInit, OnChanges {
    @Input() vectorStyleProps: VectorStyleProperties$v1;

    @Output() propertyChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() isValid: EventEmitter<boolean> = new EventEmitter<boolean>();


    /**  Expose translation tokens to html template */
    tokens: typeof LinearAreaStylesTranslationTokens = LinearAreaStylesTranslationTokens;
    colorType: typeof ColorType$v1 = ColorType$v1;
    lineWidth: number;
    lineType: LineType$v1;

    transStrings = {};

    private initialized = false;

    constructor() {
    }
    async ngOnInit() {
        if (this.vectorStyleProps) {

            this.lineWidth = this.vectorStyleProps.lineWidth;
            this.lineWidth = Math.round(this.lineWidth);
            if (this.lineWidth > 5) {
                this.lineWidth = 5;
            }

            if (this.vectorStyleProps.linePattern) {
                this.lineType = this.vectorStyleProps.linePattern;
            }
        }
        this.initialized = true;

    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes.vectorStyleProps && this.initialized) {

            this.lineWidth = this.vectorStyleProps.lineWidth;
            this.lineWidth = Math.round(this.lineWidth);
            if (this.lineWidth > 5) {
                this.lineWidth = 5;
            }

            if (this.vectorStyleProps.linePattern) {
                this.lineType = this.vectorStyleProps.linePattern;
            }
        }
    }

    firePropertyChanged(vectorStyleProps: VectorStyleProperties$v1) {
        this.propertyChanged.emit(vectorStyleProps);
    }

    setIsValid(valid: boolean) {
        this.isValid.emit(valid);
    }

    setLineWidth(width: number) {
        this.vectorStyleProps.lineWidth = width;
        this.lineWidth = width;
        this.firePropertyChanged(this.vectorStyleProps);
    }

    setLineType(lineType: LineType$v1) {
        this.vectorStyleProps.linePattern = lineType;
        this.lineType = lineType;
        this.firePropertyChanged(this.vectorStyleProps);
    }

    setLineColor(color: string) {
        this.vectorStyleProps.lineColor = color;
        this.firePropertyChanged(this.vectorStyleProps);
    }

    setFillColor(color: string) {
        this.vectorStyleProps.fillColor = color;
        this.firePropertyChanged(this.vectorStyleProps);
    }
}
